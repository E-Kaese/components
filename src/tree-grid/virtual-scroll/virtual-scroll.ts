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

    this.frame = new VirtualFrame<Item>({ defaultItemSize, trackBy });

    scrollContainer.addEventListener('scroll', this.handleScroll);
    this.cleanupCallbacks.push(() => scrollContainer.removeEventListener('scroll', this.handleScroll));

    const dimensionObserver = new DimensionResizeObserver({ horizontal, onSizeChange: this.applyUpdate.bind(this) });
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
    this.frame.setItems(items);
    this.applyUpdate();
  }

  public setDefaultItemSize(defaultItemSize: number) {
    this.frame.setDefaultItemSize(defaultItemSize);
    this.applyUpdate();
  }

  public setItemSize(index: number, size: number) {
    this.frame.setItemSize(index, size);
  }

  public scrollToIndex = (index: number) => {
    index = Math.min(this.frame.totalSize, Math.max(0, index));

    const property = this.horizontal ? 'scrollLeft' : 'scrollTop';
    this.scrollContainer[property] = this.frame.getSizeUntil(index);
  };

  private applyUpdate() {
    const containerSize = this.getContainerSize();
    const frameProps = this.frame.getFramePropsForContainerSize(containerSize);
    const updated = this.frame.updateFrame(frameProps);

    if (updated) {
      this.onFrameChange(this.frame.frameWindow);
    }
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

    const containerSize = this.getContainerSize();
    const frameProps = this.frame.getFramePropsForContainerSize(containerSize);

    this.frame.updateFrame({ ...frameProps, frameStart });

    this.onFrameChange(this.frame.frameWindow);
  }, SCROLL_THROTTLE_MS);
}
