// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import clsx from 'clsx';
import flattenChildren from 'react-keyed-flatten-children';
import { InternalColumnLayoutProps } from '../interfaces';
import styles from './styles.css.js';

interface FlexibleColumnLayoutProps
  extends Pick<InternalColumnLayoutProps, 'minColumnWidth' | 'columns' | 'variant' | 'borders' | 'disableGutters'> {
  children: React.ReactNode;
}

export default function FlexibleColumnLayout({
  columns = 1,
  minColumnWidth = 0,
  disableGutters,
  variant,
  children,
}: FlexibleColumnLayoutProps) {
  const shouldDisableGutters = variant !== 'text-grid' && disableGutters;

  // Flattening the children allows us to "see through" React Fragments and nested arrays.
  const flattenedChildren = flattenChildren(children);

  return (
    <div
      className={clsx(
        styles['css-grid'],
        styles[`grid-variant-${variant}`],
        shouldDisableGutters && [styles['grid-no-gutters']]
      )}
      style={{ '--min-column-width': `${minColumnWidth}px`, '--column-count': columns }}
      // gridTemplateColumns: `repeat(${columns}, 1fr)`
    >
      {flattenedChildren.map((child, i) => {
        // If this react child is a primitive value, the key will be undefined
        const key = (child as Record<'key', unknown>).key;

        return (
          <div
            key={key ? String(key) : undefined}
            className={clsx(styles.item)}>
            {child}
          </div>
        );
      })}
    </div>
  );
}
