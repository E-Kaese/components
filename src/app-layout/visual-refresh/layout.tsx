// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import clsx from 'clsx';
import customCssProps from '../../internal/generated/custom-css-properties';
import { useAppLayoutInternals } from './context';
import styles from './styles.css.js';
import testutilStyles from '../test-classes/styles.css.js';
import { useMergeRefs } from '../../internal/hooks/use-merge-refs';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = React.forwardRef<HTMLDivElement, LayoutProps>(({ children }, ref) => {
  const {
    breadcrumbs,
    contentHeader,
    contentType,
    disableBodyScroll,
    disableContentPaddings,
    drawersTriggerCount,
    footerHeight,
    hasNotificationsContent,
    hasOpenDrawer,
    headerHeight,
    isBackgroundOverlapDisabled,
    isMobile,
    navigationOpen,
    layoutElement,
    layoutWidth,
    mainOffsetLeft,
    maxContentWidth,
    minContentWidth,
    navigationHide,
    notificationsHeight,
    __embeddedViewMode,
    splitPanelPosition,
    splitPanelDisplayed,
  } = useAppLayoutInternals();

  // Determine the first content child so the gap will vertically align with the trigger buttons
  const contentFirstChild = getContentFirstChild(breadcrumbs, contentHeader, hasNotificationsContent, isMobile);

  // Content gaps on the left and right are used with the minmax function in the CSS grid column definition
  const hasContentGapLeft = navigationOpen || navigationHide;
  const hasContentGapRight = drawersTriggerCount === 0 || hasOpenDrawer;
  const mergedRef = useMergeRefs(ref, layoutElement);

  return (
    <main
      ref={mergedRef}
      className={clsx(
        styles.layout,
        styles[`content-first-child-${contentFirstChild}`],
        styles[`content-type-${contentType}`],
        styles[`split-panel-position-${splitPanelPosition ?? 'bottom'}`],
        {
          [styles['disable-body-scroll']]: disableBodyScroll,
          [testutilStyles['disable-body-scroll-root']]: disableBodyScroll,
          [styles['disable-content-paddings']]: disableContentPaddings,
          [styles['has-breadcrumbs']]: breadcrumbs && !isMobile,
          [styles['has-content-gap-left']]: hasContentGapLeft,
          [styles['has-content-gap-right']]: hasContentGapRight,
          [styles['has-header']]: contentHeader,
          [styles['has-max-content-width']]: maxContentWidth && maxContentWidth > 0,
          [styles['has-split-panel']]: splitPanelDisplayed,
          [styles['is-overlap-disabled']]: isBackgroundOverlapDisabled,
          [styles['is-hide-mobile-toolbar']]: __embeddedViewMode,
          [styles['has-left-toggles-gutter']]: !(isMobile || navigationHide || navigationOpen),
          [styles['has-right-toggles-gutter']]: !isMobile && !hasContentGapRight,
        },
        testutilStyles.root
      )}
      style={{
        [customCssProps.headerHeight]: `${headerHeight}px`,
        [customCssProps.footerHeight]: `${footerHeight}px`,
        [customCssProps.layoutWidth]: `${layoutWidth}px`,
        [customCssProps.mainOffsetLeft]: `${mainOffsetLeft}px`,
        ...(maxContentWidth && { [customCssProps.maxContentWidth]: `${maxContentWidth}px` }),
        ...(minContentWidth && { [customCssProps.minContentWidth]: `${minContentWidth}px` }),
        [customCssProps.notificationsHeight]: `${notificationsHeight}px`,
      }}
    >
      {children}
    </main>
  );
});

export default Layout;

/*
The Notifications, Breadcrumbs, Header, and Main are all rendered in the center
column of the grid layout. Any of these could be the first child to render in the
content area if the previous siblings do not exist. The grid gap before the first
child will be different to ensure vertical alignment with the trigger buttons.
*/
function getContentFirstChild(
  breadcrumbs: React.ReactNode,
  contentHeader: React.ReactNode,
  hasNotificationsContent: boolean,
  isMobile: boolean
) {
  let contentFirstChild = 'main';

  if (hasNotificationsContent) {
    contentFirstChild = 'notifications';
  } else if (breadcrumbs && !isMobile) {
    contentFirstChild = 'breadcrumbs';
  } else if (contentHeader) {
    contentFirstChild = 'header';
  }

  return contentFirstChild;
}
