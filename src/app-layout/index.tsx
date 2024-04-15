// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import useBaseComponent from '../internal/hooks/use-base-component';
import { getBaseProps } from '../internal/base-component';
import { applyDisplayName } from '../internal/utils/apply-display-name';
import { AppLayoutProps } from './interfaces';
import { AppLayoutInternal } from './internal';
import { isDevelopment } from '../internal/is-development';
import { warnOnce } from '@cloudscape-design/component-toolkit/internal';
import { useMergeRefs } from '../internal/hooks/use-merge-refs';
import { useAppLayout } from './utils/use-app-layout';

export { AppLayoutProps };

const AppLayout = React.forwardRef(
  (
    {
      contentType = 'default',
      headerSelector = '#b #h',
      footerSelector = '#b #f',
      navigationWidth = 280,
      toolsWidth = 290,
      ...rest
    }: AppLayoutProps,
    ref: React.Ref<AppLayoutProps.Ref>
  ) => {
    if (isDevelopment) {
      if (rest.toolsOpen && rest.toolsHide) {
        warnOnce(
          'AppLayout',
          `You have enabled both the \`toolsOpen\` prop and the \`toolsHide\` prop. This is not supported. Set \`toolsOpen\` to \`false\` when you set \`toolsHide\` to \`true\`.`
        );
      }
    }
    const { __internalRootRef } = useBaseComponent<HTMLDivElement>('AppLayout', {
      props: {
        contentType,
        disableContentPaddings: rest.disableContentPaddings,
        disableBodyScroll: rest.disableBodyScroll,
        navigationWidth,
        navigationHide: rest.navigationHide,
        toolsHide: rest.toolsHide,
        toolsWidth,
        maxContentWidth: rest.maxContentWidth,
        minContentWidth: rest.minContentWidth,
        stickyNotifications: rest.stickyNotifications,
        disableContentHeaderOverlap: rest.disableContentHeaderOverlap,
      },
    });

    const [rootRef, props] = useAppLayout({
      contentType,
      headerSelector,
      footerSelector,
      navigationWidth,
      toolsWidth,
      ...rest,
    });

    const baseProps = getBaseProps(rest);

    return (
      <div ref={useMergeRefs(__internalRootRef, rootRef)} {...baseProps}>
        <AppLayoutInternal ref={ref} {...props} />
      </div>
    );
  }
);

applyDisplayName(AppLayout, 'AppLayout');
export default AppLayout;
