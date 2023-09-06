// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import clsx from 'clsx';
import React from 'react';
import styles from './styles.css.js';
import { getStickyClassNames } from '../utils';
import { StickyColumnsModel, useStickyCellStyles } from '../sticky-columns';
import { TableRole, getTableCellRoleProps } from '../table-role';
import useMouseDownTarget from '../../internal/hooks/use-mouse-down-target.js';
import { useMergeRefs } from '../../internal/hooks/use-merge-refs/index.js';

export interface TableTdElementProps {
  className?: string;
  style?: React.CSSProperties;
  wrapLines: boolean | undefined;
  isRowHeader?: boolean;
  isFirstRow: boolean;
  isLastRow: boolean;
  isSelected: boolean;
  isNextSelected: boolean;
  isPrevSelected: boolean;
  nativeAttributes?: Omit<
    React.TdHTMLAttributes<HTMLTableCellElement> | React.ThHTMLAttributes<HTMLTableCellElement>,
    'style' | 'className' | 'onClick'
  >;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  children?: React.ReactNode;
  isEvenRow?: boolean;
  stripedRows?: boolean;
  hasSelection?: boolean;
  hasFooter?: boolean;
  columnId: PropertyKey;
  colIndex: number;
  stickyState: StickyColumnsModel;
  isVisualRefresh?: boolean;
  tableRole: TableRole;
  isDialog?: boolean;
}

export const TableTdElement = React.forwardRef<HTMLTableCellElement, TableTdElementProps>(
  (
    {
      className,
      style,
      children,
      wrapLines,
      isRowHeader,
      isFirstRow,
      isLastRow,
      isSelected,
      isNextSelected,
      isPrevSelected,
      nativeAttributes,
      onClick,
      onMouseEnter,
      onMouseLeave,
      isEvenRow,
      stripedRows,
      isVisualRefresh,
      hasSelection,
      hasFooter,
      columnId,
      colIndex,
      stickyState,
      tableRole,
      isDialog,
    },
    ref
  ) => {
    const Element = isRowHeader ? 'th' : 'td';

    nativeAttributes = {
      ...nativeAttributes,
      ...getTableCellRoleProps({ tableRole, isRowHeader, colIndex, isDialog }),
    };

    const stickyStyles = useStickyCellStyles({
      stickyColumns: stickyState,
      columnId,
      getClassName: props => getStickyClassNames(styles, props),
    });

    const getMouseDownTarget = useMouseDownTarget();
    const mergedRef = useMergeRefs(stickyStyles.ref, ref);

    return (
      <Element
        style={{ ...style, ...stickyStyles.style }}
        className={clsx(
          className,
          styles['body-cell'],
          wrapLines && styles['body-cell-wrap'],
          isFirstRow && styles['body-cell-first-row'],
          isLastRow && styles['body-cell-last-row'],
          isSelected && styles['body-cell-selected'],
          isNextSelected && styles['body-cell-next-selected'],
          isPrevSelected && styles['body-cell-prev-selected'],
          !isEvenRow && stripedRows && styles['body-cell-shaded'],
          stripedRows && styles['has-striped-rows'],
          isVisualRefresh && styles['is-visual-refresh'],
          hasSelection && styles['has-selection'],
          hasFooter && styles['has-footer'],
          stickyStyles.className
        )}
        onClick={onClick}
        onFocus={event => {
          if (!event.currentTarget.contains(getMouseDownTarget())) {
            event.target.scrollIntoView?.({ block: 'center' });
          }
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        ref={mergedRef}
        {...nativeAttributes}
      >
        {children}
      </Element>
    );
  }
);
