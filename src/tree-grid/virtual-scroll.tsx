// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useRef, useState } from 'react';

interface VirtualModelProps {
  size: number;
  horizontal?: boolean;
  defaultItemSize: number;
  getContainer: () => null | HTMLElement;
  onScrollPropsChange: (props: ScrollProps) => void;
  onFrameChange: (props: FrameProps) => void;
}

export interface ScrollProps {
  sizeBefore: number;
  sizeAfter: number;
}

interface FrameProps {
  frame: number[];
  sizeBefore: number;
  sizeAfter: number;
}

export interface Virtualizer {
  frame: number[];
  setItemRef: (index: number, node: null | HTMLElement) => void;
  scrollToIndex: (index: number) => void;
}

export function useVirtualScroll(props: Omit<VirtualModelProps, 'onFrameChange'>): Virtualizer {
  // TODO: use better defaults
  const [frame, setFrame] = useState(createFrame({ frameStart: 0, frameSize: 0, overscan: 0, size: props.size }));

  const itemRefs = useRef<{ [index: number]: null | HTMLElement }>({});

  // TODO: init in useEffect to avoid calling state from useState callback?
  const [model] = useState(() => {
    return new VirtualScrollModel({
      ...props,
      onFrameChange: ({ frame, ...scrollProps }) => {
        setFrame(frame);

        props.onScrollPropsChange(scrollProps);
      },
      onScrollPropsChange: scrollProps => {
        props.onScrollPropsChange(scrollProps);
      },
    });
  });
  useEffect(() => {
    return () => {
      model.destroy();
    };
  }, [model]);

  const setItemRef = useCallback(
    (index: number, node: null | HTMLElement) => {
      itemRefs.current[index] = node;
      if (node) {
        const property = model.horizontal ? 'width' : 'height';
        model.setItemSize(index, node.getBoundingClientRect()[property]);
      }
    },
    [model]
  );

  // TODO: consider collection change instead of its size change
  useEffect(() => {
    model.setSize(props.size);
  }, [model, props.size]);

  return {
    frame,
    setItemRef,
    scrollToIndex: model.scrollToIndex,
  };
}

function createFrame({
  frameStart,
  frameSize,
  overscan,
  size,
}: {
  frameStart: number;
  frameSize: number;
  overscan: number;
  size: number;
}): number[] {
  const frame: number[] = [];
  for (let i = Math.max(0, frameStart - overscan); i < frameStart + frameSize && i < size; i++) {
    frame.push(i);
  }
  return frame;
}

export class VirtualScrollModel {
  // Props
  public size: number;
  public defaultItemSize: number;
  public readonly horizontal: boolean;
  private getContainer: () => null | HTMLElement;
  private onScrollPropsChange: (props: ScrollProps) => void;
  private onFrameChange: (props: FrameProps) => void;

  // State
  private frameSize = 0;
  private overscan = 0;
  private frameStart = 0;
  private evaluatedItemSizes: number[] = [];
  private pendingItemSizes = new Set<number>();
  private initialized = false;
  private scrollTop = 0;
  private scrollLeft = 0;

  // Other
  private onScrollListener: null | ((event: Event) => void) = null;
  private resizeObserver: null | ResizeObserver = null;
  private lastObservedContainerSize = -1;

  constructor({
    size,
    horizontal,
    defaultItemSize,
    getContainer,
    onScrollPropsChange,
    onFrameChange,
  }: VirtualModelProps) {
    this.size = size;
    this.defaultItemSize = defaultItemSize;
    this.horizontal = horizontal ?? false;
    this.getContainer = getContainer;
    this.onScrollPropsChange = onScrollPropsChange;
    this.onFrameChange = onFrameChange;

    this.init();
  }

  public setItemSize(index: number, size: number) {
    this.pendingItemSizes.delete(index);
    this.evaluatedItemSizes[index] = size;
  }

  public setSize(size: number) {
    this.init();

    this.size = size;

    this.updateAllFrameSizes();

    // const frame = createFrame({ frameStart: this.frameStart, frameSize: this.frameSize, size });
    // this.pendingItemSizes = new Set();
    // for (const f of frame) {
    //   this.pendingItemSizes.add(f);
    // }

    this.applyUpdate();
  }

  // public setFrameSize(frameSize: number) {
  //   this.init();

  //   this.frameSize = frameSize;

  //   this.updateAllFrameSizes();

  //   // const frame = createFrame({ frameStart: this.frameStart, frameSize, size: this.size });
  //   // this.pendingItemSizes = new Set();
  //   // for (const f of frame) {
  //   //   this.pendingItemSizes.add(f);
  //   // }

  //   this.applyUpdate();
  // }

  public scrollToIndex = (index: number) => {
    index = Math.min(this.size, Math.max(0, index));

    let scrollValue = 0;
    for (let i = 0; i < index; i++) {
      scrollValue += this.evaluatedItemSizes[i] || this.defaultItemSize;
    }

    // TODO: provide API instead of updating the container explicitly?
    const container = this.getContainer();
    if (container) {
      const property = this.horizontal ? 'scrollLeft' : 'scrollTop';
      container[property] = scrollValue;
    }
  };

  private applyUpdate() {
    const framePropsChanged = this.updateFrameSizeAndOverscan();

    if (framePropsChanged) {
      const frame = createFrame({
        frameStart: this.frameStart,
        frameSize: this.frameSize,
        overscan: this.overscan,
        size: this.size,
      });

      let sizeBefore = 0;
      let sizeAfter = 0;
      for (let i = 0; i < frame[0] && i < this.size; i++) {
        sizeBefore += this.evaluatedItemSizes[i] || this.defaultItemSize;
      }
      for (let i = frame[frame.length - 1] + 1; i < this.size; i++) {
        sizeAfter += this.evaluatedItemSizes[i] || this.defaultItemSize;
      }

      this.pendingItemSizes = new Set([...frame]);

      this.onFrameChange({ frame, sizeBefore, sizeAfter });
    } else {
      let sizeBefore = 0;
      let sizeAfter = 0;

      for (let i = 0; i < this.frameStart && i < this.size; i++) {
        sizeBefore += this.evaluatedItemSizes[i] || this.defaultItemSize;
      }
      for (let i = this.frameStart + this.frameSize; i < this.size; i++) {
        sizeAfter += this.evaluatedItemSizes[i] || this.defaultItemSize;
      }

      // TODO: update only when necessary e.g. changing from 0 to non-0
      // this.onScrollPropsChange({ sizeBefore, sizeAfter });

      if (!this.initialized) {
        this.onScrollPropsChange({ sizeBefore, sizeAfter });
        this.initialized = true;
      }
    }
  }

  private updateFrameSizeAndOverscan(): boolean {
    const currentFrameSize = this.frameSize;
    const currentOverscan = this.overscan;

    const itemSizesMinToMax = [...this.evaluatedItemSizes].sort();
    const minItemSize = itemSizesMinToMax[0];
    const maxItemSize = itemSizesMinToMax[itemSizesMinToMax.length - 1] ?? 0;

    const rect = this.getContainer()!.getBoundingClientRect();
    const containerWidth = Math.min(rect.width, window.innerWidth - rect.left);
    const containerHeight = Math.min(rect.height, window.innerHeight - rect.top);
    const containerSize = this.horizontal ? containerWidth : containerHeight;

    let contentSize = 0;
    for (let i = 0; i < itemSizesMinToMax.length; i++) {
      contentSize += itemSizesMinToMax[i];
      if (contentSize > containerSize) {
        this.frameSize = Math.max(this.frameSize, i + 1);
        break;
      }
    }

    this.overscan = Math.max(this.overscan, Math.ceil(maxItemSize / minItemSize));

    return currentFrameSize !== this.frameSize || currentOverscan !== this.overscan;
  }

  private handleScroll = (event: Event) => {
    if (this.pendingItemSizes.size > 0) {
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

    for (let i = 0; i < this.size; i++) {
      if (this.evaluatedItemSizes[i]) {
        totalSize += this.evaluatedItemSizes[i];
        knownSizes++;
      }
    }
    const averageItemSize = totalSize / knownSizes;

    this.updateFrameSizeAndOverscan();

    let frameStart = Math.round(scrollValue / averageItemSize);
    frameStart = Math.max(0, Math.min(this.size - this.frameSize, frameStart));

    const frame = createFrame({ frameStart, frameSize: this.frameSize, overscan: this.overscan, size: this.size });

    let sizeBefore = 0;
    let sizeAfter = 0;
    for (let i = 0; i < frame[0] && i < this.size; i++) {
      sizeBefore += this.evaluatedItemSizes[i] || this.defaultItemSize;
    }
    for (let i = frame[frame.length - 1] + 1; i < this.size; i++) {
      sizeAfter += this.evaluatedItemSizes[i] || this.defaultItemSize;
    }

    this.pendingItemSizes = new Set([...frame]);

    this.onFrameChange({ frame, sizeBefore, sizeAfter });
  };

  public destroy() {
    const containerEl = this.getContainer();
    if (containerEl && this.onScrollListener) {
      containerEl.removeEventListener('scroll', this.onScrollListener);
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  private onSizeChange() {
    this.applyUpdate();
  }

  private onWrapperSizeChange: ResizeObserverCallback = entries => {
    const entry = entries[0];
    const contentBoxWidth = entry.contentBoxSize[0].inlineSize;
    const contentBoxHeight = entry.contentBoxSize[0].blockSize;
    const observedContainerSize = this.horizontal ? contentBoxWidth : contentBoxHeight;

    if (this.lastObservedContainerSize !== -1 && this.lastObservedContainerSize !== observedContainerSize) {
      this.onSizeChange();
    }
    this.lastObservedContainerSize = observedContainerSize;
  };

  private updateAllFrameSizes() {
    // TODO: compare items instead

    const newSizes: number[] = [];
    for (let i = 0; i < this.size; i++) {
      newSizes[i] = this.evaluatedItemSizes[i] ?? this.defaultItemSize;
    }
    this.evaluatedItemSizes = newSizes;

    // this.evaluatedItemSizes = [];
    // for (let i = 0; i < this.size; i++) {
    //   this.evaluatedItemSizes.push(0);
    // }
  }

  private init() {
    this.registerOnScroll();
    this.registerResizeObserver();
  }

  private registerOnScroll() {
    if (this.onScrollListener) {
      return;
    }
    const containerEl = this.getContainer();
    if (!containerEl) {
      return;
    }
    this.onScrollListener = this.handleScroll;
    containerEl.addEventListener('scroll', this.onScrollListener);
  }

  private registerResizeObserver() {
    if (this.resizeObserver) {
      return;
    }
    const containerEl = this.getContainer();
    if (!containerEl) {
      return;
    }
    this.resizeObserver = new ResizeObserver(this.onWrapperSizeChange);
    this.resizeObserver.observe(containerEl);
  }
}
