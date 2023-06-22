// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { FrameUpdate } from './interfaces';
import { createVirtualIndices } from './utils';

const PENDING_ITEM_SIZES_WARNING_DELAY_MS = 1000;

interface VirtualFrameProps<Item extends object> {
  containerSize: number;
  defaultItemSize: number;
  onSizesUpdated: () => void;
  trackBy?: keyof Item | ((item: Item) => string);
}

/**
 * A data structure to maintain items / virtual frame relation.
 */
export class VirtualFrame<Item extends object> {
  private _containerSize: number;
  private _defaultItemSize: number;
  private _frameStart = 0;
  private _frameSize = 0;
  private _overscan = 0;
  private _indices: readonly number[] = [];
  private _items: readonly Item[] = [];
  private _cachedItemSizesByIndex: (number | null)[] = [];
  private _cachedItemSizesByTrackedProperty = new Map<any, number>();
  private _pendingItemSizes = new Set<number>();
  private _pendingItemsSizesWarningTimeout: null | number = null;
  private onSizesUpdated: () => void;
  private trackBy: (item: Item) => any;

  constructor({ containerSize, defaultItemSize, onSizesUpdated, trackBy }: VirtualFrameProps<Item>) {
    this._containerSize = containerSize;
    this._defaultItemSize = defaultItemSize;
    this.onSizesUpdated = onSizesUpdated;

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

  public get containerSize() {
    return this._containerSize;
  }
  public get defaultItemSize() {
    return this._defaultItemSize;
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
  public get totalSize() {
    return this._items.length;
  }

  public getScrollOffset(index: number) {
    let scrollOffset = 0;
    for (let i = 0; i < index; i++) {
      scrollOffset += this.getSizeForIndex(i);
    }
    if (index > this._frameStart) {
      for (let i = index; i < this.totalSize; i++) {
        scrollOffset += this.getSizeForIndex(i);
      }
    }
    return scrollOffset;
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

  public setItems(items: readonly Item[]): FrameUpdate {
    this._items = items;
    this.updateCachedSizes();
    return this.updateFrameIfNeeded();
  }

  public setContainerSize(containerSize: number): FrameUpdate {
    this._containerSize = containerSize;
    return this.updateFrameIfNeeded();
  }

  public setDefaultItemSize(defaultItemSize: number): FrameUpdate {
    this._defaultItemSize = defaultItemSize;
    return this.updateFrameIfNeeded();
  }

  public setFrameStart(frameStart: number): FrameUpdate {
    return this.updateFrame({ frameStart });
  }

  public setItemSize(index: number, size: number) {
    const item = this._items[index];
    if (!item) {
      throw new Error('Invariant violation: item index is out of bounds.');
    }

    if (this.isReady()) {
      this.setupPendingItems();
    }

    this._pendingItemSizes.delete(index);
    this._cachedItemSizesByIndex[index] = size;
    this._cachedItemSizesByTrackedProperty.set(this.trackBy(item), size);

    if (this.isReady() && this._pendingItemsSizesWarningTimeout) {
      this.onSizesUpdated();
      clearTimeout(this._pendingItemsSizesWarningTimeout);
      this._pendingItemsSizesWarningTimeout = null;
    }
  }

  public updateFrameIfNeeded(): FrameUpdate {
    if (this.totalSize === 0) {
      return this.updateFrame({ frameSize: 0, overscan: 0 });
    }

    // TODO: allow frameSize to shrink when the diff is at least 50%.
    const itemSizesMinToMax: number[] = [];
    for (const size of this._cachedItemSizesByIndex) {
      itemSizesMinToMax.push(size ?? this.defaultItemSize);
    }
    itemSizesMinToMax.sort((a, b) => a - b);
    let frameSize = 0;
    let overscan = 0;
    let contentSize = 0;
    for (let i = 0; i < itemSizesMinToMax.length; i++) {
      contentSize += itemSizesMinToMax[i];
      if (contentSize > this.containerSize) {
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

    return this.updateFrame({ frameSize, overscan });
  }

  private updateFrame({
    frameStart = this.frameStart,
    frameSize = this.frameSize,
    overscan = this.overscan,
  }: {
    frameStart?: number;
    frameSize?: number;
    overscan?: number;
  }): FrameUpdate {
    frameStart = Math.max(0, Math.min(this.totalSize - this.frameSize, frameStart));

    // The frame does not need to be updated when input parameters are the same.
    const lastFrameIndex = this._indices[this._indices.length - 1] ?? -1;
    const shouldUpdateIndices = !(
      this._frameStart === frameStart &&
      this._frameSize === frameSize &&
      this._overscan === overscan &&
      lastFrameIndex < this.totalSize
    );

    // Update frame props and frame window.
    this._frameStart = frameStart;
    this._frameSize = frameSize;
    this._overscan = overscan;
    this._indices = createVirtualIndices({ frameStart, frameSize, overscan, totalSize: this.totalSize });

    let sizeBefore = 0;
    for (let i = 0; i < this._indices[0] && i < this.totalSize; i++) {
      sizeBefore += this.getSizeForIndex(i);
    }
    let sizeAfter = 0;
    for (let i = this._indices[this._indices.length - 1] + 1; i < this.totalSize; i++) {
      sizeAfter += this.getSizeForIndex(i);
    }

    // TODO: is this needed here?
    // this.setupPendingItems();

    return { frame: shouldUpdateIndices ? this._indices : null, sizeBefore, sizeAfter };
  }

  private setupPendingItems() {
    if (this._pendingItemsSizesWarningTimeout) {
      clearTimeout(this._pendingItemsSizesWarningTimeout);
    }
    this._pendingItemSizes = new Set([...this._indices]);
    this._pendingItemsSizesWarningTimeout = setTimeout(() => {
      console.warn('[AwsUi] [Virtual scroll] Reached pending item sizes warning timeout.');
    }, PENDING_ITEM_SIZES_WARNING_DELAY_MS);
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
