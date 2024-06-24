// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import { AppLayoutInternalsProvider } from './context';
import { AppLayoutProps, AppLayoutPropsWithDefaults } from '../interfaces';
import Background from './background';
import Breadcrumbs from './breadcrumbs';
import Drawers from './drawers';
import Header from './header';
import Layout from './layout';
import Main from './main';
import MobileToolbar from './mobile-toolbar';
import Navigation from './navigation';
import Notifications from './notifications';
import SplitPanel from './split-panel';
import Tools from './tools';
import { useAppLayout } from '../utils/use-app-layout';

const AppLayoutWithRef = React.forwardRef(function AppLayout(
  props: AppLayoutPropsWithDefaults,
  ref: React.Ref<AppLayoutProps.Ref>
) {
  const { props: resolvedProps, rootRef } = useAppLayout(props);
  return (
    <AppLayoutInternalsProvider {...resolvedProps} ref={ref}>
      <SplitPanel>
        <Layout ref={rootRef}>
          <Background />

          <Navigation />

          <MobileToolbar />

          <Notifications />

          <Breadcrumbs />

          <Header />

          <Main />

          <SplitPanel.Bottom />

          <Tools>
            <SplitPanel.Side />
          </Tools>

          <Drawers />
        </Layout>
      </SplitPanel>
    </AppLayoutInternalsProvider>
  );
});

export default AppLayoutWithRef;
