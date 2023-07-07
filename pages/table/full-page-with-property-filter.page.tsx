// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React, { useState } from 'react';
import AppLayout from '~components/app-layout';
import Box from '~components/box';
import Table from '~components/table';
import PropertyFilter from '~components/property-filter';
import Header from '~components/header';
import Button from '~components/button';
import ScreenshotArea from '../utils/screenshot-area';
import { Breadcrumbs, Navigation, Tools } from '../app-layout/utils/content-blocks';
import labels from '../app-layout/utils/labels';
import { allItems, states, TableItem } from '../property-filter/table.data';
import { columnDefinitions, i18nStrings, filteringProperties } from '../property-filter/common-props';
import { useCollection } from '@cloudscape-design/collection-hooks';
import Pagination from '~components/pagination';
import CollectionPreferences, { CollectionPreferencesProps } from '~components/collection-preferences';
import { contentDisplayPreference, defaultPreferences, pageSizeOptions } from './shared-configs';
import { contentDisplayPreferenceI18nStrings } from '../common/i18n-strings';
import * as toolsContent from '../app-layout/utils/tools-content';
import Link from '~components/link';
import SpaceBetween from '~components/space-between';

export default function () {
  const { items, collectionProps, actions, propertyFilterProps } = useCollection(allItems, {
    propertyFiltering: {
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
            onClick={() => {
              actions.setPropertyFiltering({ tokens: [], operation: propertyFilterProps.query.operation });
            }}
          >
            Clear filter
          </Button>
        </Box>
      ),
      filteringProperties,
      defaultQuery: {
        tokens: [
          {
            propertyKey: 'instanceid',
            operator: '=',
            value: 'i-2dc5ce28a0328391',
          },
          {
            propertyKey: 'state',
            operator: '=',
            value: '0',
          },
          {
            propertyKey: 'instancetype',
            operator: '=',
            value: 't3.small',
          },
          {
            propertyKey: 'averagelatency',
            operator: '=',
            value: '17',
          },
          {
            propertyKey: 'availablestorage',
            operator: '=',
            value: '8.9',
          },
          {
            propertyKey: 'owner',
            operator: '=',
            value: 'admin551',
          },
          {
            propertyKey: 'privateipaddress',
            operator: '=',
            value: '192.190.155.33',
          },
          {
            propertyKey: 'publicdns',
            operator: '=',
            value: 'ec2-29-10-26-56.us-west-2.compute.amazonaws.com',
          },
          {
            propertyKey: 'publicdns',
            operator: '=',
            value: 'ec2-29-10-26-56.us-west-2.compute.amazonaws.com',
          },
          {
            propertyKey: 'ipv4publicip',
            operator: '=',
            value: '66.67.16.87',
          },
        ],
        operation: 'and',
      },
    },
    sorting: {},
  });

  const filteringOptions = propertyFilterProps.filteringOptions.map(option => {
    if (option.propertyKey === 'state') {
      option.label = states[parseInt(option.value)];
    }
    return option;
  });

  const [toolsOpen, setToolsOpen] = useState(false);

  const [preferences, setPreferences] = useState<CollectionPreferencesProps.Preferences>({
    ...defaultPreferences,
    // set to true for default striped rows.
    stripedRows: true,
  });

  const onInfoLinkClick = () => {
    setToolsOpen(true);
  };

  return (
    <ScreenshotArea gutters={false}>
      <AppLayout
        ariaLabels={labels}
        breadcrumbs={<Breadcrumbs />}
        navigation={<Navigation />}
        tools={<Tools>{toolsContent.long}</Tools>}
        toolsOpen={toolsOpen}
        content={
          <Table<TableItem>
            className="main-content"
            stickyHeader={true}
            variant="full-page"
            header={
              <Header
                variant="awsui-h1-sticky"
                info={
                  <Link onFollow={onInfoLinkClick} ariaLabel={`Information about something.`}>
                    Info
                  </Link>
                }
                actions={
                  <SpaceBetween size="xs" direction="horizontal">
                    <Button data-testid="header-btn-view-details" disabled={true}>
                      View details
                    </Button>
                    <Button data-testid="header-btn-edit" disabled={false}>
                      Edit
                    </Button>
                    <Button data-testid="header-btn-delete" disabled={false}>
                      Delete
                    </Button>
                    <Button data-testid="header-btn-create" variant="primary">
                      Create
                    </Button>
                  </SpaceBetween>
                }
                counter={'(100)'}
              >
                Distributions
              </Header>
            }
            items={items}
            selectionType="multi"
            {...collectionProps}
            pagination={<Pagination currentPageIndex={0} pagesCount={10} />}
            filter={
              <PropertyFilter
                {...propertyFilterProps}
                filteringOptions={filteringOptions}
                virtualScroll={true}
                countText={`${items.length} matches`}
                i18nStrings={i18nStrings}
                expandToViewport={true}
              />
            }
            columnDefinitions={columnDefinitions.slice(0, 2)}
            preferences={
              <CollectionPreferences
                title="Preferences"
                confirmLabel="Confirm"
                cancelLabel="Cancel"
                onConfirm={({ detail }) => setPreferences(detail)}
                preferences={preferences}
                pageSizePreference={{
                  title: 'Select page size',
                  options: pageSizeOptions,
                }}
                contentDisplayPreference={{
                  ...contentDisplayPreference,
                  ...contentDisplayPreferenceI18nStrings,
                }}
                wrapLinesPreference={{
                  label: 'Wrap lines',
                  description: 'Wrap lines description',
                }}
                stripedRowsPreference={{
                  label: 'Striped rows',
                  description: 'Striped rows description',
                }}
              />
            }
          />
        }
      />
    </ScreenshotArea>
  );
}
