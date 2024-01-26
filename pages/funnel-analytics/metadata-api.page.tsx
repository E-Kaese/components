// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import { Container, Flashbar, Form, FormField, SpaceBetween } from '~components';

import { setFunnelMetrics } from '~components/internal/analytics';
import { MockedFunnelMetrics } from './mock-funnel';

setFunnelMetrics(MockedFunnelMetrics);

export default function StaticSinglePageCreatePage() {
  return (
    <>
      <Flashbar
        items={[
          { metadata: { instanceId: 'flashitem-1', contextId: 'api' }, content: 'API Error', type: 'error' },
          { content: 'All good', type: 'success' },
        ]}
      />
      <Form
        metadata={{
          instanceId: 'static-single-page-flow',
          flowType: 'create',
          flowErrorContextId: 'errors.validation',
        }}
        errorText="Hello world"
      >
        <SpaceBetween size="m">
          <Container metadata={{ instanceId: 'container-1' }}>
            <FormField
              metadata={{ instanceId: 'container-1-field-1', fieldErrorContextId: 'api' }}
              errorText="error-1"
            />
          </Container>
          <Container metadata={{ instanceId: 'container-2' }}>
            <FormField
              metadata={{ instanceId: 'container-1-field-2', fieldErrorContextId: 'validation' }}
              errorText="error-2"
            />
          </Container>
        </SpaceBetween>
      </Form>
    </>
  );
}
