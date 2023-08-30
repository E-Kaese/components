// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import { useAppLayoutInternals } from '../visual-refresh/context';
import styles from './styles.css.js';

export default function Tools() {
  const { tools } = useAppLayoutInternals();

  if (!tools) {
    return null;
  }
  
  return (
    <section className={styles.tools}>
      <div className={styles.content}>
        {tools}
      </div>
    </section>
  );
}
