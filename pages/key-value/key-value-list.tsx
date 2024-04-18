// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import KeyValue from '~components/key-value';
import Container from '~components/container';
import Header from '~components/header';
import { pairs1, pairs2, pairs3 } from './utils';
import { SpaceBetween } from '~components';

export default function KeyValueList() {
  return (
    <Container header={<Header variant="h2">KeyValue.List - using ColumnLayout and SpaceBetween</Header>}>
      <SpaceBetween size="xxl">
        <KeyValue.List pairs={pairs1} />
        <KeyValue.List pairs={pairs1.concat(pairs2)} />
        <KeyValue.List pairs={pairs1.concat(pairs2).concat(pairs3)} />
      </SpaceBetween>
    </Container>
  );
}
