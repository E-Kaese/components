// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useRef, useState } from 'react';

const DEFAULT_FRAME_SIZE = 25;

interface VirtualModelProps {
  size: number;
  frameSize?: number;
  getContainer: () => null | HTMLElement;
  getItemSize: (index: number) => number;
  onScrollPropsChange: (props: ScrollProps) => void;
  onFrameChange: (props: FrameProps) => void;
}

interface ScrollProps {
  sizeBefore: number;
  sizeAfter: number;
}

interface FrameProps {
  frame: number[];
  sizeBefore: number;
  sizeAfter: number;
}

export function useVirtualScroll(
  props: Omit<VirtualModelProps, 'onScrollPropsChange' | 'onFrameChange' | 'getItemSize'>
) {
  const [frame, setFrame] = useState(
    createFrame({ frameStart: 0, frameSize: props.frameSize ?? DEFAULT_FRAME_SIZE, size: props.size })
  );

  const elBeforeRef = useRef<HTMLTableCellElement>(null);
  const elAfterRef = useRef<HTMLTableCellElement>(null);
  const trRefs = useRef<{ [index: number]: null | HTMLElement }>({});

  const [model] = useState(
    () =>
      new VirtualScrollModel({
        ...props,
        onFrameChange: ({ frame, ...scrollProps }) => {
          setFrame(frame);

          if (elBeforeRef.current) {
            elBeforeRef.current.style.height = scrollProps.sizeBefore + 'px';
          }
          if (elAfterRef.current) {
            elAfterRef.current.style.height = scrollProps.sizeAfter + 'px';
          }
        },
        onScrollPropsChange: scrollProps => {
          if (elBeforeRef.current) {
            elBeforeRef.current.style.height = scrollProps.sizeBefore + 'px';
          }
          if (elAfterRef.current) {
            elAfterRef.current.style.height = scrollProps.sizeAfter + 'px';
          }
        },
        getItemSize: (index: number) => {
          const el = trRefs.current[index];
          if (!el) {
            return 40;
          }
          return el.getBoundingClientRect().height;
        },
      })
  );
  useEffect(() => {
    return () => {
      model.destroy();
    };
  }, [model]);

  const setItemRef = useCallback(
    (index: number, node: null | HTMLElement) => {
      trRefs.current[index] = node;
      if (node) {
        model.setItemSize(index, node.getBoundingClientRect().height);
      }
    },
    [model]
  );

  // TODO: consider collection change instead of its size change
  useEffect(() => {
    model.setSize(props.size);
  }, [model, props.size]);

  useEffect(() => {
    model.setFrameSize(props.frameSize ?? DEFAULT_FRAME_SIZE);
  }, [model, props.frameSize]);

  return {
    frame,
    // sizeBefore: scrollProps.sizeBefore,
    // sizeAfter: scrollProps.sizeAfter,
    setItemRef,
    elBeforeRef,
    elAfterRef,
    scrollToIndex: model.scrollToIndex,
  };
}

function createFrame({
  frameStart,
  frameSize,
  size,
}: {
  frameStart: number;
  frameSize: number;
  size: number;
}): number[] {
  const frame: number[] = [];
  for (let i = frameStart; i < frameStart + frameSize && i < size; i++) {
    frame.push(i);
  }
  return frame;
}

export class VirtualScrollModel {
  // Props
  public size: number;
  public frameSize: number = DEFAULT_FRAME_SIZE;
  private getContainer: () => null | HTMLElement;
  private onScrollPropsChange: (props: ScrollProps) => void;
  private onFrameChange: (props: FrameProps) => void;

  // State
  private frameStart = 0;
  private evaluatedItemSizes: number[] = [];
  private pendingItemSizes = new Set<number>();

  // Other
  private onScrollListener: null | ((event: Event) => void) = null;
  private onFocusListener: null | ((event: FocusEvent) => void) = null;
  private onBlurListener: null | ((event: FocusEvent) => void) = null;

  constructor({ size, frameSize, getContainer, onScrollPropsChange, onFrameChange }: VirtualModelProps) {
    this.size = size;
    this.frameSize = frameSize ?? this.frameSize;
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

  public setFrameSize(frameSize: number) {
    this.init();

    this.frameSize = frameSize;

    this.updateAllFrameSizes();

    // const frame = createFrame({ frameStart: this.frameStart, frameSize, size: this.size });
    // this.pendingItemSizes = new Set();
    // for (const f of frame) {
    //   this.pendingItemSizes.add(f);
    // }

    this.applyUpdate();
  }

  public scrollToIndex = (index: number) => {
    index = Math.min(this.size, Math.max(0, index));

    let scrollTop = 0;
    for (let i = 0; i < index; i++) {
      scrollTop += this.evaluatedItemSizes[i] || 40;
    }

    // TODO: provide API
    const container = this.getContainer();
    if (container) {
      container.scrollTop = scrollTop;
    }
  };

  // TODO: use default item size
  private applyUpdate() {
    let sizeBefore = 0;
    let sizeAfter = 0;

    for (let i = 0; i < this.frameStart && i < this.size; i++) {
      sizeBefore += this.evaluatedItemSizes[i] || 40;
    }
    for (let i = this.frameStart + this.frameSize; i < this.size; i++) {
      sizeAfter += this.evaluatedItemSizes[i] || 40;
    }

    // TODO: update only when necessary e.g. changing from 0 to non-0
    // this.onScrollPropsChange({ sizeBefore, sizeAfter });
  }

  private handleScroll = (event: Event) => {
    if (this.pendingItemSizes.size > 0) {
      return;
    }

    const scrollTop = (event.target as HTMLElement).scrollTop;

    let totalSize = 0;
    let knownSizes = 0;

    for (let i = 0; i < this.size; i++) {
      if (this.evaluatedItemSizes[i]) {
        totalSize += this.evaluatedItemSizes[i];
        knownSizes++;
      }
    }
    const averageItemSize = totalSize / knownSizes;

    let frameStart = Math.round(scrollTop / averageItemSize);
    frameStart = Math.max(0, Math.min(this.size - this.frameSize, frameStart));

    let sizeBefore = 0;
    let sizeAfter = 0;
    for (let i = 0; i < frameStart && i < this.size; i++) {
      sizeBefore += this.evaluatedItemSizes[i] || 40;
    }
    for (let i = frameStart + this.frameSize; i < this.size; i++) {
      sizeAfter += this.evaluatedItemSizes[i] || 40;
    }

    const frame = createFrame({ frameStart, frameSize: this.frameSize, size: this.size });

    this.pendingItemSizes = new Set([...frame]);
    this.onFrameChange({ frame, sizeBefore, sizeAfter });
  };

  public destroy() {
    const containerEl = this.getContainer();
    if (containerEl && this.onScrollListener) {
      containerEl.removeEventListener('scroll', this.onScrollListener);
    }
    if (containerEl && this.onFocusListener) {
      containerEl.removeEventListener('focus', this.onFocusListener);
    }
    if (containerEl && this.onBlurListener) {
      containerEl.removeEventListener('blur', this.onBlurListener);
    }
  }

  private updateAllFrameSizes() {
    // TODO: compare items instead
    this.evaluatedItemSizes = this.evaluatedItemSizes.slice(0, this.size);

    // this.evaluatedItemSizes = [];
    // for (let i = 0; i < this.size; i++) {
    //   this.evaluatedItemSizes.push(0);
    // }
  }

  private init() {
    this.registerOnScroll();
    // this.registerOnFocus();
    // this.registerOnBlur();
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

  // private registerOnFocus() {
  //   if (this.onFocusListener) {
  //     return;
  //   }
  //   const containerEl = this.getContainer();
  //   if (!containerEl) {
  //     return;
  //   }
  //   this.onFocusListener = this.handleFocus;
  //   containerEl.addEventListener('focus', this.onFocusListener);
  // }

  // private registerOnBlur() {
  //   if (this.onBlurListener) {
  //     return;
  //   }
  //   const containerEl = this.getContainer();
  //   if (!containerEl) {
  //     return;
  //   }
  //   this.onBlurListener = this.handleBlur;
  //   containerEl.addEventListener('blur', this.onBlurListener);
  // }
}
