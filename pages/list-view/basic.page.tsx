// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';

import ListView from '~components/internal/components/list-view';
import ScreenshotArea from '../utils/screenshot-area';
import styles from './styles.scss';

export default function () {
  const renderListItem = () => (
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
      <ListView role="orderedList" renderItem={() => renderListItem()} items={[{}, {}, {}]} />
    </ScreenshotArea>
  );
}
