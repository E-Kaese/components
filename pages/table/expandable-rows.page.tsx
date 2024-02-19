// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React, { useContext, useEffect, useRef, useState } from 'react';
import Table, { TableProps } from '~components/table';
import Header from '~components/header';
import SpaceBetween from '~components/space-between';
import Input from '~components/input';
import ScreenshotArea from '../utils/screenshot-area';
import { columnsConfig, getMatchesCountText } from './shared-configs';
import { generateItems, Instance } from './generate-data';
import { useCollection } from '@cloudscape-design/collection-hooks';
import { Button, Checkbox, FormField, Select, TextFilter } from '~components';
import AppContext, { AppContextType } from '../app/app-context';
import pseudoRandom from '../utils/pseudo-random';

type DemoContext = React.Context<
  AppContextType<{
    resizableColumns: boolean;
    stickyHeader: boolean;
    sortingDisabled: boolean;
    stripedRows: boolean;
    selectionType: undefined | 'single' | 'multi';
    stickyColumnsFirst: string;
    imitateServerExpand: boolean;
    imitateServerErrors: boolean;
  }>
>;

interface ExtendedInstance extends Instance {
  level?: number;
  parentId?: string;
  name: string;
  alt: string;
  description: string;
}

function getName(previousName: string, index: number) {
  return `${previousName}-${index + 1}`;
}

function getAlt(name: string) {
  const last = name.split('-').reverse()[0];
  return getDescription(last);
}

function getDescription(name: string) {
  return name
    .replace(/10/g, 'ten')
    .replace(/9/g, 'nine')
    .replace(/8/g, 'eight')
    .replace(/7/g, 'seven')
    .replace(/6/g, 'six')
    .replace(/5/g, 'five')
    .replace(/4/g, 'four')
    .replace(/3/g, 'three')
    .replace(/2/g, 'two')
    .replace(/1/g, 'one')
    .replace(/-/g, ' ');
}

let allItems: ExtendedInstance[] = generateItems(10).map((it, index) => ({
  ...it,
  level: 0,
  name: getName('Item', index),
  alt: getAlt(getName('Item', index)),
  description: getDescription(getName('Item', index)),
}));
for (let iteration = 0; iteration < 5; iteration++) {
  allItems = allItems.flatMap(parent => {
    const childrenCount = parent.level === iteration ? Math.floor(pseudoRandom() * 6) : 0;
    return [
      parent,
      ...generateItems(childrenCount).map((item, index) => ({
        ...item,
        level: iteration + 1,
        parentId: parent.id,
        name: getName(parent.name, index),
        alt: getAlt(getName(parent.name, index)),
        description: getDescription(getName(parent.name, index)),
      })),
    ];
  });
}

const COLUMN_DEFINITIONS: TableProps.ColumnDefinition<ExtendedInstance>[] = [
  ...columnsConfig,
  {
    id: 'variable',
    header: 'Name',
    minWidth: 200,
    cell: item => {
      return item.name;
    },
    sortingField: 'variable',
  },
  {
    id: 'description',
    header: 'Description',
    cell: item => item.description || '-',
    sortingField: 'description',
  },
  {
    id: 'inline-edit',
    header: 'Editable cell',
    cell: item => item.alt || '-',
    editConfig: {
      ariaLabel: 'Edit first',
      editIconAriaLabel: 'editable',
      errorIconAriaLabel: 'Edit cell error',
      editingCell: (item, { currentValue, setValue }) => {
        return (
          <Input autoFocus={true} value={currentValue ?? item.name} onChange={event => setValue(event.detail.value)} />
        );
      },
    },
  },
];

const ariaLabels: TableProps<ExtendedInstance>['ariaLabels'] = {
  selectionGroupLabel: 'group label',
  activateEditLabel: column => `Edit ${column.header}`,
  cancelEditLabel: column => `Cancel editing ${column.header}`,
  submitEditLabel: column => `Submit edit ${column.header}`,
  allItemsSelectionLabel: ({ selectedItems }) =>
    `${selectedItems.length} ${selectedItems.length === 1 ? 'item' : 'items'} selected`,
  itemSelectionLabel: ({ selectedItems }, item) => {
    const isItemSelected = selectedItems.filter(i => i.name === item.name).length;
    return `${item.name} is ${isItemSelected ? '' : 'not'} selected`;
  },
  tableLabel: 'Demo table',
};

const selectionTypeOptions = [{ value: 'none' }, { value: 'single' }, { value: 'multi' }];

const stickyColumnsOptions = [{ value: '0' }, { value: '1' }, { value: '2' }, { value: '3' }];

export default () => {
  const {
    urlParams: {
      resizableColumns,
      stickyHeader,
      sortingDisabled,
      stripedRows,
      imitateServerExpand = true,
      imitateServerErrors,
      selectionType,
      stickyColumnsFirst,
    },
    setUrlParams,
  } = useContext(AppContext as DemoContext);
  const [selectedItems, setSelectedItems] = useState<any>([]);
  const { items, collectionProps, filterProps, filteredItemsCount, actions } = useCollection(allItems, {
    pagination: { pageSize: 999 },
    sorting: {},
    filtering: {},
    expandableRows: {
      getId: item => item.id,
      getParentId: item => item.parentId ?? null,
    },
  });
  const [serverExpandState, setServerExpandState] = useState(new Map<ExtendedInstance, TableProps.ExpandedItemState>());

  const requestQueue = useRef<ExtendedInstance[]>([]);
  useEffect(() => {
    const resolveRequest = () => {
      const first = requestQueue.current.shift();
      if (first) {
        setServerExpandState(prev => {
          const newMap = new Map<ExtendedInstance, TableProps.ExpandedItemState>();
          for (const [item, state] of prev) {
            newMap.set(item, state);
          }
          const errorProbability = imitateServerErrors ? 0.15 : 0;
          newMap.set(
            first,
            pseudoRandom() < 1 - errorProbability
              ? { type: 'ready' }
              : { type: 'error', errorText: 'Could not load nested items due to a server error' }
          );
          return newMap;
        });
      }
    };

    const interval1 = setInterval(resolveRequest, 2000);
    const interval2 = setInterval(resolveRequest, 3000);
    const interval3 = setInterval(resolveRequest, 3500);

    return () => {
      clearInterval(interval1);
      clearInterval(interval2);
      clearInterval(interval3);
    };
  }, [imitateServerErrors]);

  return (
    <ScreenshotArea>
      <h1>Expandable rows</h1>
      <SpaceBetween size="xl">
        <SpaceBetween direction="horizontal" size="m">
          <FormField label="Table flags">
            <Checkbox
              checked={resizableColumns}
              onChange={event => setUrlParams({ resizableColumns: event.detail.checked })}
            >
              Resizable columns
            </Checkbox>

            <Checkbox checked={stickyHeader} onChange={event => setUrlParams({ stickyHeader: event.detail.checked })}>
              Sticky header
            </Checkbox>

            <Checkbox
              checked={sortingDisabled}
              onChange={event => setUrlParams({ sortingDisabled: event.detail.checked })}
            >
              Sorting disabled
            </Checkbox>

            <Checkbox checked={stripedRows} onChange={event => setUrlParams({ stripedRows: event.detail.checked })}>
              Striped rows
            </Checkbox>

            <Checkbox
              checked={imitateServerExpand}
              onChange={event => setUrlParams({ imitateServerExpand: event.detail.checked })}
            >
              Imitate server expand
            </Checkbox>

            <Checkbox
              checked={imitateServerErrors}
              onChange={event => setUrlParams({ imitateServerErrors: event.detail.checked })}
            >
              Imitate server errors
            </Checkbox>
          </FormField>

          <FormField label="Selection type">
            <Select
              selectedOption={
                selectionTypeOptions.find(option => option.value === selectionType) ?? selectionTypeOptions[0]
              }
              options={selectionTypeOptions}
              onChange={event =>
                setUrlParams({
                  selectionType:
                    event.detail.selectedOption.value === 'single' || event.detail.selectedOption.value === 'multi'
                      ? event.detail.selectedOption.value
                      : undefined,
                })
              }
            />
          </FormField>

          <FormField label="Sticky columns first">
            <Select
              selectedOption={
                stickyColumnsOptions.find(option => option.value === stickyColumnsFirst) ?? stickyColumnsOptions[0]
              }
              options={stickyColumnsOptions}
              onChange={event => setUrlParams({ stickyColumnsFirst: event.detail.selectedOption.value })}
            />
          </FormField>
        </SpaceBetween>

        <SpaceBetween size="s" direction="horizontal">
          <TextFilter
            {...filterProps}
            filteringAriaLabel="Filter items"
            filteringPlaceholder="Find items"
            filteringClearAriaLabel="Clear"
            countText={getMatchesCountText(filteredItemsCount ?? 0)}
          />
          <Button
            onClick={() => {
              actions.setExpandedItems(allItems);

              if (imitateServerExpand) {
                setServerExpandState(() => {
                  const newMap = new Map();
                  requestQueue.current = [];
                  for (const item of allItems) {
                    newMap.set(item, { type: 'loading', loadingText: `Expanding item ${item.name}` });
                    requestQueue.current.push(item);
                  }
                  return newMap;
                });
              }
            }}
          >
            Expand all
          </Button>
          <Button
            onClick={() => {
              actions.setExpandedItems([]);

              if (imitateServerExpand) {
                setServerExpandState(new Map());
                requestQueue.current = [];
              }
            }}
          >
            Collapse all
          </Button>
        </SpaceBetween>

        <Table
          {...collectionProps}
          onExpandableItemToggle={event => {
            collectionProps.onExpandableItemToggle?.(event);

            if (imitateServerExpand) {
              setServerExpandState(prev => {
                const newMap = new Map<ExtendedInstance, TableProps.ExpandedItemState>();
                for (const [item, state] of prev) {
                  if (item !== event.detail.item) {
                    newMap.set(item, state);
                  }
                }
                requestQueue.current = requestQueue.current.filter(item => item !== event.detail.item);

                if (event.detail.expanded) {
                  newMap.set(event.detail.item, {
                    type: 'loading',
                    loadingText: `Expanding item ${event.detail.item.name}`,
                  });
                  requestQueue.current.push(event.detail.item);
                }

                return newMap;
              });
            }
          }}
          getItemExpandedState={item => serverExpandState.get(item) ?? { type: 'ready' }}
          data-test-id="small-table"
          stickyColumns={{ first: parseInt(stickyColumnsFirst || '0') }}
          resizableColumns={resizableColumns}
          stickyHeader={stickyHeader}
          sortingDisabled={sortingDisabled}
          selectionType={selectionType}
          stripedRows={stripedRows}
          columnDefinitions={COLUMN_DEFINITIONS}
          selectedItems={selectedItems}
          onSelectionChange={({ detail: { selectedItems } }) => setSelectedItems(selectedItems)}
          items={items}
          ariaLabels={{ ...ariaLabels, tableLabel: 'Small table' }}
          header={<Header counter={`(${filteredItemsCount ?? allItems.length})`}>Simple table</Header>}
          enableKeyboardNavigation={true}
        />
      </SpaceBetween>
    </ScreenshotArea>
  );
};
