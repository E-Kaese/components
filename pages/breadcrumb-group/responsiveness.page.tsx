// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React, { useState } from 'react';

import { Button, FormField, SpaceBetween, Textarea } from '~components';
import BreadcrumbGroup from '~components/breadcrumb-group';
import Input from '~components/input';

export default function ResponsiveBreadcrumbsPage() {
  const [itemsLists, setItemsLists] = useState([
    ['A', 'AB', 'ABC', 'ABCD', 'ABCDEF', 'ABCDEFGHIJsjbdkasbdhjabsjdhasjhdabsjd'],
    ['EC2', 'Instances', 'i-03abdc1839101a53f'],
    [
      'Amazon S3',
      'Buckets',
      '164981592106-us-east-1-athena-results-bucket-n8qxkwo99y',
      '5d04ca725b8547220d019af4d3g0ae11',
    ],
  ]);
  const [minBreadcrumbWidth, setMinBreadcrumbWidth] = useState<string | undefined>('120');
  const [newBreadcrumb, setNewBreadcrumb] = useState<string>('["A", "AB", "ABCDEFGHIJsjbdkasbdhjabsjdhasjhdabsjd"]');
  return (
    <article>
      <SpaceBetween size="xxl">
        <h1>Responsive breadcrumbs</h1>
        <FormField label="Enter minimum width">
          <Input
            type="number"
            value={minBreadcrumbWidth || ''}
            onChange={evt => {
              setMinBreadcrumbWidth(evt.detail.value || undefined);
            }}
          />
        </FormField>
        <FormField
          label="Add breadcrumb"
          secondaryControl={
            <Button onClick={() => setItemsLists([...itemsLists, JSON.parse(newBreadcrumb)])}>Add</Button>
          }
        >
          <Textarea
            value={newBreadcrumb}
            onChange={evt => {
              setNewBreadcrumb(evt.detail.value);
            }}
          />
        </FormField>
        <hr />
        {itemsLists.map((items, key) => (
          <BreadcrumbGroup
            key={key}
            ariaLabel="Navigation long text"
            expandAriaLabel="Show path for long text"
            items={items.map(text => ({ text, href: `#` }))}
            minBreadcrumbWidth={minBreadcrumbWidth ? parseInt(minBreadcrumbWidth) : undefined}
          />
        ))}
      </SpaceBetween>
    </article>
  );
}
