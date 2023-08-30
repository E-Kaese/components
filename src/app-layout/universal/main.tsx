// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import clsx from 'clsx';
import customCssProps from '../../internal/generated/custom-css-properties';
import { useAppLayoutInternals } from '../visual-refresh/context';
import { useVisualRefresh } from '../../internal/hooks/use-visual-mode';
import styles from './styles.css.js';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Main({ children }: LayoutProps) {
  const { headerHeight } = useAppLayoutInternals();
  const isVisualRefresh = useVisualRefresh();

  return (
    <main
      className={clsx(styles.main, {
        [styles['is-visual-refresh']]: isVisualRefresh,
      })}
      style={{
        [customCssProps.headerHeight]: `${headerHeight}px`,
      }}
    >
      {children}
    </main>
  );
}
