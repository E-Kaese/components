// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import range from 'lodash/range';
import Link from '~components/link';
import TreeGrid, { TreeGridProps } from '~components/tree-grid';
import { TableProps } from '~components';
import { PageTemplate } from './page-template';
import { useAppSettings } from '../app/app-context';

interface Item {
  id: number;
  text: string;
  description: string;
  region: string;
  state: string;
}

const columnsConfig: TreeGridProps.ColumnDefinition<Item>[] = [
  {
    id: 'name',
    header: 'Name',
    cell: item => <Link href={`#${item.id}`}>{item.text}</Link>,
    width: 200,
  },
  {
    id: 'region',
    header: 'Region',
    cell: item => item.region,
    minWidth: 130,
    width: 130,
    sortingField: 'region',
  },
  {
    id: 'description',
    header: 'Description',
    minWidth: 100,
    cell: item => item.description,
  },
  {
    id: 'state',
    header: 'State',
    maxWidth: 150,
    cell: item => item.state,
  },
  {
    id: 'extra',
    header: 'Extra column',
    cell: () => '-',
  },
];

const items: Item[] = [
  {
    id: 0,
    text: 'Predefined width',
    description: 'Min width 100px',
    region: 'Min and max width',
    state: 'Max width 150px',
  },
  { id: 1, text: 'Instance 1', description: 'Small description', region: 'us-east-1', state: 'RUNNING' },
  { id: 2, text: 'Instance 2', description: 'Some a little longer description', region: 'us-west-2', state: 'RUNNING' },
  {
    id: 3,
    text: 'Instance 3',
    description: 'Very very very very very long description',
    region: 'us-west-2',
    state: 'RUNNING',
  },
  { id: 4, text: 'Instance 4', description: '-', region: 'us-east-2', state: 'STOPPED' },
  { id: 5, text: 'Instance 5', description: 'Normal length description', region: 'us-east-1', state: 'RUNNING' },
  ...range(6, 45).map(number => ({
    id: number,
    text: `Instance ${number}`,
    description: '-',
    region: 'undisclosed location',
    state: 'REDACTED',
  })),
];

export default function Page() {
  const [settings] = useAppSettings<Omit<TableProps, 'items' | 'columnDefinitions'>>({
    resizableColumns: true,
  });

  return (
    <PageTemplate title="TreeGrid playground">
      <TreeGrid<Item> items={items} columnDefinitions={columnsConfig} {...settings} />
    </PageTemplate>
  );
}
