// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import { AppLayoutInternalsProvider } from './context';
import { AppLayoutInternalProps, AppLayoutProps } from '../interfaces';
import Layout from './layout';
import SplitPanel from './split-panel';

const AppLayoutWithRef = React.forwardRef(function AppLayout(
  props: AppLayoutInternalProps,
  ref: React.Ref<AppLayoutProps.Ref>
) {
  return (
    <AppLayoutInternalsProvider {...props} ref={ref}>
      <SplitPanel>
        <Layout />
      </SplitPanel>
    </AppLayoutInternalsProvider>
  );
});

export default AppLayoutWithRef;
