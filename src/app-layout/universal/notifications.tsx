// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import { useAppLayoutInternals } from '../visual-refresh/context';
import styles from './styles.css.js';

export default function Notifications() {
  const { notifications, isNotificationsOpen } = useAppLayoutInternals();

  if (!notifications || !isNotificationsOpen) {
    return null;
  }

  return (
    <section className={styles.notifications}>
      <div className={styles.overlay}>{notifications}</div>
    </section>
  );
}
