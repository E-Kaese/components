// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { InternalContainerProps } from '../container/internal';
import { TreeGridProps } from './interfaces';
import { warnOnce } from '../internal/logging';
import { StickyColumnsCellState } from './use-sticky-columns';

export const applyTrackBy = <T>(trackBy: TreeGridProps.TrackBy<T>, item: T) => {
  if (typeof trackBy === 'function') {
    return trackBy(item);
  }
  return (item as any)[trackBy];
};

export const getItemKey = <T>(trackBy: TreeGridProps.TrackBy<T> | undefined, item: T, index: number) => {
  if (!trackBy) {
    return index;
  }
  return applyTrackBy(trackBy, item);
};

export const getTrackableValue = <T>(trackBy: TreeGridProps.TrackBy<T> | undefined, item: T) => {
  if (!trackBy) {
    return item;
  }
  return applyTrackBy(trackBy, item);
};

export const getColumnKey = <T>(column: TreeGridProps.ColumnDefinition<T>, index: number) => {
  return column.id || index;
};

export const toContainerVariant = (variant: TreeGridProps.Variant | undefined): InternalContainerProps['variant'] => {
  const isDefaultVariant = !variant || variant === 'container';
  return isDefaultVariant ? 'default' : variant === 'borderless' ? 'embedded' : variant;
};

export function checkSortingState<T>(
  columnDefinitions: ReadonlyArray<TreeGridProps.ColumnDefinition<T>>,
  sortingComparator: TreeGridProps.SortingColumn<T>['sortingComparator']
) {
  const matchedColumn = columnDefinitions.filter(column => column.sortingComparator === sortingComparator)[0];
  if (!matchedColumn) {
    warnOnce(
      'Table',
      'Currently active sorting comparator was not found in any columns. Make sure to provide the same comparator function instance on each render.'
    );
  }
}

export function getVisibleColumnDefinitions<T>({
  columnDisplay,
  visibleColumns,
  columnDefinitions,
}: {
  columnDisplay?: ReadonlyArray<TreeGridProps.ColumnDisplayProperties>;
  visibleColumns?: ReadonlyArray<string>;
  columnDefinitions: ReadonlyArray<TreeGridProps.ColumnDefinition<T>>;
}) {
  // columnsDisplay has a precedence over visibleColumns.
  if (columnDisplay) {
    return getVisibleColumnDefinitionsFromColumnDisplay({ columnDisplay, columnDefinitions });
  } else if (visibleColumns) {
    return getVisibleColumnDefinitionsFromVisibleColumns({ visibleColumns, columnDefinitions });
  } else {
    return columnDefinitions;
  }
}

function getVisibleColumnDefinitionsFromColumnDisplay<T>({
  columnDisplay,
  columnDefinitions,
}: {
  columnDisplay: ReadonlyArray<TreeGridProps.ColumnDisplayProperties>;
  columnDefinitions: ReadonlyArray<TreeGridProps.ColumnDefinition<T>>;
}) {
  const columnDefinitionsById: Record<string, TreeGridProps.ColumnDefinition<T>> = columnDefinitions.reduce(
    (accumulator, item) => (item.id === undefined ? accumulator : { ...accumulator, [item.id]: item }),
    {}
  );
  return columnDisplay
    .filter(item => item.visible)
    .map(item => columnDefinitionsById[item.id])
    .filter(Boolean);
}

function getVisibleColumnDefinitionsFromVisibleColumns<T>({
  visibleColumns,
  columnDefinitions,
}: {
  visibleColumns: ReadonlyArray<string>;
  columnDefinitions: ReadonlyArray<TreeGridProps.ColumnDefinition<T>>;
}) {
  const ids = new Set(visibleColumns);
  return columnDefinitions.filter(({ id }) => id !== undefined && ids.has(id));
}

export function getStickyClassNames(styles: Record<string, string>, props: StickyColumnsCellState | null) {
  return {
    [styles['sticky-cell']]: !!props,
    [styles['sticky-cell-pad-left']]: !!props?.padLeft,
    [styles['sticky-cell-last-left']]: !!props?.lastLeft,
    [styles['sticky-cell-last-right']]: !!props?.lastRight,
  };
}
