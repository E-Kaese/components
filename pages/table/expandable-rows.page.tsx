// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React, { useContext, useState } from 'react';
import Table, { TableProps } from '~components/table';
import Header from '~components/header';
import SpaceBetween from '~components/space-between';
import ScreenshotArea from '../utils/screenshot-area';
import { columnLabel, getMatchesCountText } from './shared-configs';
import { useCollection } from '@cloudscape-design/collection-hooks';
import {
  Alert,
  Box,
  Button,
  ButtonDropdown,
  Checkbox,
  CollectionPreferences,
  CollectionPreferencesProps,
  ExpandableSection,
  FormField,
  Link,
  Pagination,
  Popover,
  PropertyFilter,
  Select,
  StatusIndicator,
  Textarea,
  Toggle,
} from '~components';
import AppContext, { AppContextType } from '../app/app-context';
import { allInstances, Instance, InstanceType } from './expandable-rows/expandable-rows-data';
import messages from '~components/i18n/messages/all.en';
import I18nProvider from '~components/i18n';
import { contentDisplayPreferenceI18nStrings } from '../common/i18n-strings';

type DemoContext = React.Context<
  AppContextType<{
    resizableColumns: boolean;
    stickyHeader: boolean;
    sortingDisabled: boolean;
    stripedRows: boolean;
    selectionType: undefined | 'single' | 'multi';
    groupResources: boolean;
    keepSelection: boolean;
    usePagination: boolean;
  }>
>;

function getHeaderCounterText<T>(items: ReadonlyArray<T>, selectedItems: ReadonlyArray<T> | undefined) {
  return selectedItems && selectedItems?.length > 0 ? `(${selectedItems.length}/${items.length})` : `(${items.length})`;
}

const ariaLabels: TableProps<Instance>['ariaLabels'] = {
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
  tableLabel: 'Databases table',
  expandButtonLabel: () => 'expand row',
  collapseButtonLabel: () => 'collapse row',
};

const selectionTypeOptions = [{ value: 'none' }, { value: 'single' }, { value: 'multi' }];

export default () => {
  const {
    urlParams: {
      resizableColumns = true,
      stickyHeader = true,
      sortingDisabled,
      stripedRows,
      selectionType = 'multi',
      groupResources = true,
      keepSelection,
      usePagination = false,
    },
    setUrlParams,
  } = useContext(AppContext as DemoContext);

  const [preferences, setPreferences] = useState<CollectionPreferencesProps.Preferences>({
    pageSize: 10,
    wrapLines: true,
    stickyColumns: { first: 0, last: 1 },
  });
  const [selectedCluster, setSelectedCluster] = useState<null | string>(null);
  const getScopedInstances = (selected: null | string) => {
    return selected === null ? allInstances : allInstances.filter(i => i.path.includes(selected));
  };

  const { items, collectionProps, paginationProps, propertyFilterProps, filteredItemsCount, actions } = useCollection(
    getScopedInstances(selectedCluster),
    {
      pagination: usePagination ? { pageSize: 10 } : undefined,
      sorting: {},
      filtering: {},
      propertyFiltering: {
        filteringProperties: [
          {
            key: 'path',
            propertyLabel: 'DB Name',
            groupValuesLabel: 'DB Name values',
            operators: [
              {
                operator: '=',
                match: (path: unknown, token: null | string) => Array.isArray(path) && path.includes(token),
              },
              {
                operator: ':',
                match: (path: unknown, token: null | string) =>
                  Array.isArray(path) && path.some(entry => entry.includes(token)),
              },
            ],
          },
          {
            key: 'role',
            propertyLabel: 'Role',
            groupValuesLabel: 'Role values',
            operators: ['='],
          },
          {
            key: 'state',
            propertyLabel: 'State',
            groupValuesLabel: 'State values',
            operators: ['=', '!='],
          },
          {
            key: 'engine',
            propertyLabel: 'Engine',
            groupValuesLabel: 'Engine values',
            operators: ['=', '!=', ':'],
          },
          {
            key: 'size',
            propertyLabel: 'Size',
            groupValuesLabel: 'Size values',
            operators: ['=', '!=', ':'],
          },
          {
            key: 'region',
            propertyLabel: 'Region',
            groupValuesLabel: 'Region values',
            operators: ['=', '!=', ':'],
          },
          {
            key: 'terminationReason',
            propertyLabel: 'Termination reason',
            groupValuesLabel: 'Termination reason values',
            operators: [':', '!;'],
          },
        ],
      },
      selection: { trackBy: 'name', keepSelection },
      expandableRows: groupResources
        ? {
            getId: item => item.name,
            getParentId: item => item.parentName,
          }
        : undefined,
    }
  );
  const filteringOptions = propertyFilterProps.filteringOptions.map(option =>
    option.propertyKey === 'path' ? { ...option, value: option.value.split(',')[0] } : option
  );

  const expandedInstances = collectionProps.expandableRows?.expandedItems ?? [];

  const columnDefinitions: TableProps.ColumnDefinition<Instance>[] = [
    {
      id: 'name',
      header: 'DB Name',
      cell: item => <Link href={`#${item.name}`}>{item.name}</Link>,
      ariaLabel: columnLabel('DB Name'),
      sortingField: 'name',
      minWidth: 200,
    },
    {
      id: 'role',
      header: 'Role',
      cell: item => (
        <InstanceTypeWrapper instanceType={item.type}>
          {item.type === 'instance'
            ? item.role
            : `${item.role} (${collectionProps.expandableRows?.getItemChildren(item).length ?? 0})`}
        </InstanceTypeWrapper>
      ),
      ariaLabel: columnLabel('Role'),
      sortingField: 'role',
    },
    {
      id: 'activity',
      header: 'Activity',
      cell: item => (
        <Box fontSize="body-s" color="text-body-secondary">
          {item.selectsPerSecond !== null ? `${item.selectsPerSecond} Selects/Sec` : '-'}
        </Box>
      ),
      ariaLabel: columnLabel('Activity'),
      sortingField: 'selectsPerSecond',
    },
    {
      id: 'state',
      header: 'State',
      cell: item => {
        const selfState = (() => {
          switch (item.state) {
            case 'RUNNING':
              return <StatusIndicator type="success">Running</StatusIndicator>;
            case 'STOPPED':
              return <StatusIndicator type="stopped">Stopped</StatusIndicator>;
            case 'TERMINATED':
              return <StatusIndicator type="error">Terminated</StatusIndicator>;
          }
        })();
        if (item.type === 'instance') {
          return selfState;
        }
        return (
          <Popover
            dismissButton={false}
            position="top"
            size="small"
            content={
              <SpaceBetween size="s" direction="horizontal">
                <StatusIndicator type="success">{item.stateGrouped.RUNNING}</StatusIndicator>
                <StatusIndicator type="stopped">{item.stateGrouped.STOPPED}</StatusIndicator>
                <StatusIndicator type="error">{item.stateGrouped.TERMINATED}</StatusIndicator>
              </SpaceBetween>
            }
          >
            {selfState}
          </Popover>
        );
      },
      ariaLabel: columnLabel('State'),
      sortingField: 'state',
    },
    {
      id: 'engine',
      header: 'Engine',
      cell: item => item.engine,
      ariaLabel: columnLabel('Engine'),
      sortingField: 'engine',
    },
    {
      id: 'size',
      header: 'Size',
      cell: item => <InstanceTypeWrapper instanceType={item.type}>{item.sizeGrouped || '-'}</InstanceTypeWrapper>,
      ariaLabel: columnLabel('Size'),
      sortingField: 'sizeGrouped',
    },
    {
      id: 'region',
      header: 'Region & AZ',
      cell: item => <InstanceTypeWrapper instanceType={item.type}>{item.regionGrouped}</InstanceTypeWrapper>,
      ariaLabel: columnLabel('Region & AZ'),
      sortingField: 'regionGrouped',
    },
    {
      id: 'termination-reason',
      header: 'Termination reason',
      cell: item => item.terminationReason || '-',
      editConfig: {
        ariaLabel: 'Edit termination reason',
        editIconAriaLabel: 'editable',
        errorIconAriaLabel: 'Edit cell error',
        editingCell: (item, { currentValue, setValue }) => (
          <Textarea
            autoFocus={true}
            value={currentValue ?? item.terminationReason}
            onChange={event => setValue(event.detail.value)}
          />
        ),
      },
      minWidth: 250,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: item => {
        if (item.children === 0) {
          return (
            <ButtonDropdown
              variant="inline-icon"
              ariaLabel={`Instance ${item.name} actions`}
              disabled={true}
              items={[]}
            />
          );
        }
        const scopedInstances = getScopedInstances(item.name);
        return (
          <ButtonDropdown
            expandToViewport={true}
            items={[
              { id: 'drill-down', text: `Show ${item.name} cluster only` },
              { id: 'expand-all', text: `Expand cluster` },
              { id: 'collapse-all', text: `Collapse cluster` },
            ]}
            variant="inline-icon"
            ariaLabel={`Instance ${item.name} actions`}
            onItemClick={event => {
              switch (event.detail.id) {
                case 'drill-down':
                  actions.setExpandedItems(scopedInstances);
                  setSelectedCluster(item.name);
                  break;
                case 'expand-all':
                  actions.setExpandedItems([...expandedInstances, ...scopedInstances]);
                  break;
                case 'collapse-all':
                  actions.setExpandedItems(expandedInstances.filter(i => !scopedInstances.includes(i)));
                  break;
                default:
                  throw new Error('Invariant violation: unexpected action.');
              }
            }}
          />
        );
      },
    },
  ];

  return (
    <I18nProvider messages={[messages]} locale="en">
      <Box>
        <Box variant="h1" margin="m">
          Expandable rows
        </Box>
        <div>
          <Box margin={{ horizontal: 'm' }}>
            <ExpandableSection
              variant="container"
              headerText="Page settings"
              headingTagOverride="h2"
              defaultExpanded={true}
            >
              <SpaceBetween direction="horizontal" size="m">
                <FormField label="Table flags">
                  <Checkbox
                    checked={resizableColumns}
                    onChange={event => setUrlParams({ resizableColumns: event.detail.checked })}
                  >
                    Resizable columns
                  </Checkbox>

                  <Checkbox
                    checked={stickyHeader}
                    onChange={event => {
                      setUrlParams({ stickyHeader: event.detail.checked });
                      window.location.reload();
                    }}
                  >
                    Sticky header
                  </Checkbox>

                  <Checkbox
                    checked={sortingDisabled}
                    onChange={event => setUrlParams({ sortingDisabled: event.detail.checked })}
                  >
                    Sorting disabled
                  </Checkbox>

                  <Checkbox
                    checked={stripedRows}
                    onChange={event => setUrlParams({ stripedRows: event.detail.checked })}
                  >
                    Striped rows
                  </Checkbox>

                  <Checkbox
                    checked={keepSelection}
                    onChange={event => setUrlParams({ keepSelection: event.detail.checked })}
                  >
                    Keep selection
                  </Checkbox>

                  <Checkbox
                    checked={usePagination}
                    onChange={event => setUrlParams({ usePagination: event.detail.checked })}
                  >
                    Use pagination
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
                          event.detail.selectedOption.value === 'single' ||
                          event.detail.selectedOption.value === 'multi'
                            ? event.detail.selectedOption.value
                            : undefined,
                      })
                    }
                  />
                </FormField>
              </SpaceBetween>
            </ExpandableSection>
          </Box>

          <ScreenshotArea>
            <Table
              {...collectionProps}
              stickyColumns={preferences.stickyColumns}
              resizableColumns={resizableColumns}
              stickyHeader={stickyHeader}
              sortingDisabled={sortingDisabled}
              selectionType={selectionType}
              stripedRows={stripedRows}
              columnDefinitions={columnDefinitions}
              items={items}
              ariaLabels={ariaLabels}
              wrapLines={preferences.wrapLines}
              pagination={usePagination && <Pagination {...paginationProps} />}
              columnDisplay={preferences.contentDisplay}
              preferences={
                <CollectionPreferences
                  title="Preferences"
                  confirmLabel="Confirm"
                  cancelLabel="Cancel"
                  onConfirm={({ detail }) => setPreferences(detail)}
                  preferences={preferences}
                  pageSizePreference={{
                    title: 'Select page size',
                    options: [
                      { value: 10, label: '10 Instances' },
                      { value: 25, label: '25 Instances' },
                      { value: 50, label: '50 Instances' },
                    ],
                  }}
                  contentDisplayPreference={{
                    title: 'Column preferences',
                    description: 'Customize the columns visibility and order.',
                    options: [
                      {
                        id: 'name',
                        label: 'DB Name',
                        alwaysVisible: true,
                      },
                      {
                        id: 'role',
                        label: 'Role',
                      },
                      {
                        id: 'activity',
                        label: 'Activity',
                      },
                      {
                        id: 'state',
                        label: 'State',
                      },
                      {
                        id: 'engine',
                        label: 'Engine',
                      },
                      {
                        id: 'size',
                        label: 'Size',
                      },
                      {
                        id: 'region',
                        label: 'Region & AZ',
                      },
                      {
                        id: 'termination-reason',
                        label: 'Termination reason',
                      },
                      {
                        id: 'actions',
                        label: 'Actions',
                      },
                    ],
                    ...contentDisplayPreferenceI18nStrings,
                  }}
                  wrapLinesPreference={{
                    label: 'Wrap lines',
                    description: 'Wrap lines description',
                  }}
                  stickyColumnsPreference={{
                    firstColumns: {
                      title: 'First column(s)',
                      description: 'Keep the first column(s) visible while horizontally scrolling table content.',
                      options: [
                        { label: 'None', value: 0 },
                        { label: 'First column', value: 1 },
                        { label: 'First two columns', value: 2 },
                      ],
                    },
                    lastColumns: {
                      title: 'Stick last visible column',
                      description: 'Keep the last column visible when tables are wider than the viewport.',
                      options: [
                        { label: 'Last column', value: 1 },
                        { label: 'Last two columns', value: 2 },
                      ],
                    },
                  }}
                />
              }
              header={
                <SpaceBetween size="m">
                  <Header
                    counter={getHeaderCounterText(allInstances, collectionProps.selectedItems)}
                    actions={
                      <SpaceBetween size="s" direction="horizontal" alignItems="center">
                        <Toggle
                          checked={groupResources}
                          onChange={event => setUrlParams({ groupResources: event.detail.checked })}
                        >
                          Group resources
                        </Toggle>

                        <ButtonDropdown
                          variant="normal"
                          items={[
                            { id: 'expand-all', text: 'Expand all', disabled: !groupResources },
                            { id: 'collapse-all', text: 'Collapse all', disabled: !groupResources },
                            {
                              id: 'terminate-selected',
                              text: 'Terminate selected instances',
                              disabled: collectionProps.selectedItems?.length === 0,
                            },
                          ]}
                          onItemClick={event => {
                            switch (event.detail.id) {
                              case 'expand-all':
                                return actions.setExpandedItems(allInstances);
                              case 'collapse-all':
                                return actions.setExpandedItems([]);
                              case 'terminate-selected':
                                return actions.setSelectedItems([]);
                              default:
                                throw new Error('Invariant violation: unsupported action.');
                            }
                          }}
                        >
                          Actions
                        </ButtonDropdown>
                      </SpaceBetween>
                    }
                  >
                    Databases
                  </Header>
                  {selectedCluster && (
                    <Alert
                      type="info"
                      action={<Button onClick={() => setSelectedCluster(null)}>Show all databases</Button>}
                    >
                      Showing databases that belong to{' '}
                      <Box variant="span" fontWeight="bold">
                        {selectedCluster}
                      </Box>{' '}
                      cluster.
                    </Alert>
                  )}
                </SpaceBetween>
              }
              filter={
                <PropertyFilter
                  {...propertyFilterProps}
                  filteringOptions={filteringOptions}
                  countText={getMatchesCountText(filteredItemsCount ?? 0)}
                  filteringPlaceholder="Search databases"
                />
              }
              enableKeyboardNavigation={true}
            />
          </ScreenshotArea>
        </div>
      </Box>
    </I18nProvider>
  );
};

function InstanceTypeWrapper({ instanceType, children }: { instanceType: InstanceType; children: React.ReactNode }) {
  return (
    <Box
      fontWeight={instanceType === 'instance' ? 'normal' : 'bold'}
      color={instanceType === 'instance' ? 'inherit' : 'text-body-secondary'}
    >
      {children}
    </Box>
  );
}
