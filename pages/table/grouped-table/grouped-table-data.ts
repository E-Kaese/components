// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { groupBy, orderBy, sumBy, uniq } from 'lodash';
import pseudoRandom from '../../utils/pseudo-random';
import { id as generateId } from '../generate-data';
import { Transaction, TransactionRow } from './grouped-table-common';
import {
  addMonths,
  addSeconds,
  addWeeks,
  format,
  max,
  min,
  startOfDay,
  startOfMonth,
  startOfQuarter,
  startOfYear,
} from 'date-fns';

export interface GroupDefinition {
  property: string;
  basis: { type: string; value: string };
  sorting: 'asc' | 'desc';
}

type TransactionDefinition = Omit<Transaction, 'id' | 'date' | 'amountEur' | 'amountEur' | 'amountUsd'> & {
  amount: () => number;
};

const allTransactions: Transaction[] = [];

let currentMoment = new Date('2000-01-01T12:00:00');
const reset = (date = new Date('2000-01-01T12:00:00')) => (currentMoment = date);

function addTransaction({ amount: getAmount, ...t }: TransactionDefinition) {
  let amountUsd = 0;
  let amountEur = 0;
  const amount = getAmount();
  switch (t.currency) {
    case 'EUR':
      amountUsd = amount * 1.1;
      amountEur = amount;
      break;
    case 'USD':
      amountUsd = amount;
      amountEur = amount * 0.9;
      break;
    default:
      throw new Error('Unsupported currency');
  }
  allTransactions.push({ id: generateId(), ...t, date: currentMoment, amountUsd, amountEur });
}
function transfer(from: string, to: string, currency: string, amount: () => number): TransactionDefinition {
  return { type: 'TRANSFER', origin: from, recipient: to, currency, amount, paymentMethod: 'Bank transfer' };
}
function withdraw(from: string, currency: string, amount: () => number): TransactionDefinition {
  return {
    type: 'WITHDRAWAL',
    origin: from,
    recipient: 'Cash',
    currency,
    amount,
    paymentMethod: 'Cash withdrawal',
  };
}

function repeat(transaction: TransactionDefinition, increment: (date: Date) => Date, until = new Date('2024-01-01')) {
  while (currentMoment < until && currentMoment < new Date('2024-01-01')) {
    addTransaction(transaction);
    currentMoment = increment(currentMoment);
  }
}

const monthly = (date: Date) => addMonths(date, 1);
const everyWeekOrSo = (date: Date) =>
  addSeconds(addWeeks(date, 1), Math.floor(pseudoRandom() * 3600 * 24 * 3 - 3600 * 24 * 1.5));

// John Doe Salary
reset();
repeat(
  transfer('Lovers GmbH', 'John Doe', 'EUR', () => 2500),
  monthly,
  new Date('2008-05-01')
);
repeat(
  transfer('Haters GmbH', 'John Doe', 'EUR', () => 3100),
  monthly,
  new Date('2012-01-01')
);
repeat(
  transfer('Lovers International', 'John Doe', 'USD', () => 4500),
  monthly
);

// Jane Doe Salary
reset();
repeat(
  transfer('Haters International', 'Jane Freeman', 'USD', () => 5000),
  monthly,
  new Date('2012-01-01')
);
repeat(
  transfer('Lowers International', 'Jane Doe', 'USD', () => 4500),
  monthly
);

// John -> Jane compensation
reset(new Date('2012-01-01T13:00:00'));
repeat(
  transfer('John Doe', 'Jane Doe', 'USD', () => 500),
  monthly
);

// John spending
reset();
repeat(
  withdraw('John Doe', 'EUR', () => pseudoRandom() * 100),
  everyWeekOrSo
);

// Jane spending
reset();
repeat(
  withdraw('Jane Freeman', 'EUR', () => pseudoRandom() * 90),
  everyWeekOrSo,
  new Date('2012-01-01')
);
repeat(
  withdraw('Jane Doe', 'EUR', () => pseudoRandom() * 120),
  everyWeekOrSo
);

export function getGroupedTransactions(groups: GroupDefinition[]): TransactionRow[] {
  const data = orderBy(allTransactions, 'date', 'desc');

  function makeGroups(transactions: Transaction[], groupIndex: number, parent: null | string): TransactionRow[] {
    const group = groups[groupIndex];
    if (!group) {
      return transactions.map(t => ({
        ...t,
        key: parent ? `${parent}-${t.id}` : t.id,
        group: t.id,
        groupKey: 'id',
        transactions: 1,
        children: [],
        parent,
      }));
    }
    const byProperty = groupBy(transactions, t => getGroupBy(t, group));
    const rows = orderBy(
      Object.entries(byProperty).map(([groupKey, groupTransactions]) => {
        const key = parent ? `${parent}-${groupKey}` : groupKey;
        return {
          key: key,
          group: groupKey,
          groupKey: `${group.property}_${group.basis.value}`,
          parent,
          transactions: groupTransactions.length,
          children: makeGroups(groupTransactions, groupIndex + 1, key),
          type: { uniqueTypes: uniq(groupTransactions.map(t => t.type)).length },
          date: [min(groupTransactions.map(t => t.date)), max(groupTransactions.map(t => t.date))],
          origin: { uniqueOrigins: uniq(groupTransactions.map(t => t.origin)).length },
          recipient: { uniqueRecipients: uniq(groupTransactions.map(t => t.recipient)).length },
          currency: { uniqueCurrencies: uniq(groupTransactions.map(t => t.currency)).length },
          amountEur: {
            totalAmount: sumBy(groupTransactions, 'amountEur'),
            averageAmount: averageBy(groupTransactions, 'amountEur'),
          },
          amountUsd: {
            totalAmount: sumBy(groupTransactions, 'amountUsd'),
            averageAmount: averageBy(groupTransactions, 'amountUsd'),
          },
          paymentMethod: { uniquePaymentMethods: uniq(groupTransactions.map(t => t.paymentMethod)).length },
          __property: (groupTransactions[0] as any)[group.property],
        } as TransactionRow & { __property: any };
      }),
      '__property',
      group.sorting
    );
    return rows;
  }

  const roots = makeGroups(data, 0, null);

  const allRows: TransactionRow[] = [];
  function traverse(rows: TransactionRow[]) {
    for (const row of rows) {
      allRows.push(row);
      traverse(row.children);
    }
  }
  traverse(roots);

  return allRows;
}

function averageBy(transactions: Transaction[], property: 'amountEur' | 'amountUsd'): number {
  if (transactions.length === 0) {
    return 0;
  }
  const total = sumBy(transactions, property);
  return total / transactions.length;
}

function getGroupBy(transaction: Transaction, group: GroupDefinition): string {
  if (group.basis.type === 'unique') {
    return (transaction as any)[group.property];
  }
  if (group.basis.type === 'number') {
    const transactionValue = (transaction as any)[group.property];
    const basisValue = parseInt(group.basis.value);
    return (Math.ceil(transactionValue / basisValue) * basisValue).toFixed(2);
  }
  if (group.basis.type === 'date') {
    const transactionValue = (transaction as any)[group.property];
    switch (group.basis.value) {
      case 'year':
        return format(startOfYear(transactionValue), 'yyyy');
      case 'quarter':
        return format(startOfQuarter(transactionValue), 'QQQ yyyy');
      case 'month':
        return format(startOfMonth(transactionValue), 'MMMM yyyy');
      case 'day':
        return format(startOfDay(transactionValue), 'yyyy-MM-dd');
    }
  }
  throw new Error('Unsupported group basis');
}