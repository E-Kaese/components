// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { useEffect, useState } from 'react';
import { fireNonCancelableEvent } from '../../internal/events';
import { useUniqueId } from '../../internal/hooks/use-unique-id';
import { TableProps } from '../interfaces';
import { getTrackableValue } from '../utils';
import { joinStrings } from '../../internal/utils/strings';
import { SelectionProps } from './interfaces';
import { ItemSet } from './utils';

export function useTreeSelection<T>({
  items,
  selectedItems = [],
  selectionType,
  isItemDisabled = () => false,
  trackBy,
  onSelectionChange,
  ariaLabels,
  loading,
  getItemChildren,
}: Pick<
  TableProps<T>,
  | 'ariaLabels'
  | 'items'
  | 'selectedItems'
  | 'selectionType'
  | 'isItemDisabled'
  | 'trackBy'
  | 'onSelectionChange'
  | 'loading'
  | 'getItemChildren'
>) {
  const [shiftPressed, setShiftPressed] = useState(false);
  const [lastClickedItem, setLastClickedItem] = useState<T | null>(null);
  const selectionName = useUniqueId();
  const finalSelectedItems = selectionType === 'single' ? selectedItems.slice(0, 1) : selectedItems;
  const selectedSet = new ItemSet(trackBy, finalSelectedItems);
  const itemIndexesMap = new Map();
  items.forEach((item, i) => itemIndexesMap.set(getTrackableValue(trackBy, item), i));

  const itemToParentMap = new Map<T, T>();

  function makeItemToParent(item: T) {
    if (getItemChildren) {
      for (const child of getItemChildren(item)) {
        itemToParentMap.set(child, item);
        makeItemToParent(child);
      }
    }
  }
  items.forEach(makeItemToParent);

  useEffect(() => {
    const itemToParentMap = new Map<T, T>();

    function makeItemToParent(item: T) {
      if (getItemChildren) {
        for (const child of getItemChildren(item)) {
          itemToParentMap.set(child, item);
          makeItemToParent(child);
        }
      }
    }
    items.forEach(makeItemToParent);

    const selectedSet = new ItemSet(trackBy, selectedItems);

    function traverse(item: T) {
      const children = getItemChildren?.(item) ?? [];
      let selected = children.length > 0;
      for (const child of children) {
        traverse(child);
        selected = selected && selectedSet.has(child);
      }
      if (selected) {
        for (const child of children) {
          selectedSet.delete(child);
        }
        selectedSet.put(item);
      }
    }

    items.forEach(traverse);

    if (selectedSet.size() !== selectedItems.length) {
      const newSelected: T[] = [];
      selectedSet.forEach(item => newSelected.push(item));
      fireNonCancelableEvent(onSelectionChange, { selectedItems: newSelected });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItems, items]);

  const getParentSelected = (item: T): boolean => {
    const parent = itemToParentMap.get(item);
    if (!parent) {
      return false;
    }
    return isItemSelected(parent);
  };

  const isItemSelected = (item: T): boolean => {
    const inverse = getParentSelected(item);
    return inverse ? !selectedSet.has(item) : selectedSet.has(item);
  };

  const isItemIndeterminate = (item: T): boolean => {
    const children = getItemChildren?.(item) ?? [];
    return children.some(child => isItemSelected(child)) && children.some(child => !isItemSelected(child));
  };

  const getItemState = (item: T) => ({
    disabled: isItemDisabled(item),
    selected: isItemSelected(item),
  });
  const [allDisabled, allEnabledSelected] = selectionType
    ? items.reduce(
        ([allDisabled, allEnabledSelected], item) => {
          const { disabled, selected } = getItemState(item);
          return [
            // all items are disabled (or none are present)
            allDisabled && disabled,
            // all enabled items are selected (or none are present)
            allEnabledSelected && (selected || disabled),
          ];
        },
        [true, true]
      )
    : [true, true];

  // the page has at least one selected item
  const hasSelected = finalSelectedItems.length > 0;

  const handleToggleAll = () => {
    const requestedItems = new ItemSet(trackBy, items);
    const newSelectedItems = allEnabledSelected ? deselectItems(requestedItems) : selectItems(requestedItems);
    fireNonCancelableEvent(onSelectionChange, { selectedItems: newSelectedItems });
  };

  const getRequestedItems = (item: T) => {
    const requestedItems = new ItemSet(trackBy, [item]);
    let lastClickedItemIndex = lastClickedItem ? itemIndexesMap.get(getTrackableValue(trackBy, lastClickedItem)) : -1;
    if (lastClickedItemIndex === undefined) {
      lastClickedItemIndex = -1;
    }
    // we use lastClickedItemIndex to determine if filtering/sorting/pagination
    // made previously selected item invisible, therefore we reset state for shift-select
    if (shiftPressed && lastClickedItemIndex !== -1) {
      // item is always in items
      const currentItemIndex = itemIndexesMap.get(getTrackableValue(trackBy, item)) as number;
      const start = Math.min(currentItemIndex, lastClickedItemIndex);
      const end = Math.max(currentItemIndex, lastClickedItemIndex);
      items.slice(start, end + 1).forEach(item => requestedItems.put(item));
    }
    return requestedItems;
  };

  const deselectItems = (requestedItems: ItemSet<T>) => {
    const newSelectedItems: Array<T> = [];
    selectedItems.forEach(selectedItem => {
      const toUnselect = requestedItems.has(selectedItem);
      if (!toUnselect || isItemDisabled(selectedItem)) {
        newSelectedItems.push(selectedItem);
      }
    });
    return newSelectedItems;
  };

  const selectItems = (requestedItems: ItemSet<T>) => {
    const newSelectedItems = [...selectedItems];
    requestedItems.forEach(newItem => {
      const { disabled } = getItemState(newItem);
      const selected = selectedSet.has(newItem);
      if (!selected && !disabled) {
        newSelectedItems.push(newItem);
      }
    });
    return newSelectedItems;
  };

  const handleToggleItem = (item: T) => () => {
    const { disabled } = getItemState(item);
    const selected = selectedSet.has(item);
    if (disabled || (selectionType === 'single' && selected)) {
      return;
    }
    if (selectionType === 'single') {
      fireNonCancelableEvent(onSelectionChange, { selectedItems: [item] });
    } else {
      const requestedItems = getRequestedItems(item);
      const selectedItemsSet = new Set(selected ? deselectItems(requestedItems) : selectItems(requestedItems));
      if (getItemChildren) {
        const unselect = (children: readonly T[]) => {
          for (const child of children) {
            selectedItemsSet.delete(child);
            unselect(getItemChildren(child));
          }
        };
        unselect(getItemChildren(item));
      }
      fireNonCancelableEvent(onSelectionChange, { selectedItems: Array.from(selectedItemsSet) });
      setLastClickedItem(item);
    }
  };

  return {
    isItemSelected,
    getSelectAllProps: (): SelectionProps => {
      if (!selectionType) {
        throw new Error('Invariant violation: calling selection props with missing selection type.');
      }
      return {
        name: selectionName,
        disabled: allDisabled || !!loading,
        selectionType: selectionType,
        indeterminate: hasSelected && !allEnabledSelected,
        checked: hasSelected && allEnabledSelected,
        onChange: handleToggleAll,
        ariaLabel: joinStrings(
          ariaLabels?.selectionGroupLabel,
          ariaLabels?.allItemsSelectionLabel?.({ selectedItems })
        ),
      };
    },
    getItemSelectionProps: (item: T): SelectionProps => {
      if (!selectionType) {
        throw new Error('Invariant violation: calling selection props with missing selection type.');
      }
      return {
        name: selectionName,
        selectionType: selectionType,
        ariaLabel: joinStrings(
          ariaLabels?.selectionGroupLabel,
          ariaLabels?.itemSelectionLabel?.({ selectedItems }, item)
        ),
        onChange: handleToggleItem(item),
        checked: isItemSelected(item),
        disabled: isItemDisabled(item),
        indeterminate: isItemIndeterminate(item),
      };
    },
    updateShiftToggle: (value: boolean) => {
      setShiftPressed(value);
    },
  };
}
