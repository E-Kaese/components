// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { FrameWindow } from './interfaces';
import { createVirtualIndices } from './utils';

const PENDING_ITEM_SIZES_WARNING_DELAY_MS = 1000;

interface VirtualFrameProps<Item extends object> {
  trackBy?: keyof Item | ((item: Item) => string);
  defaultItemSize: number;
}

/**
 * A data structure to maintain items / virtual frame relation.
 */
export class VirtualFrame<Item extends object> {
  private _frameStart = 0;
  private _frameSize = 0;
  private _overscan = 0;
  private _indices: readonly number[] = [];
  private _items: readonly Item[] = [];
  private _defaultItemSize: number;
  private _cachedItemSizesByIndex: (number | null)[] = [];
  private _cachedItemSizesByTrackedProperty = new Map<any, number>();
  private _pendingItemSizes = new Set<number>();
  private _pendingItemsSizesWarningTimeout: null | number = null;
  private _sizeBefore = 0;
  private _sizeAfter = 0;
  private trackBy: (item: Item) => any;

  constructor({ defaultItemSize, trackBy }: VirtualFrameProps<Item>) {
    this._defaultItemSize = defaultItemSize;

    // When no explicit trackBy provided default to identity function - the items will be matched by reference.
    // When the item identity is not maintained it is not possible to keep the cached sizes which may result
    // in scrollbar size "jumps" (when the item size differs from the default) that can be otherwise avoided.
    this.trackBy = item => item;
    if (typeof trackBy === 'string') {
      this.trackBy = item => item[trackBy];
    }
    if (typeof trackBy === 'function') {
      this.trackBy = trackBy;
    }
  }

  public get frameStart() {
    return this._frameStart;
  }
  public get frameSize() {
    return this._frameSize;
  }
  public get overscan() {
    return this._overscan;
  }
  public get indices(): readonly number[] {
    return this._indices;
  }
  public get defaultItemSize() {
    return this._defaultItemSize;
  }
  public get totalSize() {
    return this._items.length;
  }
  public get frameWindow(): FrameWindow {
    return { frame: this.indices, sizeBefore: this._sizeBefore, sizeAfter: this._sizeAfter };
  }

  public getSizeUntil(index: number) {
    let sizeUntilIndex = 0;
    for (let i = 0; i < index; i++) {
      sizeUntilIndex += this.getSizeForIndex(i);
    }
    return sizeUntilIndex;
  }

  public getAverageItemSize() {
    let totalSize = 0;
    let knownSizes = 0;
    for (let i = 0; i < this.totalSize; i++) {
      const itemSize = this._cachedItemSizesByIndex[i];
      if (itemSize !== null) {
        totalSize += itemSize;
        knownSizes++;
      }
    }
    return totalSize / knownSizes;
  }

  // The "ready" state means all item sizes for the current frame have been set with "setItemSize".
  // Non-ready state is possible for a short period of time during the next frame rendering.
  // If the non-ready state persists it is likely to indicate a misuse of the utility.
  public isReady() {
    return this._pendingItemSizes.size === 0;
  }

  // TODO: automatically update frame and request item sizes if new items are added within current virtual frame.
  public setItems(items: readonly Item[]) {
    this._items = items;
    this.updateCachedSizes();
  }

  public setDefaultItemSize(defaultItemSize: number) {
    this._defaultItemSize = defaultItemSize;
    this.updateCachedSizes();
  }

  public setItemSize(index: number, size: number) {
    const item = this._items[index];
    if (!item) {
      throw new Error('Invariant violation: item index is out of bounds.');
    }
    this._pendingItemSizes.delete(index);
    this._cachedItemSizesByIndex[index] = size;
    this._cachedItemSizesByTrackedProperty.set(this.trackBy(item), size);

    if (this.isReady() && this._pendingItemsSizesWarningTimeout) {
      clearTimeout(this._pendingItemsSizesWarningTimeout);
      this._pendingItemsSizesWarningTimeout = null;
    }
  }

  public updateFrame({
    frameStart = this.frameStart,
    frameSize = this.frameSize,
    overscan = this.overscan,
  }: {
    frameStart?: number;
    frameSize?: number;
    overscan?: number;
  }): boolean {
    const lastFrameIndex = this._indices[this._indices.length - 1] ?? -1;
    if (
      this._frameStart === frameStart &&
      this._frameSize === frameSize &&
      this._overscan === overscan &&
      lastFrameIndex < this.totalSize
    ) {
      return false;
    }

    this._frameStart = frameStart;
    this._frameSize = frameSize;
    this._overscan = overscan;
    this._indices = createVirtualIndices({ frameStart, frameSize, overscan, totalSize: this.totalSize });

    this._sizeBefore = 0;
    for (let i = 0; i < this.indices[0] && i < this.totalSize; i++) {
      this._sizeBefore += this.getSizeForIndex(i);
    }
    this._sizeAfter = 0;
    for (let i = this.indices[this.indices.length - 1] + 1; i < this.totalSize; i++) {
      this._sizeAfter += this.getSizeForIndex(i);
    }

    if (this._pendingItemsSizesWarningTimeout) {
      clearTimeout(this._pendingItemsSizesWarningTimeout);
    }
    this._pendingItemSizes = new Set([...this._indices]);
    this._pendingItemsSizesWarningTimeout = setTimeout(() => {
      console.warn('[AwsUi] [Virtual scroll] Reached pending item sizes warning timeout.');
    }, PENDING_ITEM_SIZES_WARNING_DELAY_MS);

    return true;
  }

  public getFramePropsForContainerSize(containerSize: number): { frameSize: number; overscan: number } {
    if (this.totalSize === 0) {
      return { frameSize: 0, overscan: 0 };
    }

    const itemSizesMinToMax: number[] = [];
    for (const size of this._cachedItemSizesByIndex) {
      itemSizesMinToMax.push(size ?? this.defaultItemSize);
    }
    itemSizesMinToMax.sort((a, b) => a - b);

    let frameSize = 0;
    let overscan = 0;

    // TODO: allow frameSize to shrink when the diff is at least 50%.
    let contentSize = 0;
    for (let i = 0; i < itemSizesMinToMax.length; i++) {
      contentSize += itemSizesMinToMax[i];
      if (contentSize > containerSize) {
        frameSize = Math.max(this.frameSize, i + 1);
        break;
      }
    }

    // TODO: use precise overscan calculation to minimize max frame size.
    let minItemSize = this.getSizeForIndex(this.frameStart);
    let maxItemSize = this.getSizeForIndex(this.frameStart);
    for (let i = this.frameStart; i < Math.max(this.totalSize, this.frameStart + this.frameSize); i++) {
      minItemSize = Math.min(minItemSize, this.getSizeForIndex(i));
      maxItemSize = Math.max(maxItemSize, this.getSizeForIndex(i));
    }
    overscan = 1 + Math.ceil(maxItemSize / minItemSize);

    return { frameSize, overscan };
  }

  private getSizeForIndex(index: number) {
    return this._cachedItemSizesByIndex[index] ?? this.defaultItemSize;
  }

  private updateCachedSizes() {
    this._cachedItemSizesByIndex = [];
    for (let i = 0; i < this._items.length; i++) {
      const item = this._items[i];
      const cachedSize = this._cachedItemSizesByTrackedProperty.get(this.trackBy(item));
      this._cachedItemSizesByIndex.push(cachedSize ?? null);
    }
  }
}
