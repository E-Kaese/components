// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React, { useEffect, useRef, useState } from 'react';
import Header from '~components/header';
import Link from '~components/link';
import SpaceBetween from '~components/space-between';
import { Box, CodeEditor, CodeEditorProps, Pagination } from '~components';
import { i18nStrings as codeEditorI18nStrings } from '../code-editor/base-props';
import styles from './styles.scss';
import { Instance, generateItems } from '../table/generate-data';
import clsx from 'clsx';

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
  const frameSize = typeof props.pageSize === 'number' ? props.pageSize : 30;
  const [frameStart, setFrameStart] = useState(0);
  const pageItems = items.slice(frameStart, frameStart + frameSize);
  const totalItems = items.length;

  const rowRefs = useRef<{ [index: number]: null | HTMLTableRowElement }>({});

  const [scrollProps, setScrollProps] = useState({
    renderedHeight: 0,
    heightBefore: 0,
    heightAfter: 0,
  });
  useEffect(() => {
    let renderedHeight = 0;

    const renderedRows = Math.min(frameSize, totalItems - frameStart);
    for (let i = 0; i < renderedRows; i++) {
      const rowEl = rowRefs.current[i];
      const rowHeight = rowEl ? rowEl.getBoundingClientRect().height : 0;
      renderedHeight += rowHeight;
    }

    const averageRowHeight = renderedHeight / renderedRows;
    const heightBefore = frameStart * averageRowHeight;
    const heightAfter = Math.max(0, totalItems - frameStart - frameSize) * averageRowHeight;
    setScrollProps({ renderedHeight, heightBefore, heightAfter });
  }, [frameStart, frameSize, totalItems]);

  return (
    <SpaceBetween size="l">
      <Header variant="h1">Smooth pagination experiment</Header>

      <Box>
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

          <div style={{ overflowX: 'auto' }}>
            {!hidePagination && (
              <SmoothPagination
                frameSize={frameSize}
                frameStart={frameStart}
                frameStep={Math.ceil(frameSize / 3)}
                totalItems={items.length}
                onChange={frameStart => {
                  setFrameStart(frameStart);
                  // TODO: FORCE TABLE SCROLL
                }}
              />
            )}

            <div className={styles['custom-table']}>
              <table
                className={styles['custom-table-table']}
                onScroll={() => {
                  // TODO: MOVE FRAME
                }}
              >
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
                  {scrollProps.heightBefore > 1 ? (
                    <tr>
                      <td
                        colSpan={columnDefinitions.length}
                        style={{ padding: 0, margin: 0, height: scrollProps.heightBefore }}
                      />
                    </tr>
                  ) : null}

                  {pageItems.map((item, index) => (
                    <tr
                      key={item.id}
                      ref={node => {
                        rowRefs.current[index] = node;
                      }}
                    >
                      {columnDefinitions.map(column => (
                        <td key={column.key} className={styles['custom-table-cell']}>
                          {column.render(item)}
                        </td>
                      ))}
                    </tr>
                  ))}

                  {scrollProps.heightAfter > 1 ? (
                    <tr>
                      <td
                        colSpan={columnDefinitions.length}
                        style={{ padding: 0, margin: 0, height: scrollProps.heightAfter }}
                      />
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Box>
    </SpaceBetween>
  );
}

// TODO: create components/frame-pagination and improve its UX
function SmoothPagination({
  frameSize,
  frameStart,
  totalItems,
  frameStep,
  onChange,
}: {
  frameSize: number;
  frameStart: number;
  totalItems: number;
  frameStep: number;
  onChange: (frameStart: number) => void;
}) {
  const paginationRef = useRef<HTMLDivElement>(null);
  const [frameOffset, setFrameOffset] = useState(0);

  const pagesCount = Math.ceil(items.length / frameSize);

  const indexBefore = Math.floor(frameStart / frameSize);
  const indexAfter = indexBefore + 1;
  const indexClosest =
    frameStart - indexBefore * frameSize <= indexAfter * frameSize - frameStart ? indexBefore : indexAfter;

  function onChangePage(pageIndex: number) {
    onChange(pageIndex * frameSize);
  }

  function onNextPageClick() {
    onChange(Math.min(totalItems - 1, frameStart + frameStep));
  }

  function onPrevPageClick() {
    onChange(Math.max(0, frameStart - frameStep));
  }

  useEffect(() => {
    if (!paginationRef.current) {
      return;
    }
    const closestEl = paginationRef.current.querySelector(`button[aria-label="${indexClosest + 1}"]`)!;
    const closestElOffset = closestEl.getBoundingClientRect().x - paginationRef.current.getBoundingClientRect().x;
    const closestElWidth = closestEl.getBoundingClientRect().width;
    const diff = closestElWidth * ((frameStart - indexClosest * frameSize) / frameSize);

    setFrameOffset(closestElOffset - 2 + diff);
  }, [indexClosest, frameSize, frameStart, totalItems]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div ref={paginationRef} style={{ position: 'relative' }}>
        <Pagination
          currentPageIndex={indexClosest + 1}
          pagesCount={pagesCount}
          onChange={({ detail }) => onChangePage(detail.currentPageIndex - 1)}
          onNextPageClick={onNextPageClick}
          onPreviousPageClick={onPrevPageClick}
        />

        <div
          style={{
            position: 'absolute',
            left: frameOffset,
            top: 4,
            width: 24,
            height: 24,
            background: 'rgba(9, 114, 211, 0.33)',
            pointerEvents: 'none',
          }}
        />
      </div>

      <Box fontSize="body-s">
        {frameStart} — {Math.min(totalItems, frameStart + frameSize)} of {totalItems}
      </Box>
    </div>
  );
}
