// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import { AppLayoutInternalsProvider } from '../visual-refresh/context';
import { AppLayoutProps } from '../interfaces';
import Background from './background';
import Content from './content';
import Main from './main';
import Navigation from './navigation';
import Toolbar from './toolbar';
import Tools from './tools';
import Notifications from './notifications';

const AppLayoutWithRef = React.forwardRef(function AppLayout(
  props: AppLayoutProps,
  ref: React.Ref<AppLayoutProps.Ref>
) {
  const hideToolbar = { ...(props as any) }.hideToolbar;

  return (
    <AppLayoutInternalsProvider {...props} ref={ref}>
      <Main>
        <Background />
        {!hideToolbar && <Toolbar />}
        <Navigation />
        <Notifications />
        <Content />
        <Tools />
      </Main>
    </AppLayoutInternalsProvider>
  );
});

export default AppLayoutWithRef;
