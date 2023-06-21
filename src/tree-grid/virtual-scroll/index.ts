// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { VirtualScrollModel } from './virtual-scroll';
import { useEffectOnUpdate } from '../../internal/hooks/use-effect-on-update';

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

  // TODO: use model in ref
  useEffect(() => {
    model && model.setItems(props.items);
  }, [model, props.items]);

  // TODO: use model in ref
  useEffectOnUpdate(() => {
    model && model.setDefaultItemSize(props.defaultItemSize);
  }, [model, props.defaultItemSize]);

  return {
    frame,
    setItemRef,
    scrollToIndex: (index: number) => model?.scrollToIndex(index),
  };
}
