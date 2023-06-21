// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createVirtualIndices } from './utils';

interface VirtualFrameProps<Item extends object> {
  trackBy?: keyof Item | ((item: Item) => string);
  defaultItemSize: number;
}

export class VirtualFrame<Item extends object> {
  private _frameStart = 0;
  private _frameSize = 0;
  private _overscan = 0;
  private _indices: readonly number[] = [];
  private _items: readonly Item[] = [];
  private _defaultItemSize: number;
  private _cachedItemSizesByIndex: number[] = [];
  private _cachedItemSizesByTrackedProperty = new Map<any, number>();
  private _pendingItemSizes = new Set<number>();
  private _sizeBefore = 0;
  private _sizeAfter = 0;
  private trackBy: (item: Item) => any;

  constructor({ defaultItemSize, trackBy }: VirtualFrameProps<Item>) {
    this._defaultItemSize = defaultItemSize;

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
  public isReady() {
    return this._pendingItemSizes.size === 0;
  }
  public get allItemSizes(): readonly number[] {
    return this._cachedItemSizesByIndex;
  }
  public get sizeBefore() {
    return this._sizeBefore;
  }
  public get sizeAfter() {
    return this._sizeAfter;
  }
  public getItemSize(index: number) {
    return this._cachedItemSizesByIndex[index];
  }

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
  }

  public updateFrame({
    frameStart = this.frameStart,
    frameSize = this.frameSize,
    overscan = this.overscan,
  }: {
    frameStart?: number;
    frameSize?: number;
    overscan?: number;
  }) {
    this._frameStart = frameStart;
    this._frameSize = frameSize;
    this._overscan = overscan;
    this._indices = createVirtualIndices({ frameStart, frameSize, overscan, totalSize: this.totalSize });
    this._pendingItemSizes = new Set([...this._indices]);

    this._sizeBefore = 0;
    for (let i = 0; i < this.indices[0] && i < this.totalSize; i++) {
      this._sizeBefore += this.getItemSize(i);
    }
    this._sizeAfter = 0;
    for (let i = this.indices[this.indices.length - 1] + 1; i < this.totalSize; i++) {
      this._sizeAfter += this.getItemSize(i);
    }
  }

  private updateCachedSizes() {
    this._cachedItemSizesByIndex = [];
    for (let i = 0; i < this._items.length; i++) {
      const item = this._items[i];
      const cachedSize = this._cachedItemSizesByTrackedProperty.get(this.trackBy(item));
      this._cachedItemSizesByIndex.push(cachedSize ?? this._defaultItemSize);
    }
  }
}
