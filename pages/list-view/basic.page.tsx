// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';

import ListView from '~components/internal/components/list-view';
import ScreenshotArea from '../utils/screenshot-area';
import styles from './styles.scss';

export default function () {
  const listItem = () => (
    <div className={styles.item}>
      <div>
        <div className={styles.placeholder}></div>
      </div>
      <div className={styles.meta}>Info here</div>
    </div>
  );

  return (
    <ScreenshotArea>
      <h1>Line charts</h1>
      <ListView items={[listItem(), listItem(), listItem(), listItem()]} />
    </ScreenshotArea>
  );
}
