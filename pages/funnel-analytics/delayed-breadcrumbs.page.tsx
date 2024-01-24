// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React, { useEffect, useState } from 'react';
import { BreadcrumbGroup, BreadcrumbGroupProps, Container, Form } from '~components';

import { setFunnelMetrics } from '~components/internal/analytics';
import { MockedFunnelMetrics } from './mock-funnel';

setFunnelMetrics(MockedFunnelMetrics);

export default function DelayedBreadcrumbsPage() {
  const [items, setItems] = useState<BreadcrumbGroupProps['items']>([]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setItems([
        { text: 'System', href: '#' },
        { text: 'Components', href: '#components' },
        {
          text: 'Create Resource',
          href: '#components/breadcrumb-group',
        },
      ]);
    }, 150);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return (
    <>
      {items && <BreadcrumbGroup items={items} ariaLabel="Breadcrumbs" />}
      <Form>
        <Container />
      </Form>
    </>
  );
}
