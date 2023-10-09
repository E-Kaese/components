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
import { Dictionary, orderBy, range } from 'lodash';
import pseudoRandom from '../utils/pseudo-random';
import { format } from 'date-fns';
import * as tokens from '~design-tokens';

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

interface Station {
  id: string;
  name: string;
  devices: Device[];
  status: 'ready' | 'active' | 'inactive' | 'error';
}

interface Device {
  station: string;
  id: string;
  primary: boolean;
  status: 'hibernating' | 'connecting' | 'connected' | 'failed';
  ownerId: string;
  operatingCost: number;
  lastUpdateDate: Date;
}

const stationStatuses = [
  ...range(3).map(() => 'ready'),
  ...range(3).map(() => 'inactive'),
  ...range(6).map(() => 'active'),
  ...range(1).map(() => 'error'),
] as ('ready' | 'active' | 'inactive' | 'error')[];

const deviceStatuses = [
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

const stationNames = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa', 'Lambda'];

const allStations: readonly Station[] = stationNames.map(name => {
  const stationId = randomId();

  return {
    id: stationId,
    name,
    status: stationStatuses[Math.floor(pseudoRandom() * stationStatuses.length)],
    devices: range(0, Math.floor(pseudoRandom() * 12)).map(() => ({
      station: stationId,
      id: randomId(),
      primary: pseudoRandom() > 0.5,
      status: deviceStatuses[Math.floor(pseudoRandom() * deviceStatuses.length)],
      ownerId: owners[Math.floor(pseudoRandom() * owners.length)],
      operatingCost: pseudoRandom() * 250,
      lastUpdateDate: randomDate(),
    })),
  };
});

export default function Page() {
  const [sortingKey, setSortingKey] = useState<null | string>(null);
  const [sortingDirection, setSortingDirection] = useState<1 | -1>(1);
  const [expandedRows, setExpandedRows] = useState<Dictionary<number>>({});
  const [selectedStations, setSelectedStations] = useState<string[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);

  const tableRole = 'grid';
  const tableRef = useRef<HTMLTableElement>(null);

  useGridNavigation({ active: true, pageSize: 10, getTable: () => tableRef.current });

  const sortedStations: Station[] = useMemo(() => {
    return orderBy(allStations, [sortingKey], [sortingDirection === -1 ? 'desc' : 'asc']) as any;
  }, [sortingKey, sortingDirection]);

  const visibleDevices = useMemo(
    () => allStations.filter(s => expandedRows[s.id]).flatMap(s => s.devices),
    [expandedRows]
  );

  useEffect(() => {
    const ids = new Set(visibleDevices.map(r => r.id));
    const visibleSelected = selectedDevices.filter(id => ids.has(id));
    if (visibleSelected.length < selectedDevices.length) {
      setSelectedDevices(visibleSelected);
    }
  }, [visibleDevices, selectedDevices]);

  const stationColumnDefinitions = [
    {
      key: 'selection',
      label: (
        <Box margin={{ left: 'xxs' }}>
          <Checkbox
            checked={selectedStations.length === allStations.length}
            indeterminate={selectedStations.length > 0 && selectedStations.length < allStations.length}
            onChange={() =>
              setSelectedStations(prev => (prev.length < allStations.length ? allStations.map(d => d.id) : []))
            }
          />
        </Box>
      ),
      render: (row: Station) => (
        <Box margin={{ left: 'xxs' }}>
          <Checkbox
            checked={selectedStations.includes(row.id)}
            onChange={() =>
              setSelectedStations(prev => {
                const next = prev.filter(id => id !== row.id);
                return next.length !== prev.length ? next : [...next, row.id];
              })
            }
          />
        </Box>
      ),
    },
    {
      key: 'devices',
      sortingKey: 'devices.length',
      label: (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="inline-icon" iconName="treeview-expand" disabled={true} />
          <span>Devices</span>
        </div>
      ),
      render: (item: Station) => {
        return (
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
            <span>
              {item.devices.filter(d => d.primary).length} primary and {item.devices.filter(d => !d.primary).length}{' '}
              secondary devices
            </span>
          </div>
        );
      },
    },
    {
      key: 'id',
      label: 'Station ID',
      render: (item: Station) => item.id,
    },
    {
      key: 'name',
      label: 'Station name',
      render: (item: Station) => item.name,
    },
    {
      key: 'operatingCost',
      label: 'Operating cost',
      render: (item: Station) => '$' + (99 + item.devices.reduce((sum, d) => sum + d.operatingCost, 0)).toFixed(2),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: Station) => {
        switch (item.status) {
          case 'ready':
            return <StatusIndicator type="pending">Ready</StatusIndicator>;
          case 'inactive':
            return <StatusIndicator type="pending">Inactive</StatusIndicator>;
          case 'active':
            return <StatusIndicator type="success">Active</StatusIndicator>;
          case 'error':
            return <StatusIndicator type="error">Error</StatusIndicator>;
        }
      },
    },
  ];

  const createDeviceColumnDefinitions = (station: Station) => [
    {
      key: 'selection',
      label: (
        <Box margin={{ left: 'xxs' }}>
          <Checkbox
            checked={selectedDevices.length === station.devices.length}
            indeterminate={selectedDevices.length > 0 && selectedDevices.length < station.devices.length}
            onChange={() =>
              setSelectedDevices(prev => (prev.length < station.devices.length ? station.devices.map(d => d.id) : []))
            }
          />
        </Box>
      ),
      render: (row: Device) => (
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
      ),
    },
    {
      key: 'id',
      label: 'Device ID',
      render: (item: Device, index: number) => `D${index + 1}`,
    },
    {
      key: 'ownerId',
      label: 'Owner',
      render: (item: Device) => item.ownerId,
    },
    {
      key: 'primary',
      label: 'Primary',
      render: (item: Device) => (item.primary ? 'Yes' : 'No'),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: Device) => {
        switch (item.status) {
          case 'hibernating':
            return <StatusIndicator type="pending">Hibernating</StatusIndicator>;
          case 'connecting':
            return <StatusIndicator type="in-progress">Connecting</StatusIndicator>;
          case 'connected':
            return <StatusIndicator type="success">Connected</StatusIndicator>;
          case 'failed':
            return <StatusIndicator type="error">Failed</StatusIndicator>;
        }
      },
    },
    {
      key: 'operatingCost',
      label: 'Operating cost',
      render: (item: Device) => '$' + item.operatingCost.toFixed(2),
    },
    {
      key: 'lastUpdateDate',
      label: 'Last update date',
      render: (item: Device) => format(item.lastUpdateDate, 'yyyy-MM-dd hh:mm'),
    },
  ];

  const allDevices = allStations.flatMap(s => s.devices);

  return (
    <ContentLayout
      header={
        <Box padding="m">
          <Header
            variant="h1"
            counter={`(${allStations.length} / ${selectedStations.length}, ${allDevices.length} / ${selectedDevices.length})`}
          >
            Stations and devices
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
              totalItemsCount: allStations.length,
              totalColumnsCount: stationColumnDefinitions.length,
            })}
          >
            <thead>
              <tr {...getTableHeaderRowRoleProps({ tableRole })}>
                {stationColumnDefinitions.map((column, colIndex) => (
                  <th
                    key={column.key}
                    className={styles['custom-table-cell']}
                    {...getTableColHeaderRoleProps({ tableRole, colIndex })}
                    style={{ width: column.key === 'selection' ? '20px' : undefined }}
                  >
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'nowrap' }}>
                      {column.key === 'selection' || column.key === 'devices' ? (
                        column.label
                      ) : (
                        <>
                          <button
                            className={styles['custom-table-sorting-header']}
                            onClick={() => {
                              const key = column.sortingKey ?? column.key;
                              if (sortingKey !== key) {
                                setSortingKey(key);
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
              {sortedStations.map((row, rowIndex) => {
                const stationRow = (
                  <tr key={row.id} {...getTableRowRoleProps({ tableRole, rowIndex, firstIndex: 0 })}>
                    {stationColumnDefinitions.map((column, colIndex) => (
                      <td
                        key={column.key}
                        className={styles['custom-table-cell']}
                        {...getTableCellRoleProps({ tableRole, colIndex })}
                        style={{
                          background: tokens.colorBackgroundCellShaded,
                        }}
                      >
                        {column.render(row)}
                      </td>
                    ))}
                  </tr>
                );

                if (expandedRows[row.id]) {
                  const columnDefinitions = createDeviceColumnDefinitions(row);
                  const tableRole = 'table';
                  const devices = row.devices;

                  return (
                    <>
                      {stationRow}
                      <tr key={rowIndex + 'expanded'}>
                        <td
                          className={styles['custom-table-cell']}
                          {...getTableCellRoleProps({ tableRole, colIndex: 0 })}
                          style={{
                            background: tokens.colorBackgroundCellShaded,
                          }}
                          colSpan={stationColumnDefinitions.length}
                        >
                          <div
                            className={styles['custom-table']}
                            {...getTableWrapperRoleProps({ tableRole, isScrollable: false })}
                          >
                            <table
                              ref={tableRef}
                              className={styles['custom-table-table']}
                              {...getTableRoleProps({
                                tableRole,
                                totalItemsCount: devices.length,
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
                                      style={{ width: column.key === 'selection' ? '20px' : undefined }}
                                    >
                                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'nowrap' }}>
                                        {column.label}
                                      </div>
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {devices.map((row, rowIndex) => (
                                  <tr key={row.id} {...getTableRowRoleProps({ tableRole, rowIndex, firstIndex: 0 })}>
                                    {columnDefinitions.map((column, colIndex) => (
                                      <td
                                        key={column.key}
                                        className={styles['custom-table-cell']}
                                        {...getTableCellRoleProps({ tableRole, colIndex })}
                                      >
                                        {column.render(row, rowIndex)}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    </>
                  );
                }

                return stationRow;
              })}
            </tbody>
          </table>
        </div>
      </Box>
    </ContentLayout>
  );
}
