// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from '~components/link';
import TreeGrid, { TreeGridProps } from '~components/tree-grid';
import { PageTemplate } from './page-template';
import { useAppSettings } from '../app/app-context';
import { Button, Header, StatusIndicator, StatusIndicatorProps } from '~components';
import { InstanceItem, generateInstances } from './server';
import { colorBorderControlDefault } from '~design-tokens';

const instances = generateInstances({ instances: 250 });

interface MetaItem<Item> extends MetaData {
  item: Item;
}

interface MetaData {
  level: number;
  isLast: boolean;
}

export default function Page() {
  const [settings] = useAppSettings({
    features: {
      stickyHeader: true,
      resizableColumns: true,
    },
    asyncProps: {
      pageSize: 20,
    },
    virtualizationProps: {
      frameSize: 20,
    },
  });

  const [expanded, setExpanded] = useState<{ [id: string]: boolean }>({});
  const lastExpandedRef = useRef<string | null>(null);
  const visibleInstances = useMemo(() => {
    const visibleInstances: InstanceItem[] = [];
    for (const instance of instances) {
      visibleInstances.push(instance);
      if (expanded[instance.id] && instance.replicas) {
        visibleInstances.push(...instance.replicas);
      }
    }
    return visibleInstances;
  }, [expanded]);

  useEffect(() => {
    const lastExpandedIndex = visibleInstances.findIndex(i => i.id === lastExpandedRef.current);
    if (lastExpandedIndex !== -1) {
      gridRef.current?.scrollToIndex(lastExpandedIndex);
    }
  }, [visibleInstances]);

  const getInstanceMeta = useMemo(() => {
    const allInstances: MetaItem<InstanceItem>[] = [];
    for (let instanceIndex = 0; instanceIndex < instances.length; instanceIndex++) {
      const instance = instances[instanceIndex];

      allInstances.push({ item: instance, level: 1, isLast: instanceIndex === instances.length - 1 });
      if (instance.replicas) {
        allInstances.push(
          ...instance.replicas.map((item, replicaIndex) => ({
            item,
            level: 2,
            isLast: replicaIndex === (instance.replicas?.length || 0) - 1,
          }))
        );
      }
    }
    const mapping = allInstances.reduce(
      (map, metaItem) => map.set(metaItem.item, metaItem),
      new Map<InstanceItem, MetaItem<InstanceItem>>()
    );
    return (item: InstanceItem) => {
      const { ...meta } = mapping.get(item)!;
      return { ...meta };
    };
  }, []);

  const gridRef = useRef<TreeGridProps.Ref>(null);

  return (
    <PageTemplate title="TreeGrid playground">
      <TreeGrid
        ref={gridRef}
        header={<Header>Instances</Header>}
        items={visibleInstances}
        trackBy={item => item.id}
        columnDefinitions={[
          {
            id: 'id',
            header: 'ID',
            minWidth: 200,
            cell: item => {
              const meta = getInstanceMeta(item);

              return (
                <div
                  style={{
                    position: 'relative',
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center',
                    paddingLeft: (meta.level - 1) * 36 + 'px',
                  }}
                >
                  {meta.level > 1 ? (
                    <div
                      style={{
                        position: 'absolute',
                        width: (meta.level - 1) * 20 + 'px',
                        left: (meta.level - 1) * 12 + 'px',
                        top: -8 - 1,
                        bottom: -8 - 1,
                      }}
                    >
                      <svg aria-hidden={true} style={{ position: 'absolute', width: '100%', height: '100%' }}>
                        <line
                          x1="0"
                          x2="100%"
                          y1="50%"
                          y2="50%"
                          style={{
                            stroke: colorBorderControlDefault,
                            strokeWidth: 1,
                          }}
                        />

                        <line
                          x1="0"
                          x2="0"
                          y1="0%"
                          y2={meta.isLast ? '50%' : '100%'}
                          style={{
                            stroke: colorBorderControlDefault,
                            strokeWidth: 2,
                          }}
                        />
                      </svg>
                    </div>
                  ) : null}

                  {expanded[item.id] ? (
                    <div
                      style={{
                        position: 'absolute',
                        width: '2px',
                        left: '12px',
                        top: -8 - 1,
                        bottom: -8 - 1,
                      }}
                    >
                      <svg aria-hidden={true} style={{ position: 'absolute', width: '100%', height: '100%' }}>
                        <line
                          x1="0"
                          x2="0"
                          y1="calc(50% + 6px)"
                          y2="100%"
                          style={{
                            stroke: colorBorderControlDefault,
                            strokeWidth: 2,
                          }}
                        />
                      </svg>
                    </div>
                  ) : null}

                  {item.replicas ? (
                    <div style={{ marginLeft: '-2px' }}>
                      <Button
                        variant="icon"
                        iconName={expanded[item.id] ? 'treeview-collapse' : 'treeview-expand'}
                        onClick={() => {
                          setExpanded(prev => ({ ...prev, [item.id]: !prev[item.id] }));
                          lastExpandedRef.current = item.id;
                        }}
                        disabled={item.replicas.length === 0}
                      />
                    </div>
                  ) : null}

                  <Link href={`#${item.id}`}>{item.id}</Link>
                </div>
              );
            },
          },
          {
            id: 'name',
            header: 'Name',
            cell: item => item.name,
            minWidth: 130,
            sortingField: 'region',
          },
          {
            id: 'url',
            header: 'URL',
            minWidth: 100,
            cell: item => item.url,
          },
          {
            id: 'state',
            header: 'State',
            maxWidth: 150,
            cell: item => {
              const type: StatusIndicatorProps.Type = (() => {
                switch (item.state) {
                  case 'RUNNING':
                    return 'success';
                  case 'STARTING':
                    return 'in-progress';
                  case 'STOPPED':
                    return 'stopped';
                  case 'STOPPING':
                    return 'in-progress';
                  case 'ERROR':
                    return 'error';
                }
              })();
              return <StatusIndicator type={type}>{item.state}</StatusIndicator>;
            },
          },
          {
            id: 'cpuCores',
            header: 'vCPU',
            cell: item => item.cpuCores,
          },
          {
            id: 'memoryGib',
            header: 'Memory (GiB)',
            cell: item => item.memoryGib,
          },
          {
            id: 'availabilityZone',
            header: 'Availability zone',
            cell: item => item.availabilityZone,
          },
        ]}
        stickyHeader={settings.features.stickyHeader}
        resizableColumns={settings.features.resizableColumns}
      />
    </PageTemplate>
  );
}
