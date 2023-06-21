// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useEffect, useRef, useState } from 'react';

interface VirtualModelProps {
  size: number;
  horizontal?: boolean;
  defaultItemSize: number;
  containerRef: React.RefObject<HTMLElement>;
  onScrollPropsChange: (props: ScrollProps) => void;
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

export function useVirtualScroll(props: VirtualModelProps): Virtualizer {
  // TODO: use better defaults
  const [frame, setFrame] = useState(createFrame({ frameStart: 0, frameSize: 0, overscan: 0, size: props.size }));

  const itemRefs = useRef<{ [index: number]: null | HTMLElement }>({});

  const [model, setModel] = useState<null | VirtualScrollModel>(null);
  useEffect(() => {
    if (props.containerRef.current) {
      setModel(
        new VirtualScrollModel({
          ...props,
          horizontal: props.horizontal ?? false,
          scrollContainer: props.containerRef.current,
          onFrameChange: ({ frame, ...scrollProps }) => {
            setFrame(frame);
            props.onScrollPropsChange(scrollProps);
          },
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.containerRef]);

  useEffect(() => {
    return () => {
      model && model.cleanup();
    };
  }, [model]);

  const setItemRef = useCallback(
    (index: number, node: null | HTMLElement) => {
      itemRefs.current[index] = node;
      if (node && model) {
        const property = model.horizontal ? 'width' : 'height';
        model.setItemSize(index, node.getBoundingClientRect()[property]);
      }
    },
    [model]
  );

  // TODO: consider collection change instead of its size change
  useEffect(() => {
    model && model.setSize(props.size);
  }, [model, props.size]);

  useEffect(() => {
    model && model.setDefaultItemSize(props.defaultItemSize);
  }, [model, props.defaultItemSize]);

  return {
    frame,
    setItemRef,
    scrollToIndex: (index: number) => model?.scrollToIndex(index),
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

interface VirtualScrollInitProps {
  size: number;
  horizontal: boolean;
  defaultItemSize: number;
  scrollContainer: HTMLElement;
  onFrameChange: (props: FrameProps) => void;
}

export class VirtualScrollModel {
  // Props
  private _size: number;
  private _defaultItemSize: number;
  private _horizontal: boolean;
  private _scrollContainer: HTMLElement;
  private onFrameChange: (props: FrameProps) => void;

  // Props getters
  public get size() {
    return this._size;
  }
  public get defaultItemSize() {
    return this._defaultItemSize;
  }
  public get horizontal() {
    return this._horizontal;
  }
  public get scrollContainer() {
    return this._scrollContainer;
  }

  // State
  private frameSize = 0;
  private overscan = 0;
  private frameStart = 0;
  private evaluatedItemSizes: number[] = [];
  private pendingItemSizes = new Set<number>();
  private scrollTop = 0;
  private scrollLeft = 0;
  private lastObservedContainerSize = -1;
  private cleanupCallbacks: (() => void)[] = [];

  constructor({ size, horizontal, defaultItemSize, scrollContainer, onFrameChange }: VirtualScrollInitProps) {
    this._size = size;
    this._defaultItemSize = defaultItemSize;
    this._horizontal = horizontal;
    this._scrollContainer = scrollContainer;
    this.onFrameChange = onFrameChange;

    scrollContainer.addEventListener('scroll', this.handleScroll);
    this.cleanupCallbacks.push(() => scrollContainer.removeEventListener('scroll', this.handleScroll));

    const resizeObserver = new ResizeObserver(this.onWrapperSizeChange);
    resizeObserver.observe(scrollContainer);
    this.cleanupCallbacks.push(() => resizeObserver.disconnect());
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

  public setSize(size: number) {
    this._size = size;

    this.updateAllFrameSizes();
    this.applyUpdate();
  }

  public setDefaultItemSize(defaultItemSize: number) {
    this._defaultItemSize = defaultItemSize;

    this.updateAllFrameSizes();
    this.applyUpdate();
  }

  public setItemSize(index: number, size: number) {
    this.pendingItemSizes.delete(index);
    this.evaluatedItemSizes[index] = size;
  }

  public scrollToIndex = (index: number) => {
    index = Math.min(this.size, Math.max(0, index));

    let scrollValue = 0;
    for (let i = 0; i < index; i++) {
      scrollValue += this.evaluatedItemSizes[i] || this.defaultItemSize;
    }

    const property = this.horizontal ? 'scrollLeft' : 'scrollTop';
    this.scrollContainer[property] = scrollValue;
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
    }
  }

  private updateFrameSizeAndOverscan(): boolean {
    const currentFrameSize = this.frameSize;
    const currentOverscan = this.overscan;

    const itemSizesMinToMax = [...this.evaluatedItemSizes];
    itemSizesMinToMax.sort((a, b) => a - b);

    const rect = this.scrollContainer.getBoundingClientRect();
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

    let minItemSize = this.evaluatedItemSizes[this.frameStart];
    let maxItemSize = this.evaluatedItemSizes[this.frameStart];
    for (let i = this.frameStart; i < Math.max(this.size, this.frameStart + this.frameSize); i++) {
      if (this.evaluatedItemSizes[i] !== undefined) {
        minItemSize = Math.min(minItemSize, this.evaluatedItemSizes[i]);
        maxItemSize = Math.max(maxItemSize, this.evaluatedItemSizes[i]);
      }
    }

    // TODO: use precise overscan calculation to minimize max frame size.
    this.overscan = 1 + Math.ceil(maxItemSize / minItemSize);
    // this.overscan = Math.max(this.overscan, Math.ceil(maxItemSize / minItemSize));

    const updated = currentFrameSize !== this.frameSize || currentOverscan !== this.overscan;

    return updated;
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
    this.frameStart = frameStart;

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
  }
}
