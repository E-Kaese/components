// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import clsx from 'clsx';
import { InternalButton } from '../../button/internal';
import { useAppLayoutInternals } from '../visual-refresh/context';
import styles from './styles.css.js';

export default function Header() {
  const { breadcrumbs } = useAppLayoutInternals();

  return (
    <header className={clsx(styles.header, 'awsui-context-content-header')}>
      <section className={styles['actions-inline-start']}>
        <InternalButton className={styles.action} formAction="none" iconName="menu" variant="icon" />
      </section>

      {breadcrumbs && <section className={styles.breadcrumbs}>{breadcrumbs}</section>}

      <section className={styles['actions-inline-end']}>
        <InternalButton className={styles.action} formAction="none" iconName="status-info" variant="icon" />
      </section>
    </header>
  );
}
