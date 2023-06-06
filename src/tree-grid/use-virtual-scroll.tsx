// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { MutableRefObject, useCallback, useEffect, useRef, useState } from 'react';
import { useStableEventHandler } from '../internal/hooks/use-stable-event-handler';
import { throttle } from '../internal/utils/throttle';

/**
 TODO:

 1. Debounce onScroll;
 2. Try settings scroll props imperatively on the respective refs;
 3. Remove repetitive blocks;
 4. Make code less coupled with React lifecycle;
 5. Validate if the same hook can work for autosuggest;

 */

interface VirtualScrollProps<Item> {
  items: readonly Item[];
  frameSize: number;
}

interface VirtualItem<Item> {
  item: Item;
  index: number;
}

interface VirtualScrollModel<Item> {
  scrollable: boolean;
  frame: {
    items: readonly VirtualItem<Item>[];
    frameStart: number;
    frameEnd: number;
  };
  scroll: {
    averageRowHeight: number;
    renderedHeight: number;
    heightBefore: number;
    heightAfter: number;
  };
  refs: {
    container(el: null | HTMLElement): void;
    row(index: number, el: null | HTMLElement): void;
  };
  handlers: {
    onScroll(scrollTop: number): void;
  };
  functions: {
    scrollToIndex(index: number): void;
  };
}

export function useVirtualScroll<Item>({ items, frameSize }: VirtualScrollProps<Item>): VirtualScrollModel<Item> {
  const containerRef = useRef<HTMLDivElement>(null) as MutableRefObject<HTMLElement>;
  const containerRefCallback = useCallback((el: HTMLElement) => {
    containerRef.current = el;
  }, []);

  const rowRefs = useRef({}) as MutableRefObject<{ [index: number]: null | HTMLElement }>;
  const rowRefCallback = useCallback((index: number, el: HTMLElement) => {
    rowRefs.current[index] = el;
  }, []);

  const [frameStart, setFrameStart] = useState(0);
  const frameStartRef = useRef(0);
  const frameStartItem = useRef<null | Item>(null);

  const [scrollProps, setScrollProps] = useState({
    averageRowHeight: 0,
    renderedHeight: 0,
    heightBefore: 0,
    heightAfter: 0,
  });

  const frameItems = items.slice(frameStart, frameStart + frameSize);
  const totalItems = items.length;

  const rowHeightsRef = useRef<{ [index: number]: number }>({});

  function updateFramePosition(frameStart: number) {
    const prevFrameStart = frameStartRef.current;
    frameStartRef.current = frameStart;
    frameStartItem.current = items[frameStart];
    setFrameStart(frameStart);

    let renderedHeight = 0;

    const renderedRows = Math.min(frameSize, totalItems - frameStart);
    for (let i = prevFrameStart; i < prevFrameStart + renderedRows; i++) {
      const rowEl = rowRefs.current[i];
      const rowHeight = rowEl ? rowEl.getBoundingClientRect().height : 0;
      renderedHeight += rowHeight;
      rowHeightsRef.current[i] = rowHeight;
    }

    let cachedRows = 0;
    let cachedRowHeight = 0;
    for (let i = 0; i < items.length; i++) {
      if (rowHeightsRef.current[i] !== undefined) {
        cachedRows++;
        cachedRowHeight += rowHeightsRef.current[i];
      }
    }

    const averageRowHeight = cachedRowHeight / cachedRows;
    const heightBefore = frameStart * averageRowHeight;
    const heightAfter = Math.max(0, totalItems - frameStart - frameSize) * averageRowHeight;

    setScrollProps({ averageRowHeight, renderedHeight, heightBefore, heightAfter });
  }

  const skipNextScrollRef = useRef(false);

  useEffect(() => {
    rowHeightsRef.current = {};

    const frameStart = frameStartRef.current;

    let renderedHeight = 0;

    const renderedRows = Math.min(frameSize, items.length - frameStart);
    for (let i = frameStart; i < frameStart + renderedRows; i++) {
      const rowEl = rowRefs.current[i];
      const rowHeight = rowEl ? rowEl.getBoundingClientRect().height : 0;
      renderedHeight += rowHeight;
      rowHeightsRef.current[i] = rowHeight;
    }

    let cachedRows = 0;
    let cachedRowHeight = 0;
    for (let i = 0; i < items.length; i++) {
      if (rowHeightsRef.current[i] !== undefined) {
        cachedRows++;
        cachedRowHeight += rowHeightsRef.current[i];
      }
    }

    const averageRowHeight = cachedRowHeight / cachedRows;
    const heightBefore = frameStart * averageRowHeight;
    const heightAfter = Math.max(0, items.length - frameStart - frameSize) * averageRowHeight;

    setScrollProps({ averageRowHeight, renderedHeight, heightBefore, heightAfter });

    setTimeout(() => {
      const el = containerRef.current;
      if (el && Math.abs(el.scrollTop - heightBefore) > 10) {
        skipNextScrollRef.current = true;
        el.scrollTo({ top: heightBefore });
      }
    }, 0);
  }, [frameSize, items]);

  const scrollable = scrollProps.heightBefore + scrollProps.heightAfter > 0;

  function scrollToIndex(index: number) {
    index = Math.min(items.length, Math.max(0, index));

    let renderedHeight = 0;

    const renderedRows = Math.min(frameSize, totalItems - index);
    for (let i = index; i < index + renderedRows; i++) {
      const rowEl = rowRefs.current[i];
      const rowHeight = rowEl ? rowEl.getBoundingClientRect().height : 0;
      renderedHeight += rowHeight;
    }

    const averageRowHeight = renderedHeight / renderedRows;
    const heightBefore = index * averageRowHeight;

    setTimeout(() => {
      containerRef.current?.scrollTo({ top: heightBefore });
    }, 0);
  }

  const onScroll = useStableEventHandler(
    throttle((scrollTop: number) => {
      if (skipNextScrollRef.current) {
        skipNextScrollRef.current = false;
        return;
      }

      const delta = Math.round((scrollTop - scrollProps.heightBefore) / scrollProps.averageRowHeight);
      const nextFrameStart = Math.max(0, Math.min(totalItems - frameSize, frameStart + delta));
      updateFramePosition(nextFrameStart);
    }, 25)
  );

  return {
    scrollable,
    frame: {
      items: frameItems.map((item, index) => ({ item, index: index + frameStart })),
      frameStart,
      frameEnd: Math.min(totalItems, frameStart + frameSize),
    },
    scroll: {
      averageRowHeight: scrollProps.averageRowHeight,
      renderedHeight: scrollProps.renderedHeight,
      heightBefore: scrollProps.heightBefore,
      heightAfter: scrollProps.heightAfter,
    },
    refs: {
      container: containerRefCallback,
      row: rowRefCallback,
    },
    handlers: {
      onScroll,
    },
    functions: {
      scrollToIndex,
    },
  };
}
