// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import { AppLayoutInternalsProvider } from '../visual-refresh/context';
import { AppLayoutProps } from '../interfaces';
import Content from './content';
import Header from './header';
import Main from './main';

const AppLayoutWithRef = React.forwardRef(function AppLayout(
  props: AppLayoutProps,
  ref: React.Ref<AppLayoutProps.Ref>
) {
  return (
    <AppLayoutInternalsProvider {...props} ref={ref}>
      <Main>
        <Header />
        <Content />
      </Main>
    </AppLayoutInternalsProvider>
  );
});

export default AppLayoutWithRef;
