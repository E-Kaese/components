// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React, { ReactElement } from 'react';
import Box, { BoxProps } from '~components/box';

type TextProps = {
  children: JSX.Element | string;
} & (HeadingProps | SubHeadingProps | TitleProps);

interface HeadingProps {
  size: 1 | 2 | 3;
  tag?: 'div' | 'h1' | 'h2' | 'h3';
  type: 'heading';
}

interface SubHeadingProps {
  size: 1 | 2;
  tag?: 'div' | 'p' | 'h4' | 'h5';
  type: 'subheading';
}

interface TitleProps {
  size: 1 | 2 | 3 | 4;
  tag?: 'div' | 'p' | 'h2' | 'h3' | 'h4' | 'h5';
  type: 'title';
}

export default function Text({ children, size, tag, type }: TextProps): ReactElement {
  let variantMap: Record<number, BoxProps.Variant>;
  let defaultTag: string;
  let contextClass: string | undefined;
  switch (type) {
    case 'heading':
      variantMap = {
        1: 'h1',
        2: 'h2',
        3: 'h3',
      };
      defaultTag = variantMap[size];
      break;
    case 'subheading':
      variantMap = {
        1: 'h4',
        2: 'h5',
      };
      defaultTag = 'div';
      break;
    case 'title':
      variantMap = {
        1: 'h1',
        2: 'h2',
        3: 'h3',
        4: 'h4',
      };
      defaultTag = 'div';
      contextClass = 'orion-context-text-titles';
      break;
  }

  const TextContent = (
    <Box variant={variantMap[size]} tagOverride={tag || defaultTag}>
      {children}
    </Box>
  );

  return contextClass ? <div className={contextClass}>{TextContent}</div> : TextContent;
}
