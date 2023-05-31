// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React, { useEffect, useRef, useState } from 'react';
import { Box, CodeEditor, CodeEditorProps, FramePagination, Header, Link } from '~components';
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
items[0].id = 'FIRST';
items[items.length - 1].id = 'LAST';

interface PageSettings {
  frameSize: number;
  frameStep: number;
  hidePagination: boolean;
}

const defaultPageSettings: PageSettings = {
  frameSize: 20,
  frameStep: 5,
  hidePagination: false,
};

export default function App() {
  const [ace, setAce] = useState<CodeEditorProps['ace']>();
  const [props, setProps] = useState<PageSettings>(defaultPageSettings);
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

  const hidePagination =
    typeof props.hidePagination === 'boolean' ? props.hidePagination : defaultPageSettings.hidePagination;
  const frameSize = typeof props.frameSize === 'number' ? props.frameSize : defaultPageSettings.frameSize;
  const frameStep = typeof props.frameStep === 'number' ? props.frameStep : defaultPageSettings.frameStep;
  const [frameStart, setFrameStart] = useState(0);
  const frameStartRef = useRef(0);
  const pageItems = items.slice(frameStart, frameStart + frameSize);
  const totalItems = items.length;

  const containerRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<{ [index: number]: null | HTMLTableRowElement }>({});

  const [scrollProps, setScrollProps] = useState({
    averageRowHeight: 0,
    headerHeight: 0,
    renderedHeight: 0,
    heightBefore: 0,
    heightAfter: 0,
  });

  function updateFramePosition(frameStart: number) {
    frameStartRef.current = frameStart;
    setFrameStart(frameStart);

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

    const headerEl = rowRefs.current[-1];
    const headerHeight = headerEl ? headerEl.getBoundingClientRect().height : 0;

    setScrollProps({ averageRowHeight, headerHeight, renderedHeight, heightBefore, heightAfter });
  }

  useEffect(() => {
    const frameStart = frameStartRef.current;

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

    const headerEl = rowRefs.current[-1];
    const headerHeight = headerEl ? headerEl.getBoundingClientRect().height : 0;

    setScrollProps({ averageRowHeight, headerHeight, renderedHeight, heightBefore, heightAfter });
  }, [frameSize, totalItems]);

  const scrollable = scrollProps.heightBefore + scrollProps.heightAfter > 2;
  const containerHeight = scrollProps.headerHeight + scrollProps.renderedHeight;

  function scrollToIndex(index: number) {
    let renderedHeight = 0;

    const renderedRows = Math.min(frameSize, totalItems - index);
    for (let i = 0; i < renderedRows; i++) {
      const rowEl = rowRefs.current[i];
      const rowHeight = rowEl ? rowEl.getBoundingClientRect().height : 0;
      renderedHeight += rowHeight;
    }

    const averageRowHeight = renderedHeight / renderedRows;
    const heightBefore = index * averageRowHeight;

    setTimeout(() => {
      containerRef.current?.scrollTo({ top: heightBefore });
    }, 0);
  }

  // TODO: debounce
  function onScroll(scrollTop: number) {
    const delta = Math.round((scrollTop - scrollProps.heightBefore) / scrollProps.averageRowHeight);
    const nextFrameStart = Math.max(0, Math.min(totalItems - frameSize, frameStart + delta));
    updateFramePosition(nextFrameStart);
  }

  return (
    <Box padding="l">
      <Box margin={{ bottom: 'm' }}>
        <Header variant="h1">Experiment: Virtual scroll with frame pagination</Header>
      </Box>

      <Box>
        <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '16px' }}>
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
              <FramePagination
                frameSize={frameSize}
                frameStart={frameStart}
                totalItems={items.length}
                onChange={({ detail }) => {
                  scrollToIndex(detail.frameStart);
                }}
                onNextPageClick={() => {
                  const nextFrameStart = Math.min(totalItems, frameStart + frameStep);
                  scrollToIndex(nextFrameStart);
                }}
                onPreviousPageClick={() => {
                  const nextFrameStart = Math.max(0, frameStart - frameStep);
                  scrollToIndex(nextFrameStart);
                }}
              />
            )}

            <div
              ref={containerRef}
              className={styles['custom-table']}
              style={{
                overflowY: scrollable ? 'auto' : 'unset',
                height: scrollable ? containerHeight : 'unset',
              }}
              onScroll={event => onScroll((event.target as HTMLElement).scrollTop)}
            >
              <table className={styles['custom-table-table']}>
                <thead>
                  <tr
                    ref={node => {
                      rowRefs.current[-1] = node;
                    }}
                  >
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
    </Box>
  );
}
