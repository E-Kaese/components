// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React, { useContext, useState } from 'react';
import Table from '~components/table';
import SpaceBetween from '~components/space-between';
import AppLayout from '~components/app-layout';
import ScreenshotArea from '../utils/screenshot-area';
import { columnsConfig } from './shared-configs';
import { Instance, generateItems } from './generate-data';
import { useCollection } from '@cloudscape-design/collection-hooks';
import {
  Checkbox,
  ContentLayout,
  FormField,
  Header,
  Select,
  TextFilter,
  Drawer,
  PropertyFilter,
  ExpandableSection,
  Box,
  Button,
} from '~components';
import AppContext, { AppContextType } from '../app/app-context';
import pseudoRandom from '../utils/pseudo-random';

type DemoContext = React.Context<
  AppContextType<{
    loading: boolean;
    resizableColumns: boolean;
    stickyHeader: boolean;
    sortingDisabled: boolean;
    keepAllChildrenWhenParentMatched: boolean;
    selectionType: undefined | 'single' | 'multi';
    stripedStyle: undefined | 'row' | 'level';
    iconType: 'tree' | 'angle' | 'caret';
    filterType: undefined | 'text' | 'property';
    showMoreType: 'left' | 'centered';
  }>
>;

const selectionTypeOptions = [{ value: 'none' }, { value: 'single' }, { value: 'multi' }];
const stripedStyleOptions = [{ value: 'none' }, { value: 'row' }, { value: 'level' }];
const iconTypeOptions = [{ value: 'tree' }, { value: 'angle' }, { value: 'caret' }];
const filterOptions = [{ value: 'none' }, { value: 'text' }, { value: 'property' }];
const showMoreStyle = [{ value: 'left' }, { value: 'centered' }];

const l1items = generateItems(50) as (Instance & { parentId: null | string })[];
const l2items = generateItems(200) as (Instance & { parentId: null | string })[];
const l3items = generateItems(400) as (Instance & { parentId: null | string })[];

for (const l3 of l3items) {
  l3.parentId = l2items[Math.floor(pseudoRandom() * l2items.length)].id;
}
for (const l2 of l2items) {
  l2.parentId = l1items[Math.floor(pseudoRandom() * l1items.length)].id;
}
for (const l1 of l1items) {
  l1.parentId = null;
}

const allItems = [...l1items, ...l2items, ...l3items];

function Settings({ urlParams, setUrlParams }: any) {
  return (
    <Drawer header={<h2>Settings</h2>}>
      <SpaceBetween size="xl">
        <ExpandableSection headerText="Table properties" defaultExpanded={true}>
          <SpaceBetween size="l">
            <FormField label="Selection type">
              <Select
                selectedOption={
                  selectionTypeOptions.find(option => option.value === urlParams.selectionType) ??
                  selectionTypeOptions[0]
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
            <FormField label="Filter type">
              <Select
                selectedOption={filterOptions.find(option => option.value === urlParams.filterType) ?? filterOptions[0]}
                options={filterOptions}
                onChange={event =>
                  setUrlParams({
                    filterType:
                      event.detail.selectedOption.value === 'text' || event.detail.selectedOption.value === 'property'
                        ? event.detail.selectedOption.value
                        : undefined,
                  })
                }
              />
            </FormField>
            <FormField label="Flags">
              <Checkbox checked={urlParams.loading} onChange={event => setUrlParams({ loading: event.detail.checked })}>
                Loading
              </Checkbox>

              <Checkbox
                checked={urlParams.resizableColumns}
                onChange={event => setUrlParams({ resizableColumns: event.detail.checked })}
              >
                Resizable columns
              </Checkbox>

              <Checkbox
                checked={urlParams.stickyHeader}
                onChange={event => setUrlParams({ stickyHeader: event.detail.checked })}
              >
                Sticky header
              </Checkbox>

              <Checkbox
                checked={urlParams.sortingDisabled}
                onChange={event => setUrlParams({ sortingDisabled: event.detail.checked })}
              >
                Sorting disabled
              </Checkbox>

              <Checkbox
                checked={urlParams.keepAllChildrenWhenParentMatched}
                onChange={event => setUrlParams({ keepAllChildrenWhenParentMatched: event.detail.checked })}
              >
                Keep all children when parent matches
              </Checkbox>
            </FormField>
          </SpaceBetween>
        </ExpandableSection>

        <ExpandableSection headerText="Visual styles" defaultExpanded={true}>
          <SpaceBetween size="l">
            <FormField label="Striped rows">
              <Select
                selectedOption={
                  stripedStyleOptions.find(option => option.value === urlParams.stripedStyle) ?? stripedStyleOptions[0]
                }
                options={stripedStyleOptions}
                onChange={event =>
                  setUrlParams({
                    stripedStyle:
                      event.detail.selectedOption.value === 'row' || event.detail.selectedOption.value === 'level'
                        ? event.detail.selectedOption.value
                        : undefined,
                  })
                }
              />
            </FormField>
            <FormField label="Icon type">
              <Select
                selectedOption={
                  iconTypeOptions.find(option => option.value === urlParams.iconType) ?? iconTypeOptions[0]
                }
                options={iconTypeOptions}
                onChange={event => setUrlParams({ iconType: event.detail.selectedOption.value })}
              />
            </FormField>
            <FormField label="Show more style">
              <Select
                selectedOption={
                  showMoreStyle.find(option => option.value === urlParams.showMoreType) ?? showMoreStyle[0]
                }
                options={showMoreStyle}
                onChange={event => {
                  setUrlParams({ showMoreType: event.detail.selectedOption.value });
                  document.body.setAttribute(
                    'data-related-table-test-show-more',
                    event.detail.selectedOption.value ?? showMoreStyle[0].value
                  );
                }}
              />
            </FormField>
          </SpaceBetween>
        </ExpandableSection>
      </SpaceBetween>
    </Drawer>
  );
}

const getAriaLabels = (title: string, badge: boolean) => {
  return {
    closeButton: `${title} close button`,
    drawerName: `${title}`,
    triggerButton: `${title} trigger button${badge ? ' (Unread notifications)' : ''}`,
    resizeHandle: `${title} resize handle`,
  };
};

export default function Page() {
  const { urlParams, setUrlParams } = useContext(AppContext as DemoContext);
  const [selectedItems, setSelectedItems] = useState<any>([]);
  const [activeDrawerId, setActiveDrawerId] = useState<string | null>('settings');

  const { items, collectionProps, filterProps, filteredItemsCount, actions, propertyFilterProps } = useCollection(
    allItems,
    {
      pagination: { pageSize: 15 },
      groupPagination: { pageSize: () => 5 },
      sorting: {},
      filtering: {},
      propertyFiltering: {
        filteringProperties: FILTERING_PROPERTIES,
        empty: 'empty',
        noMatch: (
          <Box textAlign="center" color="inherit">
            <Box variant="strong" textAlign="center" color="inherit">
              No matches
            </Box>
            <Box variant="p" padding={{ bottom: 's' }} color="inherit">
              We can’t find a match.
            </Box>
            <Button
              onClick={() =>
                actions.setPropertyFiltering({ tokens: [], operation: propertyFilterProps.query.operation })
              }
            >
              Clear filter
            </Button>
          </Box>
        ),
      },
      treeProps: {
        getId: item => item.id,
        getParentId: item => item.parentId,
        keepAllChildrenWhenParentMatched: urlParams.keepAllChildrenWhenParentMatched,
      },
    }
  );

  return (
    <ScreenshotArea gutters={false}>
      <AppLayout
        maxContentWidth={Number.MAX_VALUE}
        navigationHide={true}
        toolsHide={true}
        drawers={[
          {
            ariaLabels: getAriaLabels('Settings', false),
            content: <Settings urlParams={urlParams} setUrlParams={setUrlParams} />,
            id: 'settings',
            resizable: true,
            trigger: {
              iconName: 'settings',
            },
          },
        ]}
        onDrawerChange={event => setActiveDrawerId(event.detail.activeDrawerId)}
        activeDrawerId={activeDrawerId}
        content={
          <ContentLayout header={<Header variant="h1">Table with expandable groups</Header>}>
            <Table
              {...collectionProps}
              {...urlParams}
              header={
                <Header
                  counter={`${allItems.length} (${filteredItemsCount})`}
                  actions={
                    <SpaceBetween size="s" direction="horizontal">
                      <Button
                        onClick={() => {
                          actions.setAllExpanded(true);
                        }}
                      >
                        Expand all
                      </Button>
                      <Button
                        onClick={() => {
                          actions.setAllExpanded(false);
                        }}
                      >
                        Collapse all
                      </Button>
                    </SpaceBetween>
                  }
                >
                  Test data
                </Header>
              }
              filter={
                urlParams.filterType === 'property' ? (
                  <PropertyFilter
                    {...propertyFilterProps}
                    i18nStrings={{
                      filteringAriaLabel: 'Find values',
                      filteringPlaceholder: 'Find values',
                    }}
                    countText={`${items.length} matches`}
                    expandToViewport={true}
                  />
                ) : urlParams.filterType === 'text' ? (
                  <TextFilter {...filterProps} />
                ) : undefined
              }
              columnDefinitions={columnsConfig}
              selectedItems={selectedItems}
              onSelectionChange={({ detail: { selectedItems } }) => setSelectedItems(selectedItems)}
              items={items}
              stripedRows={urlParams.stripedStyle === 'row'}
              stripedLevels={urlParams.stripedStyle === 'level'}
              expandIconType={urlParams.iconType}
            />
          </ContentLayout>
        }
      />
    </ScreenshotArea>
  );
}

const FILTERING_PROPERTIES = [
  {
    propertyLabel: 'ID',
    key: 'id',
    groupValuesLabel: 'ID values',
    operators: [':', '!:', '=', '!=', '^'],
  },
  {
    propertyLabel: 'Type',
    key: 'type',
    groupValuesLabel: 'Type values',
    operators: [':', '!:', '=', '!=', '^'],
  },
  {
    propertyLabel: 'DNS name',
    key: 'dnsName',
    groupValuesLabel: 'DNS name values',
    operators: [':', '!:', '=', '!=', '^'],
  },
  {
    propertyLabel: 'Image ID',
    key: 'imageId',
    groupValuesLabel: 'Image ID values',
    operators: [':', '!:', '=', '!=', '^'],
  },
  { propertyLabel: 'State', key: 'state', groupValuesLabel: 'State values', operators: [':', '!:', '=', '!=', '^'] },
];
