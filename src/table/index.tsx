// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import { TableForwardRefType, TableProps } from './interfaces';
import { applyDisplayName } from '../internal/utils/apply-display-name';
import InternalTable from './internal';
import useBaseComponent from '../internal/hooks/use-base-component';

export { TableProps };
const Table = React.forwardRef(
  <T,>(
    { items = [], selectedItems = [], variant = 'container', contentDensity = 'comfortable', ...props }: TableProps<T>,
    ref: React.Ref<TableProps.Ref>
  ) => {
    const baseComponentProps = useBaseComponent('Table', {
      props: {
        contentDensity,
        resizableColumns: props.resizableColumns,
        selectionType: props.selectionType,
        stickyHeader: props.stickyHeader,
        stripedRows: props.stripedRows,
        variant,
        wrapLines: props.wrapLines,
        enableKeyboardNavigation: props.enableKeyboardNavigation,
      },
    });

    const tableProps: Parameters<typeof InternalTable<T>>[0] = {
      items,
      selectedItems,
      variant,
      contentDensity,
      ...props,
      ...baseComponentProps,
      ref,
    };

    return <InternalTable {...tableProps} />;
  }
) as TableForwardRefType;

applyDisplayName(Table, 'Table');
export default Table;
