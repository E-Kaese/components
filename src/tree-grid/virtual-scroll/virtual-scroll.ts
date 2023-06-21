// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { throttle } from '../../internal/utils/throttle';
import { DimensionResizeObserver } from './dimension-resize-observer';
import { VirtualFrame } from './virtual-frame';

const SCROLL_THROTTLE_MS = 10;

interface VirtualScrollProps<Item> {
  items: readonly Item[];
  horizontal: boolean;
  defaultItemSize: number;
  scrollContainer: HTMLElement;
  onFrameChange: (props: FrameProps) => void;
  trackBy?: keyof Item | ((item: Item) => string);
}

interface FrameProps {
  frame: readonly number[];
  sizeBefore: number;
  sizeAfter: number;
}

export class VirtualScrollModel<Item extends object> {
  // Props
  public readonly horizontal: boolean;
  public readonly scrollContainer: HTMLElement;
  private onFrameChange: (props: FrameProps) => void;

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

    let scrollValue = 0;
    for (let i = 0; i < index; i++) {
      scrollValue += this.frame.getItemSize(i);
    }

    const property = this.horizontal ? 'scrollLeft' : 'scrollTop';
    this.scrollContainer[property] = scrollValue;
  };

  private applyUpdate() {
    const framePropsChanged = this.updateFrameSizeAndOverscan();

    if (framePropsChanged) {
      // TODO: ??? - take frame from framePropsChanged?
      this.frame.updateFrame({});

      this.onFrameChange({
        frame: this.frame.indices,
        sizeBefore: this.frame.sizeBefore,
        sizeAfter: this.frame.sizeAfter,
      });
    }
  }

  private updateFrameSizeAndOverscan(): boolean {
    const currentFrameSize = this.frame.frameSize;
    const currentOverscan = this.frame.overscan;

    const itemSizesMinToMax = [...this.frame.allItemSizes];
    itemSizesMinToMax.sort((a, b) => a - b);

    const rect = this.scrollContainer.getBoundingClientRect();
    const containerWidth = Math.min(rect.width, window.innerWidth - rect.left);
    const containerHeight = Math.min(rect.height, window.innerHeight - rect.top);
    const containerSize = this.horizontal ? containerWidth : containerHeight;

    let frameSize = 0;
    let overscan = 0;

    let contentSize = 0;
    for (let i = 0; i < itemSizesMinToMax.length; i++) {
      contentSize += itemSizesMinToMax[i];
      if (contentSize > containerSize) {
        frameSize = Math.max(this.frame.frameSize, i + 1);
        break;
      }
    }

    let minItemSize = this.frame.getItemSize(this.frame.frameStart);
    let maxItemSize = this.frame.getItemSize(this.frame.frameStart);
    for (
      let i = this.frame.frameStart;
      i < Math.max(this.frame.totalSize, this.frame.frameStart + this.frame.frameSize);
      i++
    ) {
      // TODO: ensure size always defined and remove IF
      const itemSize = this.frame.getItemSize(i);
      if (itemSize !== undefined) {
        minItemSize = Math.min(minItemSize, itemSize);
        maxItemSize = Math.max(maxItemSize, itemSize);
      }
    }

    // TODO: use precise overscan calculation to minimize max frame size.
    overscan = 1 + Math.ceil(maxItemSize / minItemSize);
    // this.overscan = Math.max(this.overscan, Math.ceil(maxItemSize / minItemSize));

    const updated = currentFrameSize !== frameSize || currentOverscan !== overscan;

    // TODO: don't update it here
    if (updated) {
      this.frame.updateFrame({ frameSize, overscan });
    }

    return updated;
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

    let totalSize = 0;
    let knownSizes = 0;

    for (let i = 0; i < this.frame.totalSize; i++) {
      // TODO: ensure itemSize is always defined and remove IF
      // TODO: only consider known sizes??
      const itemSize = this.frame.getItemSize(i);
      if (itemSize) {
        totalSize += itemSize;
        knownSizes++;
      }
    }
    const averageItemSize = totalSize / knownSizes;

    this.updateFrameSizeAndOverscan();

    let frameStart = Math.round(scrollValue / averageItemSize);
    frameStart = Math.max(0, Math.min(this.frame.totalSize - this.frame.frameSize, frameStart));

    this.frame.updateFrame({ frameStart });

    this.onFrameChange({
      frame: this.frame.indices,
      sizeBefore: this.frame.sizeBefore,
      sizeAfter: this.frame.sizeAfter,
    });
  }, SCROLL_THROTTLE_MS);
}
