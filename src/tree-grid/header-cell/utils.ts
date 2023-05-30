// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { TreeGridProps } from '../interfaces';

type SortingStatus = 'sortable' | 'ascending' | 'descending';
const stateToIcon = {
  sortable: 'caret-down',
  ascending: 'caret-up-filled',
  descending: 'caret-down-filled',
} as const;
const stateToAriaSort = {
  sortable: 'none',
  ascending: 'ascending',
  descending: 'descending',
} as const;

export const getSortingStatus = (
  sortable: boolean,
  sorted: boolean,
  descending: boolean,
  disabled: boolean
): SortingStatus | undefined => {
  if (sorted) {
    if (descending) {
      return 'descending';
    }
    return 'ascending';
  }
  if (sortable && !disabled) {
    return 'sortable';
  }
  return undefined;
};

export const getSortingIconName = (sortingState: SortingStatus) => stateToIcon[sortingState];
export const getAriaSort = (sortingState: SortingStatus) => stateToAriaSort[sortingState];
export const isSorted = <T>(column: TreeGridProps.ColumnDefinition<T>, sortingColumn: TreeGridProps.SortingColumn<T>) =>
  column === sortingColumn ||
  (column.sortingField !== undefined && column.sortingField === sortingColumn.sortingField) ||
  (column.sortingComparator !== undefined && column.sortingComparator === sortingColumn.sortingComparator);
