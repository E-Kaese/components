// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import { AppLayout, SideNavigation } from '~components';

import { setFunnelMetrics } from '~components/internal/analytics';
import { MockedFunnelMetrics } from '../../mock-funnel';

setFunnelMetrics(MockedFunnelMetrics);

export default function EC2Example() {
  const hash = window.location.hash;
  const queryParams = hash.split('?')[1];
  const searchParams = new URLSearchParams(queryParams);
  const page = searchParams.get('page');

  const urlParts = hash.split('/');

  const iframeSrc = page
    ? `http://localhost:8080/#/${
        urlParts[1]
      }/funnel-analytics/console-examples/ec2/${page}?removeHeader=true&density=${searchParams.get('density')}`
    : '';

  return (
    <AppLayout
      navigation={
        <SideNavigation
          items={[
            {
              text: 'Instances',
              type: 'section',
              items: [
                {
                  href: '#/light/funnel-analytics/console-examples/ec2/console?page=launch-instance',
                  text: 'Launch instances',
                  type: 'link',
                },
              ],
            },
          ]}
        />
      }
      maxContentWidth={Number.MAX_SAFE_INTEGER}
      disableContentPaddings={true}
      content={<iframe src={iframeSrc} style={{ width: '100%', height: 'calc(100% - 4px)', borderStyle: 'none' }} />}
    />
  );
}
