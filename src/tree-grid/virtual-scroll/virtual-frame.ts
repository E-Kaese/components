// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createFrame } from './utils';

interface VirtualFrameProps<Item extends object> {
  trackBy?: keyof Item | ((item: Item) => string);
  defaultItemSize: number;
}

export class VirtualFrame<Item extends object> {
  private _frameStart = 0;
  private _frameSize = 0;
  private _overscan = 0;
  private _frame: readonly number[] = [];
  private _items: readonly Item[] = [];
  private _defaultItemSize: number;
  private trackBy: (item: Item) => any;

  public get frameStart() {
    return this._frameStart;
  }
  public get frameSize() {
    return this._frameSize;
  }
  public get overscan() {
    return this._overscan;
  }
  public get frame() {
    return this._frame;
  }
  public get items() {
    return this._items;
  }
  public get defaultItemSize() {
    return this._defaultItemSize;
  }

  private _cachedItemSizesByIndex: number[] = [];
  private _cachedItemSizesByTrackedProperty = new Map<any, number>();
  private _pendingItemSizes = new Set<number>();

  public getItemSize(index: number) {
    return this._cachedItemSizesByIndex[index];
  }

  public isReady() {
    return this._pendingItemSizes.size === 0;
  }

  public getAllItemSizes() {
    return [...this._cachedItemSizesByIndex];
  }

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

  public setItems(items: readonly Item[]) {
    this._items = items;
    this.updateCachedSizes();
  }

  public setDefaultItemSize(defaultItemSize: number) {
    this._defaultItemSize = defaultItemSize;
    this.updateCachedSizes();
  }

  public setItemSize(index: number, size: number) {
    const item = this.items[index];
    if (!item) {
      throw new Error('Invariant violation: item index is out of bounds.');
    }
    this._pendingItemSizes.delete(index);
    this._cachedItemSizesByIndex[index] = size;
    this._cachedItemSizesByTrackedProperty.set(this.trackBy(item), size);
  }

  public setFrame({ frameStart, frameSize, overscan }: { frameStart: number; frameSize: number; overscan: number }) {
    this._frameStart = frameStart;
    this._frameSize = frameSize;
    this._overscan = overscan;
    this._frame = createFrame({ frameStart, frameSize, overscan, size: this.items.length });
    this._pendingItemSizes = new Set([...this._frame]);
  }

  private updateCachedSizes() {
    this._cachedItemSizesByIndex = [];
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      const cachedSize = this._cachedItemSizesByTrackedProperty.get(this.trackBy(item));
      this._cachedItemSizesByIndex.push(cachedSize ?? this._defaultItemSize);
    }
  }
}
