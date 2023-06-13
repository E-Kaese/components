// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React, { useMemo, useRef, useState } from 'react';
import Link from '~components/link';
import TreeGrid, { TreeGridProps } from '~components/tree-grid';
import { PageTemplate } from './page-template';
import { useAppSettings } from '../app/app-context';
import { Box, Button, Header, StatusIndicator, StatusIndicatorProps } from '~components';
import { InstanceItem, generateInstances } from './server';
import { colorBorderControlDefault } from '~design-tokens';
import pseudoRandom from '../utils/pseudo-random';

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

  const [loadingItem, setLoadingItem] = useState<null | string>(null);

  const [expanded, setExpanded] = useState<{ [id: string]: number }>({});
  const [error, setError] = useState<{ [id: string]: string }>({});

  const lastExpandedRef = useRef<string | null>(null);
  const visibleInstances = useMemo(() => {
    const visibleInstances: InstanceItem[] = [];
    for (const instance of instances) {
      visibleInstances.push(instance);
      if (expanded[instance.id] !== undefined && instance.replicas) {
        visibleInstances.push(...instance.replicas.slice(0, expanded[instance.id]));

        if (instance.replicas.length === 0) {
          visibleInstances.push({
            id: loadingItem === instance.id ? `${instance.id}-control` : `${instance.id}-empty`,
            name: '',
            url: '',
            state: 'ERROR',
            cpuCores: 0,
            memoryGib: 0,
            availabilityZone: '',
          });
        } else if (expanded[instance.id] < instance.replicas.length) {
          visibleInstances.push({
            id: `${instance.id}-control`,
            name: '',
            url: '',
            state: 'ERROR',
            cpuCores: 0,
            memoryGib: 0,
            availabilityZone: '',
          });
        }
      }
    }
    return visibleInstances;
  }, [expanded, loadingItem]);

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
      const meta = mapping.get(item);
      if (!meta) {
        return { level: 2, isLast: true };
      }
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
        getIsShaded={item => getInstanceMeta(item).level === 2}
        onRowAction={rowIndex => {
          const item = visibleInstances[rowIndex];
          const id = item.id.replace('-control', '');

          if (!item.replicas && !item.id.includes('-control')) {
            return;
          }

          if (!item.id.includes('-control') && expanded[id] !== undefined) {
            setExpanded(prev => {
              const copy = { ...prev };
              delete copy[id];
              return copy;
            });
          } else if (expanded[id] !== undefined) {
            if (loadingItem !== id) {
              setLoadingItem(id);

              setTimeout(() => {
                if (pseudoRandom() > 0.3) {
                  setExpanded(prev => ({ ...prev, [id]: prev[id] + 5 }));
                  setError(prev => {
                    const copy = { ...prev };
                    delete copy[id];
                    return copy;
                  });
                } else {
                  setError(prev => ({ ...prev, [id]: 'Server error' }));
                }

                setLoadingItem(null);
              }, 500);
            }
          } else {
            setLoadingItem(id);
            setExpanded(prev => ({ ...prev, [id]: 0 }));

            setTimeout(() => {
              if (pseudoRandom() > 0.3) {
                setExpanded(prev => ({ ...prev, [id]: 5 }));
                setError(prev => {
                  const copy = { ...prev };
                  delete copy[id];
                  return copy;
                });
              } else {
                setError(prev => ({ ...prev, [id]: 'Server error' }));
              }

              setLoadingItem(null);
              lastExpandedRef.current = id;
            }, 500);
          }
        }}
        // stickyColumns={{ first: 1 }}
        columnDefinitions={[
          {
            id: 'id',
            header: 'ID',
            minWidth: 300,
            cell: item => {
              const meta = getInstanceMeta(item);

              const id = item.id.replace('-control', '');

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

                  {expanded[item.id] !== undefined ? (
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
                          if (expanded[item.id] !== undefined) {
                            setExpanded(prev => {
                              const copy = { ...prev };
                              delete copy[id];
                              return copy;
                            });
                          } else {
                            setLoadingItem(item.id);
                            setExpanded(prev => ({ ...prev, [item.id]: 0 }));

                            setTimeout(() => {
                              if (pseudoRandom() > 0.3) {
                                setExpanded(prev => ({ ...prev, [item.id]: 5 }));
                                setError(prev => {
                                  const copy = { ...prev };
                                  delete copy[id];
                                  return copy;
                                });
                              } else {
                                setError(prev => ({ ...prev, [id]: 'Server error' }));
                              }

                              setLoadingItem(null);
                              lastExpandedRef.current = item.id;
                            }, 500);
                          }
                        }}
                      />
                    </div>
                  ) : null}

                  {item.id.includes('control') ? (
                    <Link
                      onFollow={e => {
                        e.preventDefault();

                        if (loadingItem !== id) {
                          setLoadingItem(id);

                          setTimeout(() => {
                            if (pseudoRandom() > 0.3) {
                              setExpanded(prev => ({ ...prev, [id]: prev[id] + 5 }));
                              setError(prev => {
                                const copy = { ...prev };
                                delete copy[id];
                                return copy;
                              });
                            } else {
                              setError(prev => ({ ...prev, [id]: 'Server error' }));
                            }

                            setLoadingItem(null);
                          }, 500);
                        }
                      }}
                    >
                      {loadingItem === id ? (
                        <StatusIndicator type="loading">Loading more items</StatusIndicator>
                      ) : error[id] ? (
                        <StatusIndicator type="error">{error[id]}. Click to retry</StatusIndicator>
                      ) : (
                        'Show 5 more'
                      )}
                    </Link>
                  ) : item.id.includes('empty') ? (
                    <Box color="text-body-secondary">No replicas</Box>
                  ) : (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <Link href={`#${item.id}`}>{item.id}</Link>

                      {item.replicas ? (
                        <Box color="text-body-secondary" fontSize="body-s">
                          ({item.replicas?.length || 0})
                        </Box>
                      ) : null}
                    </div>
                  )}
                </div>
              );
            },
          },
          {
            id: 'name',
            header: 'Name',
            cell: item => (item.id.includes('control') || item.id.includes('empty') ? '' : item.name),
            minWidth: 200,
            sortingField: 'region',
          },
          {
            id: 'url',
            header: 'URL',
            minWidth: 200,
            cell: item => (item.id.includes('control') || item.id.includes('empty') ? '' : item.url),
          },
          {
            id: 'state',
            header: 'State',
            minWidth: 125,
            maxWidth: 200,
            cell: item => {
              if (item.id.includes('control') || item.id.includes('empty')) {
                return '';
              }

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
            cell: item => (item.id.includes('control') || item.id.includes('empty') ? '' : item.cpuCores),
          },
          {
            id: 'memoryGib',
            header: 'Memory (GiB)',
            cell: item => (item.id.includes('control') || item.id.includes('empty') ? '' : item.memoryGib),
          },
          {
            id: 'availabilityZone',
            header: 'AZ',
            cell: item => (item.id.includes('control') || item.id.includes('empty') ? '' : item.availabilityZone),
          },
          {
            id: 'availabilityZone2',
            header: 'AZ 2',
            cell: item => (item.id.includes('control') || item.id.includes('empty') ? '' : item.availabilityZone),
          },
          {
            id: 'availabilityZone3',
            header: 'AZ 3',
            cell: item => (item.id.includes('control') || item.id.includes('empty') ? '' : item.availabilityZone),
          },
          {
            id: 'availabilityZone4',
            header: 'AZ 4',
            cell: item => (item.id.includes('control') || item.id.includes('empty') ? '' : item.availabilityZone),
          },
          {
            id: 'availabilityZone5',
            header: 'AZ 5',
            cell: item => (item.id.includes('control') || item.id.includes('empty') ? '' : item.availabilityZone),
          },
          {
            id: 'availabilityZone6',
            header: 'AZ 6',
            cell: item => (item.id.includes('control') || item.id.includes('empty') ? '' : item.availabilityZone),
          },
          {
            id: 'availabilityZone7',
            header: 'AZ 7',
            cell: item => (item.id.includes('control') || item.id.includes('empty') ? '' : item.availabilityZone),
          },
          {
            id: 'availabilityZone8',
            header: 'AZ 8',
            cell: item => (item.id.includes('control') || item.id.includes('empty') ? '' : item.availabilityZone),
          },
          {
            id: 'availabilityZone9',
            header: 'AZ 9',
            cell: item => (item.id.includes('control') || item.id.includes('empty') ? '' : item.availabilityZone),
          },
          {
            id: 'availabilityZone10',
            header: 'AZ 10',
            cell: item => (item.id.includes('control') || item.id.includes('empty') ? '' : item.availabilityZone),
          },
        ]}
        stickyHeader={settings.features.stickyHeader}
        resizableColumns={settings.features.resizableColumns}
      />
    </PageTemplate>
  );
}
