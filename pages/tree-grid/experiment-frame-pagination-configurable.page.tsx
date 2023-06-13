// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React, { useRef } from 'react';
import { FramePagination, Link } from '~components';
import styles from './styles.scss';
import { Instance, generateItems } from '../table/generate-data';
import clsx from 'clsx';
import { PageTemplate } from './page-template';
import { useVirtualScroll } from '~components/tree-grid/virtual-scroll';
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

  const containerRef = useRef<HTMLDivElement>(null);
  const virtualScroll = useVirtualScroll({ size: items.length, frameSize, getContainer: () => containerRef.current });
  const frameStart = virtualScroll.frame[0];

  return (
    <PageTemplate title="Experiment: Virtual scroll with frame pagination">
      {!hidePagination && (
        <FramePagination
          frameSize={frameSize}
          frameStart={frameStart}
          totalItems={items.length}
          onChange={({ detail }) => virtualScroll.scrollToIndex(detail.frameStart)}
          onNextPageClick={() => virtualScroll.scrollToIndex(frameStart + frameStep)}
          onPreviousPageClick={() => virtualScroll.scrollToIndex(frameStart - frameStep)}
        />
      )}

      <div
        ref={containerRef}
        className={styles['custom-table']}
        style={{
          overflowY: 'auto',
          height: '800px',
        }}
      >
        <table className={styles['custom-table-table']}>
          <thead>
            <tr>
              {columnDefinitions.map(column => (
                <th key={column.key} className={clsx(styles['custom-table-cell'], styles['custom-table-header'])}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            <tr>
              <td
                ref={virtualScroll.elBeforeRef}
                colSpan={columnDefinitions.length}
                style={{ padding: 0, margin: 0, height: 0 }}
              />
            </tr>

            {virtualScroll.frame.map(index => {
              const item = items[index];
              return (
                <tr key={item.id} ref={virtualScroll.setItemRef.bind(null, index)}>
                  {columnDefinitions.map(column => (
                    <td key={column.key} className={styles['custom-table-cell']}>
                      {column.render(item)}
                    </td>
                  ))}
                </tr>
              );
            })}

            <tr>
              <td
                ref={virtualScroll.elAfterRef}
                colSpan={columnDefinitions.length}
                style={{ padding: 0, margin: 0, height: 0 }}
              />
            </tr>
          </tbody>
        </table>
      </div>
    </PageTemplate>
  );
}
