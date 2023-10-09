// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Checkbox, ContentLayout, Header, Icon, StatusIndicator } from '~components';
import styles from './styles.scss';
import {
  getTableCellRoleProps,
  getTableColHeaderRoleProps,
  getTableHeaderRowRoleProps,
  getTableRoleProps,
  getTableRowRoleProps,
  getTableWrapperRoleProps,
  useGridNavigation,
} from '~components/table/table-role';
import { Dictionary, groupBy, mapValues, orderBy, range, sortBy } from 'lodash';
import pseudoRandom from '../utils/pseudo-random';
import { format } from 'date-fns';
import * as tokens from '~design-tokens';

const K = 1000;
const M = 1000 ** 2;

function formatAmount(size: number): string {
  if (size < M) {
    return `${(size / K).toFixed(2)}k`;
  }
  return `${(size / M).toFixed(2)}M`;
}

function plural(count: number, word: string) {
  return count === 1 ? word : word + 's';
}

function randomId() {
  function id4() {
    return (((1 + pseudoRandom()) * 0x10000) | 0).toString(16).substring(1);
  }
  return id4() + '-' + id4() + '-' + id4() + '-' + id4();
}

function randomDate() {
  const startDate = new Date('2022-01-01').getTime();
  const endDate = new Date('2023-10-12').getTime();
  return new Date(startDate + Math.round(pseudoRandom() * (endDate - startDate)));
}

interface Device {
  parentDevice: null | string;
  id: string;
  external: boolean;
  status: 'hibernating' | 'connecting' | 'connected' | 'failed';
  ownerId: string;
  operatingCost: number;
  lastUpdateDate: Date;
}

interface DeviceNode {
  level: number;
  device: Device;
  relatedDevices: readonly DeviceNode[];
}

interface DeviceRow {
  parentDevice: null | string;
  id: string;
  linkedDevices: number;
  external: boolean | number;
  status: Device['status'] | { hibernating: number; connecting: number; connected: number; failed: number };
  ownerId: string | number;
  operatingCost: number | { average: number; total: number };
  lastUpdateDate: string;
  level: number;
  group: string;
}

const statuses = [
  ...range(3).map(() => 'hibernating'),
  ...range(3).map(() => 'connecting'),
  ...range(6).map(() => 'connected'),
  ...range(1).map(() => 'failed'),
] as ('hibernating' | 'connecting' | 'connected' | 'failed')[];

const owners = [
  'Mr Cloud',
  'Mrs Scape',
  'Dr Foundation',
  'Prof Color',
  'Sir Layout',
  'Herr Muster',
  'Frau Komponente',
  'Lord Motion',
  'Chancellor Design',
  'Master Ally',
  'His Honour Customer',
];

const allDevices: readonly Device[] = range(0, 1024).map(() => ({
  parentDevice: null,
  id: randomId(),
  external: pseudoRandom() > 0.5,
  status: statuses[Math.floor(pseudoRandom() * statuses.length)],
  ownerId: owners[Math.floor(pseudoRandom() * owners.length)],
  operatingCost: pseudoRandom() * 250,
  lastUpdateDate: randomDate(),
}));

function makeRandomBatches(devices: readonly Device[], [from, until]: [number, number]): Device[][] {
  const batches: Device[][] = [];

  let sliceIndex = 0;
  do {
    const sliceFrom = sliceIndex;
    sliceIndex += from + Math.floor(pseudoRandom() * (until - from));
    batches.push(devices.slice(sliceFrom, sliceIndex));
  } while (sliceIndex < devices.length);

  return batches;
}

const l1devices = allDevices.slice(0, 16);
const l2batches = makeRandomBatches(allDevices.slice(16, 255), [5, 15]);
const l3batches = makeRandomBatches(allDevices.slice(255), [1, 12]);

let l2BatchIndex = 0;
let l3BatchIndex = 0;

const deviceNodes: DeviceNode[] = l1devices.map(l1Device => ({
  level: 1,
  device: l1Device,
  relatedDevices: (l2batches[l2BatchIndex++] ?? []).map(l2Device => ({
    level: 2,
    device: { ...l2Device, parentDevice: l1Device.id },
    relatedDevices: (l3batches[l3BatchIndex++] ?? []).map(l3Device => ({
      level: 3,
      device: { ...l3Device, parentDevice: l2Device.id },
      relatedDevices: [],
    })),
  })),
}));

export default function Page() {
  const [sortingKey, setSortingKey] = useState<null | string>(null);
  const [sortingDirection, setSortingDirection] = useState<1 | -1>(1);
  const [expandedRows, setExpandedRows] = useState<Dictionary<number>>({ ALL: 10 });
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);

  const tableRole = 'grid';
  const tableRef = useRef<HTMLTableElement>(null);

  useGridNavigation({ active: true, pageSize: 10, getTable: () => tableRef.current });

  const deviceRows: readonly DeviceRow[] = useMemo(() => {
    const deviceRows: DeviceRow[] = [];

    function sortNodes(nodes: readonly DeviceNode[]) {
      if (!sortingKey) {
        return nodes;
      }
      return orderBy(nodes, [`device.${sortingKey}`], [sortingDirection === -1 ? 'desc' : 'asc']);
    }

    function processNode(node: DeviceNode) {
      const children = sortNodes(node.relatedDevices);

      if (node.device.id !== 'ALL') {
        deviceRows.push({
          parentDevice: node.device.parentDevice,
          id: node.device.id,
          linkedDevices: getDevices(children).length,
          external: node.device.external,
          status: node.device.status,
          ownerId: node.device.ownerId,
          operatingCost: node.device.operatingCost,
          lastUpdateDate: format(node.device.lastUpdateDate, 'yyyy-MM-dd hh:mm'),
          level: node.level,
          group: node.device.id,
        });
      }

      children.slice(0, expandedRows[node.device.id] ?? 0).forEach(processNode);

      if (expandedRows[node.device.id] && expandedRows[node.device.id] < children.length) {
        const remDevices = getDevices(children.slice(expandedRows[node.device.id]));

        deviceRows.push({
          parentDevice: node.device.id,
          id: `${node.device.id}-loader`,
          linkedDevices: remDevices.length,
          external: remDevices.filter(d => d.external).length,
          status: aggregateStatus(remDevices),
          ownerId: new Set(remDevices.map(d => d.ownerId)).size,
          operatingCost: aggregateCost(remDevices),
          lastUpdateDate: aggregateDate(remDevices),
          level: node.level + 1,
          group: 'Load more devices',
        });
      }
    }

    processNode({ level: 0, device: { parentDevice: null, id: 'ALL' } as any, relatedDevices: deviceNodes });

    function getDevices(nodes: readonly DeviceNode[]): Device[] {
      const devices: Device[] = [];
      for (const node of nodes) {
        devices.push(node.device);
        devices.push(...getDevices(node.relatedDevices));
      }
      return devices;
    }

    function aggregateStatus(devices: Device[]) {
      return mapValues(groupBy(devices, 'status'), ts => ts.length) as any;
    }

    function aggregateCost(devices: Device[]) {
      const total = devices.reduce((acc, t) => acc + t.operatingCost, 0);
      return { average: total / devices.length, total };
    }

    function aggregateDate(devices: Device[], formatStr = 'MMM yyyy') {
      if (devices.length === 0) {
        return '-';
      }

      const sorted = sortBy([...devices], 'lastUpdateDate');
      return `${format(sorted[0].lastUpdateDate, formatStr)} - ${format(
        sorted[sorted.length - 1].lastUpdateDate,
        formatStr
      )}`;
    }

    return deviceRows;
  }, [sortingKey, sortingDirection, expandedRows]);

  useEffect(() => {
    const ids = new Set(deviceRows.map(r => r.id));
    const visibleSelected = selectedDevices.filter(id => ids.has(id));
    if (visibleSelected.length < selectedDevices.length) {
      setSelectedDevices(visibleSelected);
    }
  }, [deviceRows, selectedDevices]);

  const visibleDevices = deviceRows.filter(d => !d.id.includes('loader'));

  const columnDefinitions = [
    {
      key: 'selection',
      label: (
        <Box margin={{ left: 'xxs' }}>
          <Checkbox
            checked={selectedDevices.length === visibleDevices.length}
            indeterminate={selectedDevices.length > 0 && selectedDevices.length < visibleDevices.length}
            onChange={() =>
              setSelectedDevices(prev => (prev.length < visibleDevices.length ? visibleDevices.map(d => d.id) : []))
            }
          />
        </Box>
      ),
      render: (row: DeviceRow) => {
        if (row.id.includes('loader')) {
          return null;
        }

        return (
          <Box margin={{ left: 'xxs' }}>
            <Checkbox
              checked={selectedDevices.includes(row.id)}
              onChange={() =>
                setSelectedDevices(prev => {
                  const next = prev.filter(id => id !== row.id);
                  return next.length !== prev.length ? next : [...next, row.id];
                })
              }
            />
          </Box>
        );
      },
    },
    {
      key: 'group',
      label: (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="inline-icon" iconName="treeview-expand" disabled={true} />
          <span>Device ID</span>
        </div>
      ),
      render: (item: DeviceRow) => {
        if (item.id.includes('loader')) {
          const parentId = item.parentDevice ?? 'ALL';
          return (
            <Button
              variant="inline-link"
              onClick={() => setExpandedRows(prev => ({ ...prev, [parentId]: prev[parentId] + 10 }))}
            >
              {item.group}
            </Button>
          );
        }

        return item.level !== 3 ? (
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              variant="inline-icon"
              iconName={expandedRows[item.id] ? 'treeview-collapse' : 'treeview-expand'}
              onClick={() =>
                setExpandedRows(prev => {
                  const next = { ...prev, [item.id]: prev[item.id] ? 0 : 10 };
                  return next;
                })
              }
            />
            <span>{item.group}</span>
          </div>
        ) : (
          <div style={{ paddingLeft: '8px' }}>{item.group}</div>
        );
      },
    },
    {
      key: 'linkedDevices',
      label: 'Linked devices',
      render: (item: DeviceRow) => item.linkedDevices,
    },
    {
      key: 'ownerId',
      label: 'Owner',
      render: (item: DeviceRow) =>
        typeof item.ownerId === 'string' ? item.ownerId : `${item.ownerId} ${plural(item.ownerId, 'owner')}`,
    },
    {
      key: 'external',
      label: 'External',
      render: (item: DeviceRow) =>
        typeof item.external === 'boolean'
          ? item.external
            ? 'Yes'
            : 'No'
          : `${item.external} ${plural(item.external, 'device')}`,
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: DeviceRow) => {
        switch (item.status) {
          case 'hibernating':
            return <StatusIndicator type="pending">Hibernating</StatusIndicator>;
          case 'connecting':
            return <StatusIndicator type="in-progress">Connecting</StatusIndicator>;
          case 'connected':
            return <StatusIndicator type="success">Connected</StatusIndicator>;
          case 'failed':
            return <StatusIndicator type="error">Failed</StatusIndicator>;
          default:
            return (
              <StatusIndicator type={item.status.failed ? 'error' : 'success'}>
                {item.status.failed ?? 0} failed
              </StatusIndicator>
            );
        }
      },
    },
    {
      key: 'operatingCost',
      label: 'Operating cost',
      render: (item: DeviceRow) =>
        typeof item.operatingCost === 'number'
          ? '$' + item.operatingCost.toFixed(2)
          : `total = $${formatAmount(item.operatingCost.total)} / avg = $${item.operatingCost.average.toFixed(0)}`,
    },
    {
      key: 'lastUpdateDate',
      label: 'Last update date',
      render: (item: DeviceRow) => item.lastUpdateDate,
    },
  ];

  return (
    <ContentLayout
      header={
        <Box padding="m">
          <Header
            variant="h1"
            counter={
              selectedDevices.length ? `(${allDevices.length} / ${selectedDevices.length})` : `(${allDevices.length})`
            }
          >
            Devices
          </Header>
        </Box>
      }
    >
      <Box>
        <div className={styles['custom-table']} {...getTableWrapperRoleProps({ tableRole, isScrollable: false })}>
          <table
            ref={tableRef}
            className={styles['custom-table-table']}
            {...getTableRoleProps({
              tableRole,
              totalItemsCount: deviceRows.length,
              totalColumnsCount: columnDefinitions.length,
            })}
          >
            <thead>
              <tr {...getTableHeaderRowRoleProps({ tableRole })}>
                {columnDefinitions.map((column, colIndex) => (
                  <th
                    key={column.key}
                    className={styles['custom-table-cell']}
                    {...getTableColHeaderRoleProps({ tableRole, colIndex })}
                  >
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'nowrap' }}>
                      {column.key === 'selection' || column.key === 'group' ? (
                        column.label
                      ) : (
                        <>
                          <button
                            className={styles['custom-table-sorting-header']}
                            onClick={() => {
                              if (sortingKey !== column.key) {
                                setSortingKey(column.key);
                                setSortingDirection(-1);
                              } else {
                                setSortingDirection(prev => (prev === 1 ? -1 : 1));
                              }
                            }}
                            style={{ cursor: 'pointer' }}
                          >
                            {column.label}
                          </button>
                          {sortingKey === column.key && sortingDirection === -1 && <Icon name="angle-down" />}
                          {sortingKey === column.key && sortingDirection === 1 && <Icon name="angle-up" />}
                        </>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {deviceRows.map((row, rowIndex) => (
                <tr key={row.id} {...getTableRowRoleProps({ tableRole, rowIndex, firstIndex: 0 })}>
                  {columnDefinitions.map((column, colIndex) => (
                    <td
                      key={column.key}
                      className={styles['custom-table-cell']}
                      {...getTableCellRoleProps({ tableRole, colIndex })}
                      style={{
                        paddingLeft: column.key === 'group' ? `${16 + (row.level - 1) * 24}px` : undefined,
                        background: row.level !== 3 ? tokens.colorBackgroundCellShaded : undefined,
                      }}
                    >
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Box>
    </ContentLayout>
  );
}
