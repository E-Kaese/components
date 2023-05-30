// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React, { useEffect, useState } from 'react';
import range from 'lodash/range';
import Header from '~components/header';
import Link from '~components/link';
import SpaceBetween from '~components/space-between';
import TreeGrid, { TreeGridProps } from '~components/tree-grid';
import { Box, CodeEditor, CodeEditorProps, TableProps } from '~components';
import { i18nStrings as codeEditorI18nStrings } from '../code-editor/base-props';

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

export default function App() {
  const [ace, setAce] = useState<CodeEditorProps['ace']>();
  const [props, setProps] = useState<Omit<TableProps, 'items' | 'columnDefinitions'>>({
    resizableColumns: true,
  });
  const [propsStr, setPropsStr] = useState(JSON.stringify(props, null, 2));
  const [aceLoading, setAceLoading] = useState(true);
  useEffect(() => {
    import('ace-builds').then(ace => {
      ace.config.set('basePath', './ace/');
      ace.config.set('useStrictCSP', true);
      setAce(ace);
      setAceLoading(false);
    });
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        setProps(JSON.parse(propsStr));
      } catch {
        // ignore
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [propsStr]);

  return (
    <SpaceBetween size="l">
      <Header variant="h1">TreeGrid playground</Header>

      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '16px', padding: '16px' }}>
        <Box>
          <CodeEditor
            ace={ace}
            value={propsStr}
            language="json"
            onDelayedChange={event => setPropsStr(event.detail.value)}
            onPreferencesChange={() => {}}
            loading={aceLoading}
            i18nStrings={codeEditorI18nStrings}
          />
        </Box>

        <TreeGrid<Item> items={items} columnDefinitions={columnsConfig} {...props} />
      </div>
    </SpaceBetween>
  );
}
