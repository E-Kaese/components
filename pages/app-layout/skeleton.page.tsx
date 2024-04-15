// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import Header from '~components/header';
import ScreenshotArea from '../utils/screenshot-area';
import { Containers } from './utils/content-blocks';
import { AppLayoutSkeleton } from '~components/app-layout/skeleton';
import { AppLayoutProps } from '~components/app-layout';
import { useAppLayout } from '~components/app-layout/utils/use-app-layout';
import appLayoutLabels from './utils/labels';

const AppLayoutMock = ({
  contentType = 'default',
  headerSelector = '#b #h',
  footerSelector = '#b #f',
  navigationWidth = 280,
  toolsWidth = 290,
  ...rest
}: AppLayoutProps) => {
  const [rootRef, props] = useAppLayout({
    contentType,
    headerSelector,
    footerSelector,
    navigationWidth,
    toolsWidth,
    ...rest,
  });
  return (
    <div ref={rootRef as React.RefObject<HTMLDivElement>}>
      <AppLayoutSkeleton {...props} />
    </div>
  );
};

export default function () {
  return (
    <ScreenshotArea gutters={false}>
      <AppLayoutMock
        ariaLabels={appLayoutLabels}
        content={
          <>
            <div style={{ marginBottom: '1rem' }}>
              <Header variant="h1" description="Basic demo">
                Demo page
              </Header>
            </div>
            <Containers />
          </>
        }
      />
    </ScreenshotArea>
  );
}
