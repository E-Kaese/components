// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createFrame } from './utils';
import { VirtualScrollModel } from './virtual-scroll';

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
