// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { useState } from 'react';
import { fireNonCancelableEvent } from '../../internal/events';
import { useUniqueId } from '../../internal/hooks/use-unique-id';
import { TableProps } from '../interfaces';
import { getTrackableValue } from '../utils';
import { joinStrings } from '../../internal/utils/strings';
import { SelectionProps } from './interfaces';
import { ItemSelectionTree } from './utils';

// When selectionType="grouped" the checkboxes cannot be disabled so the `isItemDisabled` property is ignored.
// That is because selecting a group implies selection of children even if children are not loaded so that
// we cannot check if the children are disabled.

type SelectionOptions<T> = Pick<
  TableProps<T>,
  'ariaLabels' | 'items' | 'onSelectionChange' | 'selectedItems' | 'selectionInverted' | 'selectionType' | 'trackBy'
> & {
  getExpandableItemProps: (item: T) => { level: number; parent: null | T; children: readonly T[] };
};

export function useGroupSelection<T>({
  ariaLabels,
  items,
  onSelectionChange,
  selectedItems = [],
  selectionInverted = false,
  selectionType,
  trackBy,
  getExpandableItemProps,
}: SelectionOptions<T>): {
  isItemSelected: (item: T) => boolean;
  getSelectAllProps?: () => SelectionProps;
  getItemSelectionProps?: (item: T) => SelectionProps;
} {
  // The name assigned to all controls to combine them in a single group.
  const selectionControlName = useUniqueId();
  const [shiftPressed, setShiftPressed] = useState(false);
  const [lastClickedItem, setLastClickedItem] = useState<null | T>(null);

  if (selectionType !== 'group') {
    return { isItemSelected: () => false };
  }

  const rootItems = items.filter(item => getExpandableItemProps(item).level === 1);
  const getChildren = (item: T) => getExpandableItemProps(item).children;
  const selectionTree = new ItemSelectionTree(rootItems, selectedItems, selectionInverted, trackBy, getChildren);

  // Shift-selection helpers.
  const itemIndexesMap = new Map<T, number>();
  items.forEach((item, i) => itemIndexesMap.set(getTrackableValue(trackBy, item), i));
  const getShiftSelectedItems = (item: T): T[] => {
    const lastClickedItemIndex = lastClickedItem
      ? itemIndexesMap.get(getTrackableValue(trackBy, lastClickedItem))
      : undefined;
    // We use lastClickedItemIndex to determine if filtering/sorting/pagination
    // made previously selected item invisible, therefore we reset state for shift-select.
    if (lastClickedItemIndex !== undefined) {
      const currentItemIndex = itemIndexesMap.get(getTrackableValue(trackBy, item))!;
      const start = Math.min(currentItemIndex, lastClickedItemIndex);
      const end = Math.max(currentItemIndex, lastClickedItemIndex);
      return items.slice(start, end + 1);
    }
    return [item];
  };

  const handleToggleAll = () => {
    fireNonCancelableEvent(onSelectionChange, selectionTree.toggleAll().getState());
  };

  const handleToggleItem = (item: T) => {
    setLastClickedItem(item);

    const requestedItems = shiftPressed ? getShiftSelectedItems(item) : [item];
    const hasChildren = (item: T) => getExpandableItemProps(item).children.length > 0;
    const isRequestedItemsValid = requestedItems.length === 1 || requestedItems.filter(hasChildren).length === 0;
    if (isRequestedItemsValid) {
      fireNonCancelableEvent(onSelectionChange, selectionTree.toggleSome(requestedItems).getState());
    }
  };

  return {
    isItemSelected: selectionTree.isItemSelected,
    getSelectAllProps: (): SelectionProps => ({
      name: selectionControlName,
      selectionType: 'multi',
      disabled: false,
      checked: selectionTree.isAllItemsSelected(),
      indeterminate: selectionTree.isSomeItemsIndeterminate(),
      onChange: handleToggleAll,
      ariaLabel: joinStrings(
        ariaLabels?.selectionGroupLabel,
        ariaLabels?.allItemsSelectionLabel?.({ selectedItems, selectionInverted })
      ),
    }),
    getItemSelectionProps: (item: T): SelectionProps => ({
      name: selectionControlName,
      selectionType: 'multi',
      disabled: false,
      checked: selectionTree.isItemSelected(item),
      indeterminate: selectionTree.isItemIndeterminate(item),
      onChange: () => handleToggleItem(item),
      onShiftToggle: (value: boolean) => setShiftPressed(value),
      ariaLabel: joinStrings(
        ariaLabels?.selectionGroupLabel,
        ariaLabels?.itemSelectionLabel?.({ selectedItems, selectionInverted }, item)
      ),
    }),
  };
}
