// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { VirtualScrollModel } from './virtual-scroll';
import { useEffectOnUpdate } from '../../internal/hooks/use-effect-on-update';

/**
 * Scenarios:
 *
 * First render:
 * 1. The table renders with no elements;
 * 2. Wrapper size is set -> the initial frame based on wrapper size and default item size is set;
 * 3. The first frame approximation is measured and real sizes are received;
 * 4. Frame window is updated using real sizes and:
 *    4.1. Space before/after is updated (imperatively);
 *    4.2. Space before/after and frame are updated (extra render, only if real sizes are below the defaults).
 *
 * User scroll:
 * 1. Frame start is updated;
 * 2. New frame is rendered and new sizes are received;
 * 3. Possible extra updates:
 *    3.1. Nothing extra is updated as all sizes are already cached;
 *    3.2. Space before/after is updated (imperatively);
 *    3.3. Space before/after and frame are updated (extra render, only if new sizes are smaller).
 *
 * Default item size updated:
 * 1. Space before/after are updated (imperatively).
 *
 * Items updated:
 * 1. New item sizes are received (happens before useEffect);
 * 2. Possible extra updates:
 *    2.1. Space before/after is updated (imperatively);
 *    2.2. Space before/after and frame are updated (extra render, only if new sizes are smaller).
 *
 * Column widths updated (by user):
 * 1. Nothing - the corresponding values can be updated during the next scroll event.
 */

interface VirtualModelProps<Item extends object> {
  items: readonly Item[];
  horizontal?: boolean;
  defaultItemSize: number;
  containerRef: React.RefObject<HTMLElement>;
  onScrollPropsChange: (props: ScrollProps) => void;
  trackBy?: keyof Item | ((item: Item) => string);
}

export interface ScrollProps {
  sizeBefore: number;
  sizeAfter: number;
}

export interface Virtualizer {
  frame: readonly number[];
  setItemRef: (index: number, node: null | HTMLElement) => void;
  scrollToIndex: (index: number) => void;
}

export function useVirtualScroll<Item extends object>(props: VirtualModelProps<Item>): Virtualizer {
  const [frame, setFrame] = useState<readonly number[]>([]);

  const itemRefs = useRef<{ [index: number]: null | HTMLElement }>({});

  const [model, setModel] = useState<null | VirtualScrollModel<Item>>(null);
  useLayoutEffect(() => {
    if (props.containerRef.current) {
      setModel(
        new VirtualScrollModel({
          ...props,
          horizontal: props.horizontal ?? false,
          scrollContainer: props.containerRef.current,
          onFrameChange: ({ frame, ...scrollProps }) => {
            frame && setFrame(frame);
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
        model.setItemSize(index, node.getBoundingClientRect()[property] || props.defaultItemSize);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [model]
  );

  // TODO: use model in ref
  useEffect(() => {
    model && model.setItems(props.items);
  }, [model, props.items]);

  // TODO: use model in ref
  useEffectOnUpdate(() => {
    model && model.setDefaultItemSize(props.defaultItemSize);
  }, [model, props.defaultItemSize]);

  // TODO: is there a better way to achieve the same?
  // Can't rely on setFrame because the items and frame can become out of sync in case items shrink.
  const safeFrame =
    frame[frame.length - 1] >= props.items.length ? frame.filter(index => index < props.items.length) : frame;

  return {
    frame: safeFrame,
    setItemRef,
    scrollToIndex: (index: number) => model?.scrollToIndex(index),
  };
}
