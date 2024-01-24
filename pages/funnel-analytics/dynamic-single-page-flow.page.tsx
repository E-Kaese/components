// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React, { useState } from 'react';

import Container from '~components/container';
import Header from '~components/header';
import { AppLayout, BreadcrumbGroup, Button, Form, SpaceBetween, Input } from '~components';

import { setFunnelMetrics } from '~components/internal/analytics';
import { MockedFunnelMetrics } from './mock-funnel';

setFunnelMetrics(MockedFunnelMetrics);

function DynamicContainer({ index }: { index: number }) {
  const [value, setValue] = useState('');
  return (
    <Container header={<Header>A container for substep {index}</Header>}>
      <Input value={value} onChange={event => setValue(event.detail.value)} />
    </Container>
  );
}

export default function DynamicSingleFlowPage() {
  const [containerCount, setContainerCount] = useState(2);

  return (
    <AppLayout
      contentType="form"
      breadcrumbs={
        <BreadcrumbGroup
          items={[
            { text: 'System', href: '#' },
            { text: 'Components', href: '#components' },
            {
              text: 'Create Resource',
              href: '#components/breadcrumb-group',
            },
          ]}
          ariaLabel="Breadcrumbs"
        />
      }
      navigationOpen={false}
      content={
        <Form header={<Header variant="h1">A form with dynamic substeps</Header>}>
          <SpaceBetween size="l">
            <SpaceBetween direction="horizontal" size="xs">
              <Button onClick={() => setContainerCount(c => c + 1)}>Increase substep count</Button>
              <Button onClick={() => setContainerCount(c => c - 1)} disabled={containerCount <= 0}>
                Decrease substep count
              </Button>
            </SpaceBetween>

            {Array(containerCount)
              .fill(0)
              .map((_, i) => (
                <DynamicContainer key={i} index={i + 1} />
              ))}
          </SpaceBetween>
        </Form>
      }
    />
  );
}
