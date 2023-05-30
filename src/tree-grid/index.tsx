// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import { TreeGridForwardRefType, TreeGridProps } from './interfaces';
import { applyDisplayName } from '../internal/utils/apply-display-name';
import InternalTreeGrid from './internal';
import useBaseComponent from '../internal/hooks/use-base-component';

export { TreeGridProps };
const TreeGrid = React.forwardRef(
  <T,>(
    {
      items = [],
      selectedItems = [],
      variant = 'container',
      contentDensity = 'comfortable',
      ...props
    }: TreeGridProps<T>,
    ref: React.Ref<TreeGridProps.Ref>
  ) => {
    const baseComponentProps = useBaseComponent('TreeGrid');
    return (
      <InternalTreeGrid
        items={items}
        selectedItems={selectedItems}
        variant={variant}
        contentDensity={contentDensity}
        {...props}
        {...baseComponentProps}
        ref={ref}
      />
    );
  }
) as TreeGridForwardRefType;

applyDisplayName(TreeGrid, 'TreeGrid');
export default TreeGrid;
