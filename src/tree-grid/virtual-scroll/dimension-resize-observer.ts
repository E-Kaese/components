// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export class DimensionResizeObserver {
  private horizontal: boolean;
  private onSizeChange: (size: number) => void;
  private lastObservedElementSize = -1;
  private resizeObserver: ResizeObserver;

  constructor({ horizontal, onSizeChange }: { horizontal: boolean; onSizeChange: (size: number) => void }) {
    this.horizontal = horizontal;
    this.onSizeChange = onSizeChange;
    this.resizeObserver = new ResizeObserver(this.onObserve);
  }

  public observe(element: HTMLElement) {
    const elementRect = element.getBoundingClientRect();
    const elementSize = this.horizontal ? elementRect.width : elementRect.height;
    this.lastObservedElementSize = elementSize;
    this.resizeObserver.observe(element);
  }

  public disconnect() {
    this.resizeObserver.disconnect();
  }

  private onObserve: ResizeObserverCallback = entries => {
    const entry = entries[0];
    const contentBoxWidth = entry.contentBoxSize[0].inlineSize;
    const contentBoxHeight = entry.contentBoxSize[0].blockSize;
    const observedContainerSize = this.horizontal ? contentBoxWidth : contentBoxHeight;

    if (this.lastObservedElementSize !== observedContainerSize) {
      this.onSizeChange(observedContainerSize);
    }
    this.lastObservedElementSize = observedContainerSize;
  };
}
