// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React, { useEffect, useState } from 'react';
import Header from '~components/header';
import Link from '~components/link';
import SpaceBetween from '~components/space-between';
import { Box, CodeEditor, CodeEditorProps, Pagination } from '~components';
import { i18nStrings as codeEditorI18nStrings } from '../code-editor/base-props';
import styles from './styles.scss';
import { Instance, generateItems } from '../table/generate-data';

const items = generateItems(313);
const columnDefinitions = [
  { key: 'id', label: 'ID', render: (item: Instance) => <Link>{item.id}</Link> },
  { key: 'state', label: 'State', render: (item: Instance) => item.state },
  { key: 'type', label: 'Type', render: (item: Instance) => item.type },
  { key: 'imageId', label: 'Image ID', render: (item: Instance) => item.imageId },
  { key: 'dnsName', label: 'DNS name', render: (item: Instance) => item.dnsName ?? '?' },
  { key: 'dnsName2', label: 'DNS name 2', render: (item: Instance) => (item.dnsName ?? '?') + ':2' },
  { key: 'dnsName3', label: 'DNS name 3', render: (item: Instance) => (item.dnsName ?? '?') + ':3' },
];

export default function App() {
  const [ace, setAce] = useState<CodeEditorProps['ace']>();
  const [props, setProps] = useState<Record<string, unknown>>({
    pageSize: 30,
    hidePagination: false,
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

  const hidePagination = typeof props.hidePagination === 'boolean' ? props.hidePagination : false;
  const pageSize = typeof props.pageSize === 'number' ? props.pageSize : 30;
  const pages = Math.ceil(items.length / pageSize);
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const pageItems = items.slice(pageSize * (currentPageIndex - 1), pageSize * currentPageIndex);

  return (
    <SpaceBetween size="l">
      <Header variant="h1">Smooth pagination experiment</Header>

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

        <div className={styles['custom-table']}>
          {!hidePagination && (
            <Pagination
              currentPageIndex={currentPageIndex}
              pagesCount={pages}
              onChange={({ detail }) => setCurrentPageIndex(detail.currentPageIndex)}
            />
          )}

          <table className={styles['custom-table-table']}>
            <thead>
              <tr>
                {columnDefinitions.map(column => (
                  <th key={column.key} className={styles['custom-table-cell']}>
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageItems.map(item => (
                <tr key={item.id}>
                  {columnDefinitions.map(column => (
                    <td key={column.key} className={styles['custom-table-cell']}>
                      {column.render(item)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SpaceBetween>
  );
}
