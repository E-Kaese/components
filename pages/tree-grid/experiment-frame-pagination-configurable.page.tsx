// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React, { useEffect, useRef, useState } from 'react';
import { FramePagination, Link } from '~components';
import styles from './styles.scss';
import { Instance, generateItems } from '../table/generate-data';
import clsx from 'clsx';
import { PageTemplate } from './page-template';
import { useVirtualScroll } from './use-virtual-scroll';
import { useAppSettings } from '../app/app-context';

const items = generateItems(313);
items[0].id = 'FIRST';
items[items.length - 1].id = 'LAST';

const columnDefinitions = [
  { key: 'id', label: 'ID', render: (item: Instance) => <Link>{item.id}</Link> },
  { key: 'state', label: 'State', render: (item: Instance) => item.state },
  { key: 'type', label: 'Type', render: (item: Instance) => item.type },
  { key: 'imageId', label: 'Image ID', render: (item: Instance) => item.imageId },
  { key: 'dnsName', label: 'DNS name', render: (item: Instance) => item.dnsName ?? '?' },
  { key: 'dnsName2', label: 'DNS name 2', render: (item: Instance) => (item.dnsName ?? '?') + ':2' },
  { key: 'dnsName3', label: 'DNS name 3', render: (item: Instance) => (item.dnsName ?? '?') + ':3' },
];

interface PageSettings {
  frameSize: number;
  frameStep: number;
  hidePagination: boolean;
  containerHeight?: number;
}

const defaultPageSettings: PageSettings = {
  frameSize: 20,
  frameStep: 5,
  hidePagination: false,
  containerHeight: 0,
};

export default function App() {
  const [settings] = useAppSettings<PageSettings>(defaultPageSettings);

  const hidePagination =
    typeof settings.hidePagination === 'boolean' ? settings.hidePagination : defaultPageSettings.hidePagination;
  const frameSize = typeof settings.frameSize === 'number' ? settings.frameSize : defaultPageSettings.frameSize;
  const frameStep = typeof settings.frameStep === 'number' ? settings.frameStep : defaultPageSettings.frameStep;

  const tableHeaderRef = useRef<HTMLTableRowElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  useEffect(() => {
    if (tableHeaderRef.current) {
      setHeaderHeight(tableHeaderRef.current.getBoundingClientRect().height);
    }
  }, []);

  const virtualScroll = useVirtualScroll({ items, frameSize });

  const containerHeight = settings.containerHeight || headerHeight + virtualScroll.scroll.renderedHeight;

  return (
    <PageTemplate title="Experiment: Virtual scroll with frame pagination">
      {!hidePagination && (
        <FramePagination
          frameSize={frameSize}
          frameStart={virtualScroll.frame.frameStart}
          totalItems={items.length}
          onChange={({ detail }) => virtualScroll.functions.scrollToIndex(detail.frameStart)}
          onNextPageClick={() => virtualScroll.functions.scrollToIndex(virtualScroll.frame.frameStart + frameStep)}
          onPreviousPageClick={() => virtualScroll.functions.scrollToIndex(virtualScroll.frame.frameStart - frameStep)}
        />
      )}

      <div
        ref={virtualScroll.refs.container}
        className={styles['custom-table']}
        style={{
          overflowY: virtualScroll.scrollable ? 'auto' : 'unset',
          height: virtualScroll.scrollable ? containerHeight : 'unset',
        }}
        onScroll={event => virtualScroll.handlers.onScroll((event.target as HTMLElement).scrollTop)}
      >
        <table className={styles['custom-table-table']}>
          <thead>
            <tr ref={tableHeaderRef}>
              {columnDefinitions.map(column => (
                <th key={column.key} className={clsx(styles['custom-table-cell'], styles['custom-table-header'])}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {virtualScroll.scroll.heightBefore > 0 ? (
              <tr>
                <td
                  colSpan={columnDefinitions.length}
                  style={{ padding: 0, margin: 0, height: virtualScroll.scroll.heightBefore }}
                />
              </tr>
            ) : null}

            {virtualScroll.frame.items.map((item, index) => (
              <tr key={item.id} ref={virtualScroll.refs.row.bind(null, index)}>
                {columnDefinitions.map(column => (
                  <td key={column.key} className={styles['custom-table-cell']}>
                    {column.render(item)}
                  </td>
                ))}
              </tr>
            ))}

            {virtualScroll.scroll.heightAfter > 0 ? (
              <tr>
                <td
                  colSpan={columnDefinitions.length}
                  style={{ padding: 0, margin: 0, height: virtualScroll.scroll.heightAfter }}
                />
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </PageTemplate>
  );
}
