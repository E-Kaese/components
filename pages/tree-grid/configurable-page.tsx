// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import Header from '~components/header';
import { Box } from '~components';
import { SettingsEditor } from './settings-editor';

export function ConfigurablePage<S extends object>({
  title,
  children,
  settings,
  onChangeSettings,
}: {
  title: string;
  children: React.ReactNode;
  settings: S;
  onChangeSettings(settings: S): void;
}) {
  return (
    <Box padding="l">
      <Box margin={{ bottom: 'm' }}>
        <Header variant="h1">{title}</Header>
      </Box>

      <Box>
        <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '16px' }}>
          <Box>
            <SettingsEditor settings={settings} onChange={onChangeSettings} />
          </Box>

          <div style={{ overflowX: 'auto' }}>{children}</div>
        </div>
      </Box>
    </Box>
  );
}
