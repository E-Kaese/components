// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React, { useMemo, useState } from 'react';
import Link from '~components/link';
import TreeGrid from '~components/tree-grid';
import { PageTemplate } from './page-template';
import { useAppSettings } from '../app/app-context';
import { Button, StatusIndicator, StatusIndicatorProps } from '~components';
import { InstanceItem, generateInstances } from './server';

const instances = generateInstances({ instances: 250 });

interface MetaItem<Item> {
  item: Item;
  level: number;
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

  const getInstanceMeta = useMemo(() => {
    const allInstances: MetaItem<InstanceItem>[] = [];
    for (const instance of instances) {
      allInstances.push({ item: instance, level: 1 });
      if (instance.replicas) {
        allInstances.push(...instance.replicas.map(item => ({ item, level: 2 })));
      }
    }
    const mapping = allInstances.reduce(
      (map, metaItem) => map.set(metaItem.item, metaItem),
      new Map<InstanceItem, MetaItem<InstanceItem>>()
    );
    return (item: InstanceItem) => {
      const meta = mapping.get(item)!;
      return { level: meta.level };
    };
  }, []);

  return (
    <PageTemplate title="TreeGrid playground">
      <TreeGrid
        items={visibleInstances}
        trackBy={item => item.id}
        columnDefinitions={[
          {
            id: 'id',
            header: 'ID',
            cell: item => (
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                  paddingLeft: (getInstanceMeta(item).level - 1) * 36 + 'px',
                }}
              >
                {item.replicas ? (
                  <Button
                    variant="icon"
                    iconName={expanded[item.id] ? 'treeview-collapse' : 'treeview-expand'}
                    onClick={() => {
                      setExpanded(prev => ({ ...prev, [item.id]: !prev[item.id] }));
                    }}
                    disabled={item.replicas.length === 0}
                  />
                ) : null}

                <Link href={`#${item.id}`}>{item.id}</Link>
              </div>
            ),
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
