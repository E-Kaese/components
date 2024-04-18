// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import KeyValue from '~components/key-value';
import Container from '~components/container';
import Header from '~components/header';
import { pairs1, pairs2, pairs3 } from './utils';
import { Box, ColumnLayout, SpaceBetween } from '~components';

export default function KeyValueGroups() {
  return (
    <Container header={<Header variant="h2">KeyValue.Groups</Header>}>
      <SpaceBetween size="xxl">
        <ColumnLayout columns={3} variant="text-grid">
          <KeyValue.Group title="Column title 1" pairs={pairs1} />
          <KeyValue.Group title="Column title 2" pairs={pairs2} />
          <KeyValue.Group title="Column title 3" pairs={pairs3} />
        </ColumnLayout>
        <ColumnLayout columns={3} variant="text-grid">
          <SpaceBetween size="m">
            <Box variant="h4" padding="n">
              Custom h4 column title 1
            </Box>
            <KeyValue.Group pairs={pairs1} />
          </SpaceBetween>
          <SpaceBetween size="m">
            <Box variant="h4" padding="n">
              Custom h4 column title 2
            </Box>
            <KeyValue.Group pairs={pairs2} />
          </SpaceBetween>
          <SpaceBetween size="m">
            <Box variant="h4" padding="n">
              Custom h4 column title 3
            </Box>
            <KeyValue.Group pairs={pairs3} />
          </SpaceBetween>
        </ColumnLayout>
      </SpaceBetween>
    </Container>
  );
}
