// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import { useAppLayoutInternals } from '../visual-refresh/context';
import styles from './styles.css.js';

export default function Navigation() {
  const { navigation } = useAppLayoutInternals();

  if (!navigation) {
    return null;
  }
  
  return (
    <section className={styles.navigation}>
      <div className={styles.content}>
        {navigation}
      </div>
    </section>
  );
}
