// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import clsx from 'clsx';
import { getBaseProps } from '../internal/base-component';
import useBaseComponent from '../internal/hooks/use-base-component';
import { useContainerBreakpoints } from '../internal/hooks/container-queries';
import InternalBox from '../box/internal';
import InternalColumnLayout, { COLUMN_TRIGGERS } from '../column-layout/internal';

import { KeyValueProps } from './interfaces';
import styles from './styles.css.js';

export { KeyValueProps };

const Pair = ({ label, value }: KeyValueProps.Pair) => (
  <div className={styles.pair}>
    {label && (
      <dt>
        <InternalBox className={styles.label} variant="awsui-key-label">
          {label}
        </InternalBox>
      </dt>
    )}
    <dd className={styles.value}>{value || '–'}</dd>
  </div>
);

const Group = ({ title, pairs }: KeyValueProps.Group) => {
  return (
    <>
      {title &&
        (typeof title === 'string' ? (
          <InternalBox className={styles.title} variant="h3" padding={{ top: 'n', bottom: 'l' }}>
            {title}
          </InternalBox>
        ) : (
          title
        ))}
      <dl className={styles.list}>
        {pairs.map((pair: KeyValueProps.Pair, index: number) => (
          <Pair key={index} label={pair.label} value={pair.value} />
        ))}
      </dl>
    </>
  );
};

const List = ({ pairs, columnDividers = true, ...restProps }: KeyValueProps.List) => {
  const baseComponentProps = useBaseComponent('List');
  const baseProps = getBaseProps(restProps);
  const className = clsx(baseProps.className, styles.root);
  const [breakpoint, ref] = useContainerBreakpoints(COLUMN_TRIGGERS);

  let columnCount: 1 | 2 | 3 | 4;
  const nItems = pairs ? pairs.length : 0;
  // Determine the most efficient column layout based on number of pairs provided
  const columnsLookup: Record<number, 1 | 2 | 3 | 4> = {
    0: 1,
    5: 3,
    6: 3,
    9: 3,
  };

  // Only 1 row: Use number of items | For 1, 2, 3, 4 items
  if (!!nItems && nItems <= 4) {
    columnCount = nItems as 1 | 2 | 3 | 4;
    // Rows 2-3: Avoid having rows with just 1 item | For 5, 6, 9 items
    // Rows 4+: Maximize available space
  } else {
    columnCount = columnsLookup[nItems] || 4;
  }

  const columnsConfig: Array<KeyValueProps.Pair[]> = [];
  let columnIndex = 0;
  let rowIndex = 0;

  // If there isn't an even number of pairs to fill each column equally,
  // distribute the remainder evenly across the remaining rows.
  const remainder = nItems % columnCount;
  const minRowsInColumn = Math.floor(nItems / columnCount);
  const rowsInColumn = columnIndex < remainder ? minRowsInColumn + 1 : minRowsInColumn;

  // Build columns
  pairs.forEach(pair => {
    if (!columnsConfig[columnIndex]) {
      columnsConfig[columnIndex] = [{ ...pair }];
    } else {
      columnsConfig[columnIndex].push({ ...pair });
    }
    if (rowIndex === rowsInColumn - 1) {
      rowIndex = 0;
      columnIndex++;
    } else {
      rowIndex++;
    }
  });

  return (
    <div {...baseComponentProps} className={className}>
      <InternalColumnLayout
        columns={columnCount}
        variant={columnDividers ? 'text-grid' : 'default'}
        __breakpoint={breakpoint}
        ref={ref}
      >
        {columnsConfig.map((column, colIndex) => (
          <Group key={colIndex} pairs={column} />
        ))}
      </InternalColumnLayout>
    </div>
  );
};

export default { Pair, Group, List };
