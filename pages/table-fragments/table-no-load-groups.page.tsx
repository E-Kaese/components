// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  ContentLayout,
  Header,
  Icon,
  StatusIndicator,
  Container,
  IconProps,
  Tabs,
  AppLayout,
} from '~components';
import styles from './styles.scss';
import {
  getTableCellRoleProps,
  getTableColHeaderRoleProps,
  getTableHeaderRowRoleProps,
  getTableRoleProps,
  getTableRowRoleProps,
  useGridNavigation,
} from '~components/table/table-role';
import { Dictionary, groupBy, mapValues, orderBy, range, sortBy } from 'lodash';
import pseudoRandom from '../utils/pseudo-random';
import { format, startOfMonth } from 'date-fns';
import * as tokens from '~design-tokens';

const K = 1000;
const M = 1000 ** 2;

function formatAmount(size: number): string {
  if (size < M) {
    return `${(size / K).toFixed(2)}k`;
  }
  return `${(size / M).toFixed(2)}M`;
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

interface Transaction {
  id: string;
  external: boolean;
  status: 'pending' | 'processing' | 'completed' | 'declined';
  accountId: string;
  amount: number | undefined;
  date: Date;
}

interface TransactionRow {
  parentRowId: null | string;
  rowId: string;
  id: string | number;
  external: boolean | number;
  status: Transaction['status'] | { pending: number; processing: number; completed: number; declined: number };
  accountId: string | number;
  amount: number | { average: number; total: number | undefined } | undefined;
  date: string;
  level: number;
  group: string;
  count: number;
}

const statuses = [
  ...range(6).map(() => 'pending'),
  ...range(3).map(() => 'processing'),
  ...range(24).map(() => 'completed'),
  ...range(1).map(() => 'declined'),
] as ('pending' | 'processing' | 'completed' | 'declined')[];

const accounts = [
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
  'Mr Cloud Jr',
  'Mrs Scape Jr',
  'Dr Foundation Jr',
  'Prof Color Jr',
  'Sir Layout Jr',
  'Herr Muster Jr',
  'Frau Komponente Jr',
  'Lord Motion Jr',
  'Chancellor Design Jr',
];

const transactions: readonly Transaction[] = range(0, 1000).map(() => ({
  id: randomId(),
  external: pseudoRandom() > 0.5,
  status: statuses[Math.floor(pseudoRandom() * statuses.length)],
  accountId: accounts[Math.floor(pseudoRandom() * accounts.length)],
  amount: pseudoRandom() * 1000,
  date: randomDate(),
}));

interface SelectionTreeNode {
  id: string;
  total: number;
  selected: number;
  checked: boolean;
  children: readonly SelectionTreeNode[];
}

function createSelectionTree(rows: readonly TransactionRow[], checkedRows: string[]): SelectionTreeNode {
  function createTreeNode(id: string, count: number, checked: boolean, parentSelected = false): SelectionTreeNode {
    const thisSelected = (!parentSelected && checked) || (parentSelected && !checked);
    const children = rows
      .filter(r => (r.parentRowId ?? 'ALL') === id)
      .map(r => createTreeNode(r.rowId, r.count, checkedRows.includes(r.rowId), thisSelected));
    const totalChildren = children.length === 0 ? count : children.reduce((acc, c) => acc + c.total, 0);
    const selectedChildren =
      children.length === 0 ? (thisSelected ? count : 0) : children.reduce((acc, c) => acc + c.selected, 0);
    return { id, total: totalChildren, selected: selectedChildren, checked, children };
  }
  return createTreeNode('ALL', 0, checkedRows.includes('ALL'));
}

function toggleTreeSelection(root: SelectionTreeNode, id: string): string[] {
  const checkedIds: string[] = [];

  function traverse(node: SelectionTreeNode) {
    if (node.id === id && node.checked) {
      // Toggle this node off
      // Ignore children of this node
    } else if (node.id === id && !node.checked) {
      checkedIds.push(node.id);
      // Ignore children of this node
    } else if (node.checked) {
      checkedIds.push(node.id);
      node.children.forEach(traverse);
    } else {
      node.children.forEach(traverse);
    }
  }

  traverse(root);

  return checkedIds;
}

function createRowsSelection(
  rows: readonly TransactionRow[],
  checkedRows: string[]
): Dictionary<'off' | 'on' | 'partial'> {
  const root = createSelectionTree(rows, checkedRows);

  const dict: Dictionary<'off' | 'on' | 'partial'> = {};

  function traverse(node: SelectionTreeNode) {
    if (node.selected > 0 && node.selected >= node.total) {
      dict[node.id] = 'on';
    } else if (node.selected > 0) {
      dict[node.id] = 'partial';
    } else {
      dict[node.id] = 'off';
    }
    node.children.forEach(traverse);
  }

  traverse(root);

  return dict;
}

function useTreeSelection(rows: readonly TransactionRow[]) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  useEffect(() => {
    const ids = new Set(['ALL', ...rows.map(r => r.rowId)]);
    const filtered = selectedItems.filter(id => ids.has(id));
    if (filtered.length < selectedItems.length) {
      setSelectedItems(filtered);
    } else {
      console.log('Selected: ', selectedItems.map(id => `"${id}"`).join(', '));
    }
  }, [rows, selectedItems]);

  const selected = useMemo(() => createSelectionTree(rows, selectedItems).selected, [rows, selectedItems]);

  const selection = useMemo(() => createRowsSelection(rows, selectedItems), [rows, selectedItems]);

  const toggleAll = () => setSelectedItems(prev => toggleTreeSelection(createSelectionTree(rows, prev), 'ALL'));

  const toggleRow = (id: string) => setSelectedItems(prev => toggleTreeSelection(createSelectionTree(rows, prev), id));

  return { selected, selection, toggleAll, toggleRow };
}
function ExpandableTable({
  collapsedIcon,
  expandedIcon,
  shadingLevel,
  tableRef,
  tableRole,
  getColumnDefinitions,
  sortingKey,
  setSortingDirection,
  sortingDirection,
  setSortingKey,
  transactionRows,
}: any) {
  return (
    <table
      ref={tableRef}
      className={styles['custom-table-table']}
      {...getTableRoleProps({
        tableRole,
        totalItemsCount: transactions.length,
        totalColumnsCount: getColumnDefinitions(collapsedIcon, expandedIcon).length,
      })}
    >
      <thead>
        <tr {...getTableHeaderRowRoleProps({ tableRole })}>
          {getColumnDefinitions(collapsedIcon, expandedIcon).map((column: any, colIndex: number) => (
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
                          setSortingDirection((prev: any) => (prev === 1 ? -1 : 1));
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      {column.label}
                    </button>
                    {sortingKey === column.key && sortingDirection === -1 && <Icon name="caret-down-filled" />}
                    {sortingKey === column.key && sortingDirection === 1 && <Icon name="caret-up-filled" />}
                  </>
                )}
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {transactionRows.map((row: any, rowIndex: number) => (
          <tr key={row.rowId} {...getTableRowRoleProps({ tableRole, rowIndex, firstIndex: 0 })}>
            {getColumnDefinitions(collapsedIcon, expandedIcon).map((column: any, colIndex: number) => (
              <td
                key={column.key}
                className={styles['custom-table-cell']}
                {...getTableCellRoleProps({ tableRole, colIndex })}
                style={{
                  paddingLeft: column.key === 'group' ? `${16 + (row.level - 1) * 24}px` : undefined,
                  background: row.level <= shadingLevel ? undefined : tokens.colorBackgroundCellShaded,
                }}
              >
                {column.render(row)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function Page() {
  const [sortingKey, setSortingKey] = useState<null | string>(null);
  const [sortingDirection, setSortingDirection] = useState<1 | -1>(1);
  const [expandedRows, setExpandedRows] = useState<Dictionary<number>>({ ALL: 10 });

  const tableRole = 'grid';
  const tableRef = useRef<HTMLTableElement>(null);

  useGridNavigation({ active: true, pageSize: 10, getTable: () => tableRef.current });

  const sortedItems = useMemo(() => {
    if (!sortingKey) {
      return orderBy(transactions, ['date'], ['desc']);
    }
    if (sortingKey === 'date') {
      return orderBy(transactions, [sortingKey], [sortingDirection === -1 ? 'desc' : 'asc']);
    }
    return orderBy(
      transactions,
      [it => startOfMonth(it.date), sortingKey],
      ['desc', sortingDirection === -1 ? 'desc' : 'asc']
    );
  }, [sortingKey, sortingDirection]);

  const transactionRows = useMemo(() => {
    const transactionRows: TransactionRow[] = [];
    const transactionsByMonth: Dictionary<Transaction[]> = groupBy(sortedItems, t => format(t.date, 'yyyy-MM'));

    function aggregateStatus(transactions: Transaction[]) {
      return mapValues(groupBy(transactions, 'status'), ts => ts.length) as any;
    }

    function aggregateAmount(transactions: Transaction[]) {
      const total = transactions.reduce((acc, t) => (t.amount ? acc + t.amount : acc), 0);
      return { average: total / transactions.length, total };
    }

    function aggregateDate(transactions: Transaction[], formatStr = 'MMM do') {
      const sorted = sortBy([...transactions], 'date');
      return `${format(sorted[0].date, formatStr)} - ${format(sorted[sorted.length - 1].date, formatStr)}`;
    }

    const transactionEntries = Object.entries(transactionsByMonth);
    for (let t = 0; t < Math.min(transactionEntries.length, expandedRows.ALL); t++) {
      const [month, monthTransactions] = transactionEntries[t];

      transactionRows.push({
        parentRowId: null,
        rowId: month,
        id: monthTransactions.length,
        external: monthTransactions.filter(t => t.external).length,
        status: aggregateStatus(monthTransactions),
        accountId: new Set(monthTransactions.map(t => t.accountId)).size,
        amount: aggregateAmount(monthTransactions),
        date: format(new Date(month), 'MMMM yyyy'),
        level: 1,
        group: format(new Date(month), 'MMMM yyyy'),
        count: monthTransactions.length,
      });

      if (!expandedRows[month]) {
        continue;
      }

      const transactionsByAmount = groupBy(monthTransactions, 'accountId');
      const transactionsByAmountEntries = Object.entries(transactionsByAmount);

      for (let i = 0; i < Math.min(transactionsByAmountEntries.length, expandedRows[month]); i++) {
        const [accountId, accountTransactions] = transactionsByAmountEntries[i];

        transactionRows.push({
          parentRowId: month,
          rowId: `${month}-${accountId}`,
          id: accountTransactions.length,
          external: accountTransactions.filter(t => t.external).length,
          status: aggregateStatus(accountTransactions),
          accountId: accountId,
          amount: aggregateAmount(accountTransactions),
          date: aggregateDate(accountTransactions),
          level: 2,
          group: accountId,
          count: accountTransactions.length,
        });

        const accountKey = `${month}-${accountId}`;
        if (!expandedRows[accountKey]) {
          continue;
        }

        for (let j = 0; j < Math.min(accountTransactions.length, expandedRows[accountKey]); j++) {
          const transaction = accountTransactions[j];

          transactionRows.push({
            parentRowId: accountKey,
            rowId: transaction.id,
            id: transaction.id,
            external: transaction.external,
            status: transaction.status,
            accountId: transaction.accountId,
            amount: transaction.amount,
            date: format(transaction.date, 'yyyy-MM-dd hh:mm:ss'),
            level: 3,
            group: transaction.id,
            count: 1,
          });
        }
        if (expandedRows[accountKey] < accountTransactions.length) {
          const remTransactions = accountTransactions.slice(expandedRows[accountKey]);

          transactionRows.push({
            parentRowId: accountKey,
            rowId: `${accountKey}-loader`,
            id: remTransactions.length,
            external: remTransactions.filter(t => t.external).length,
            status: aggregateStatus(remTransactions),
            accountId: new Set(remTransactions.map(t => t.accountId)).size,
            amount: aggregateAmount(remTransactions),
            date: aggregateDate(remTransactions),
            level: 3,
            group: 'Load more account transactions',
            count: remTransactions.length,
          });
        }
      }
      if (expandedRows[month] < transactionsByAmountEntries.length) {
        const remTransactions = transactionsByAmountEntries
          .map(([, v]) => v)
          .slice(expandedRows[month])
          .flatMap(e => e);

        transactionRows.push({
          parentRowId: month,
          rowId: `${month}-loader`,
          id: remTransactions.length,
          external: remTransactions.filter(t => t.external).length,
          status: aggregateStatus(remTransactions),
          accountId: new Set(remTransactions.map(t => t.accountId)).size,
          amount: undefined,
          date: '',
          level: 2,
          group: `Load ${
            transactionsByAmountEntries.length - expandedRows[month] < 10
              ? transactionsByAmountEntries.length - expandedRows[month]
              : 10
          } / ${transactionsByAmountEntries.length - expandedRows[month]} more rows`,
          count: remTransactions.length,
        });
      }
    }
    if (expandedRows.ALL < transactionEntries.length) {
      const totalEntries = Object.entries(groupBy(sortedItems, t => format(t.date, 'yyyy-MM'))).length;
      const expandedEntries = totalEntries - expandedRows.ALL;

      const remTransactions = transactionEntries
        .map(([, v]) => v)
        .slice(expandedRows.ALL)
        .flatMap(e => e);

      transactionRows.push({
        parentRowId: null,
        rowId: 'all-loader',
        id: remTransactions.length,
        external: remTransactions.filter(t => t.external).length,
        status: aggregateStatus(remTransactions),
        accountId: new Set(remTransactions.map(t => t.accountId)).size,
        amount: undefined,
        date: '',
        level: 1,
        group: `Load ${expandedEntries < 10 ? expandedEntries : 10} / ${expandedEntries} more rows`,
        count: remTransactions.length,
      });
    }

    return transactionRows;
  }, [sortedItems, expandedRows]);

  const { selected, selection, toggleAll, toggleRow } = useTreeSelection(transactionRows);

  const getColumnDefinitions = (collapsedIcon: IconProps.Name, expandedIcon: IconProps.Name) => {
    return [
      {
        key: 'selection',
        label: (
          <Box margin={{ left: 'xxs' }}>
            <Checkbox
              checked={selection.ALL === 'on'}
              indeterminate={selection.ALL === 'partial'}
              onChange={toggleAll}
            />
          </Box>
        ),
        render: (row: TransactionRow) => (
          <Box margin={{ left: 'xxs' }}>
            <Checkbox
              checked={selection[row.rowId] === 'on'}
              indeterminate={selection[row.rowId] === 'partial'}
              onChange={() => toggleRow(row.rowId)}
            />
          </Box>
        ),
      },
      {
        key: 'group',
        label: (
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="inline-icon" iconName={collapsedIcon} disabled={true} />
            <span>Month / Account / Transaction ID</span>
          </div>
        ),
        render: (item: TransactionRow) => {
          if (item.rowId.includes('loader')) {
            const parentId = item.parentRowId ?? 'ALL';
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
                iconName={expandedRows[item.rowId] ? expandedIcon : collapsedIcon}
                onClick={() =>
                  setExpandedRows(prev => {
                    const next = { ...prev, [item.rowId]: prev[item.rowId] ? 0 : 10 };
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
        key: 'accountId',
        label: 'Account',
        render: (item: TransactionRow) => (typeof item.accountId === 'string' ? item.accountId : ``),
      },
      {
        key: 'id',
        label: 'Transaction ID',
        render: (item: TransactionRow) => (typeof item.id === 'string' ? item.id : ``),
      },
      {
        key: 'external',
        label: 'External',
        render: (item: TransactionRow) => (typeof item.external === 'boolean' ? (item.external ? 'Yes' : 'No') : ``),
      },
      {
        key: 'status',
        label: 'Status',
        render: (item: TransactionRow) => {
          switch (item.status) {
            case 'pending':
              return <StatusIndicator type="pending">Pending</StatusIndicator>;
            case 'processing':
              return <StatusIndicator type="in-progress">Processing</StatusIndicator>;
            case 'completed':
              return <StatusIndicator type="success">Completed</StatusIndicator>;
            case 'declined':
              return <StatusIndicator type="error">Declined</StatusIndicator>;
            default:
              return '';
          }
        },
      },
      {
        key: 'amount',
        label: 'Amount (total / avg)',
        render: (item: TransactionRow) =>
          typeof item.amount === 'number'
            ? '$' + item.amount.toFixed(2)
            : item.amount?.total
            ? `$${formatAmount(item.amount?.total || 0)} / $${item.amount?.average.toFixed(0)}`
            : '',
      },
      {
        key: 'date',
        label: 'Transaction date',
        render: (item: TransactionRow) => item.date,
      },
    ];
  };

  const sharedProps = {
    tableRef,
    tableRole,
    getColumnDefinitions,
    sortingKey,
    setSortingDirection,
    sortingDirection,
    setSortingKey,
    transactionRows,
  };

  return (
    <AppLayout
      maxContentWidth={Number.MAX_VALUE}
      navigationHide={true}
      toolsHide={true}
      content={
        <ContentLayout
          header={
            <Box padding="m">
              <Header
                variant="h1"
                counter={selected ? `(${selected} / ${transactions.length})` : `(${transactions.length})`}
              >
                Transactions
              </Header>
            </Box>
          }
        >
          <Container>
            <Tabs
              tabs={[
                {
                  label: 'Tree view icons',
                  id: 'first',
                  content: (
                    <ExpandableTable
                      {...sharedProps}
                      header="Tree view icons"
                      collapsedIcon="treeview-expand"
                      expandedIcon="treeview-collapse"
                      shadingLevel={2}
                    />
                  ),
                },
                {
                  label: 'Angle icons',
                  id: 'second',
                  content: (
                    <ExpandableTable
                      {...sharedProps}
                      header="Caret icons"
                      collapsedIcon="angle-right"
                      expandedIcon="angle-down"
                      shadingLevel={1}
                    />
                  ),
                },
                {
                  label: 'Caret icons',
                  id: 'third',
                  content: (
                    <ExpandableTable
                      {...sharedProps}
                      header="Caret icons"
                      collapsedIcon="caret-right-filled"
                      expandedIcon="caret-down-filled"
                      shadingLevel={4}
                    />
                  ),
                },
              ]}
            />
          </Container>
        </ContentLayout>
      }
    />
  );
}
