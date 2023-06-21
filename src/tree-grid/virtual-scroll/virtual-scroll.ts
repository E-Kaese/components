// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { throttle } from '../../internal/utils/throttle';
import { DimensionResizeObserver } from './dimension-resize-observer';
import { FrameWindow } from './interfaces';
import { VirtualFrame } from './virtual-frame';

const SCROLL_THROTTLE_MS = 10;

interface VirtualScrollProps<Item> {
  items: readonly Item[];
  horizontal: boolean;
  defaultItemSize: number;
  scrollContainer: HTMLElement;
  onFrameChange: (props: FrameWindow) => void;
  trackBy?: keyof Item | ((item: Item) => string);
}

export class VirtualScrollModel<Item extends object> {
  // Props
  public readonly horizontal: boolean;
  public readonly scrollContainer: HTMLElement;
  private onFrameChange: (props: FrameWindow) => void;

  // State
  private frame: VirtualFrame<Item>;
  private scrollTop = 0;
  private scrollLeft = 0;
  private cleanupCallbacks: (() => void)[] = [];

  constructor({ horizontal, defaultItemSize, scrollContainer, onFrameChange, trackBy }: VirtualScrollProps<Item>) {
    this.horizontal = horizontal;
    this.scrollContainer = scrollContainer;
    this.onFrameChange = onFrameChange;

    const containerSize = this.getContainerSize();
    this.frame = new VirtualFrame<Item>({ containerSize, defaultItemSize, trackBy });

    scrollContainer.addEventListener('scroll', this.handleScroll);
    this.cleanupCallbacks.push(() => scrollContainer.removeEventListener('scroll', this.handleScroll));

    const dimensionObserver = new DimensionResizeObserver({ horizontal, onSizeChange: this.onSizeChange.bind(this) });
    dimensionObserver.observe(scrollContainer);
    this.cleanupCallbacks.push(() => dimensionObserver.disconnect());
  }

  public cleanup = () => {
    for (const cb of this.cleanupCallbacks) {
      try {
        cb();
      } catch (error: unknown) {
        console.warn(error instanceof Error ? error.message : error);
      }
    }
  };

  public setItems(items: readonly Item[]) {
    const nextFrame = this.frame.setItems(items);
    nextFrame && this.onFrameChange(nextFrame);
  }

  public setDefaultItemSize(defaultItemSize: number) {
    const nextFrame = this.frame.setDefaultItemSize(defaultItemSize);
    nextFrame && this.onFrameChange(nextFrame);
  }

  public setItemSize(index: number, size: number) {
    this.frame.setItemSize(index, size);
  }

  // TODO: test this with variable item sizes: the scrollValue and frameStart are expected to be in sync
  // so that the scroll target is always the first element unless there are not many elements at the beginning.
  public scrollToIndex = (index: number) => {
    index = Math.min(this.frame.totalSize, Math.max(0, index));

    const property = this.horizontal ? 'scrollLeft' : 'scrollTop';
    this.scrollContainer[property] = this.frame.getSizeUntil(index);

    this.frame.setFrameStart(index);
  };

  private onSizeChange() {
    const containerSize = this.getContainerSize();
    const nextFrame = this.frame.setContainerSize(containerSize);
    nextFrame && this.onFrameChange(nextFrame);
  }

  private getContainerSize() {
    const rect = this.scrollContainer.getBoundingClientRect();
    const containerWidth = Math.min(rect.width, window.innerWidth - rect.left);
    const containerHeight = Math.min(rect.height, window.innerHeight - rect.top);
    const containerSize = this.horizontal ? containerWidth : containerHeight;
    return containerSize;
  }

  private handleScroll = throttle((event: Event) => {
    if (!this.frame.isReady()) {
      return;
    }

    const property = this.horizontal ? 'scrollLeft' : 'scrollTop';
    const scrollValue = (event.target as HTMLElement)[property];

    if (this[property] === scrollValue) {
      return;
    }
    this[property] = scrollValue;

    const averageItemSize = this.frame.getAverageItemSize();
    let frameStart = Math.round(scrollValue / averageItemSize);
    frameStart = Math.max(0, Math.min(this.frame.totalSize - this.frame.frameSize, frameStart));

    const nextFrame = this.frame.setFrameStart(frameStart);
    nextFrame && this.onFrameChange(nextFrame);
  }, SCROLL_THROTTLE_MS);
}
