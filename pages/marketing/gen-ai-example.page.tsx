// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import Breadcrumbs from './components/breadcrumbs/breadcrumbs';
import Button from './components/button/button';
import Box from '~components/box';
import styles from './gen-ai-example.scss';

export default function DemoPage() {
  return (
    <div className={styles.grid}>
      <div className={styles['col-8']}>
        <Breadcrumbs
          ariaLabel="Navigation"
          expandAriaLabel="Show path"
          items={['Generative AI', 'Technology'].map((text, i) => ({ text, href: `#item-${i}` }))}
        />
      </div>
      <div className={styles['col-8']}>
        <Box variant="h1" fontSize="display-l" fontWeight="bold">
          How to build and scale generative AI applications on AWS
        </Box>
      </div>
      <div className={styles['col-8']}>
        <Button variant="primary">Sign up to get updates</Button>
      </div>
    </div>
  );
}
