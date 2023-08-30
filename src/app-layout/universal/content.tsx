// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import { useAppLayoutInternals } from '../visual-refresh/context';
import styles from './styles.css.js';

export default function Content() {
  const { content } = useAppLayoutInternals();

  return <section className={styles.content}>{content}</section>;
}
