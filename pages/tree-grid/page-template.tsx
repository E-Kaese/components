// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import Header from '~components/header';
import { Box } from '~components';

export function PageTemplate({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ height: '90vh' }}>
      <div style={{ height: '100%', padding: '16px' }}>
        <Box margin={{ bottom: 'm' }}>
          <Header variant="h1">{title}</Header>
        </Box>

        {children}
      </div>
    </div>
  );
}
