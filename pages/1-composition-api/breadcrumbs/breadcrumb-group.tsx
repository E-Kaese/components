// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import { Box, Icon, Link } from '~components';
import Breadcrumbs from './index';

export default function BreadcrumbGroup({ items }: any) {
  return (
    <Breadcrumbs.List>
      {items.map((item: any, index: number) => {
        const isLastItem = index === items.length - 1;

        if (!isLastItem) {
          return (
            <Breadcrumbs.ListItem key={index}>
              <Link href={item.href}>{item.text}</Link>
              <Icon name="angle-right" variant="subtle" />
            </Breadcrumbs.ListItem>
          );
        } else {
          return (
            <Breadcrumbs.ListItem key={index}>
              <Box color="text-status-inactive" fontWeight="bold">
                {item.text}
              </Box>
            </Breadcrumbs.ListItem>
          );
        }
      })}
    </Breadcrumbs.List>
  );
}
