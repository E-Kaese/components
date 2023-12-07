// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import InternalStatusIndicator from '../status-indicator/internal';
import { supportsStickyPosition } from '../internal/utils/dom';
import styles from './styles.css.js';
import cellStyles from './body-cell/styles.css.js';
import LiveRegion from '../internal/components/live-region';
import { TableProps } from './interfaces';

interface ShowMoreCellProps {
  variant: TableProps.Variant;
  containerWidth: number;
  totalColumnsCount: number;
  hasFooter: boolean;
  loading?: boolean;
  loadingText?: string;
  empty?: React.ReactNode;
  tableRef: React.RefObject<HTMLTableElement>;
  level?: number;
  isEvenRow?: boolean;
  stripedRows?: boolean;
  stripedLevels?: boolean;
  hasSelection?: boolean;
}

export function ShowMoreCell({
  variant,
  containerWidth,
  totalColumnsCount,
  loading,
  loadingText,
  empty,
  tableRef,
  level = 1,
  isEvenRow,
  stripedRows,
  stripedLevels,
  hasSelection,
}: ShowMoreCellProps) {
  const [tablePaddings, setTablePaddings] = useState(containerWidth);

  useEffect(() => {
    if (tableRef.current) {
      const tablePaddingLeft = parseFloat(getComputedStyle(tableRef.current).paddingLeft) || 0;
      const tablePaddingRight = parseFloat(getComputedStyle(tableRef.current).paddingRight) || 0;
      setTablePaddings(tablePaddingLeft + tablePaddingRight);
    }
  }, [variant, tableRef]);

  containerWidth = containerWidth + tablePaddings;
  const isEvenLevel = level && level % 2 === 0;

  return (
    <td
      colSpan={totalColumnsCount}
      className={clsx(
        styles['cell-show-more'],
        !isEvenRow && stripedRows && cellStyles['body-cell-shaded'],
        isEvenLevel && stripedLevels && cellStyles['body-cell-shaded']
      )}
    >
      <div
        className={styles['cell-show-more-content']}
        style={{
          width: (supportsStickyPosition() && containerWidth && Math.floor(containerWidth)) || undefined,
          paddingLeft: hasSelection ? `${64 + 20 * level}px` : `${24 + 20 * level}px`,
        }}
      >
        {loading ? (
          <InternalStatusIndicator type="loading" className={styles.loading} wrapText={true}>
            <LiveRegion visible={true}>{loadingText}</LiveRegion>
          </InternalStatusIndicator>
        ) : (
          <div className={styles.empty}>{empty}</div>
        )}
      </div>
    </td>
  );
}
