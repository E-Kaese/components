// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import clsx from 'clsx';
import customCssProps from '../../internal/generated/custom-css-properties';
import { SkeletonLayout } from '../skeleton/layout';
import testutilStyles from '../test-classes/styles.css.js';
import { useAppLayoutInternals } from './context';
import Navigation from './navigation';
import MobileToolbar from './mobile-toolbar';
import Notifications from './notifications';
import Breadcrumbs from './breadcrumbs';
import Header from './header';
import Main from './main';
import SplitPanel from './split-panel';
import Tools from './tools';
import Drawers from './drawers';
import Background from './background';
import styles from './styles.css.js';

export default function Layout() {
  const {
    breadcrumbs,
    contentHeader,
    contentType,
    disableBodyScroll,
    disableContentPaddings,
    drawersTriggerCount,
    footerHeight,
    hasNotificationsContent,
    hasStickyBackground,
    hasOpenDrawer,
    isBackgroundOverlapDisabled,
    headerHeight,
    placement,

    navigationOpen,

    maxContentWidth,
    minContentWidth,
    navigationHide,
    notificationsHeight,
    __embeddedViewMode,
    splitPanelPosition,
    stickyNotifications,
    splitPanelDisplayed,
  } = useAppLayoutInternals();

  // Content gaps on the left and right are used with the minmax function in the CSS grid column definition
  const hasContentGapLeft = navigationOpen || navigationHide;
  const hasContentGapRight = drawersTriggerCount === 0 || hasOpenDrawer;

  return (
    <SkeletonLayout
      className={clsx(styles[`split-panel-position-${splitPanelPosition ?? 'bottom'}`], {
        [styles['disable-body-scroll']]: disableBodyScroll,
        [testutilStyles['disable-body-scroll-root']]: disableBodyScroll,
        [styles['has-split-panel']]: splitPanelDisplayed,
        [styles['has-sticky-background']]: hasStickyBackground,
        [styles['has-sticky-notifications']]: stickyNotifications && hasNotificationsContent,
        [styles['is-overlap-disabled']]: isBackgroundOverlapDisabled,
      })}
      style={{
        [customCssProps.offsetTop]: `${headerHeight}px`,
        [customCssProps.contentHeight]: `calc(100vh - ${headerHeight}px - ${footerHeight}px)`,
        [customCssProps.notificationsHeight]: `${notificationsHeight}px`,
      }}
      embeddedViewMode={__embeddedViewMode}
      contentType={contentType}
      minContentWidth={minContentWidth}
      maxContentWidth={maxContentWidth}
      disableContentPaddings={disableContentPaddings}
      placement={placement}
      background={<Background />}
      leftPanel={<Navigation />}
      topBar={<MobileToolbar />}
      notifications={<Notifications />}
      breadcrumbs={breadcrumbs && <Breadcrumbs />}
      contentHeader={contentHeader && <Header />}
      content={
        <>
          <Main />
          <SplitPanel.Bottom />
        </>
      }
      rightPanel={
        <>
          <Tools>
            <SplitPanel.Side />
          </Tools>
          <Drawers />
        </>
      }
      hasNotifications={hasNotificationsContent}
      hasContentGapLeft={hasContentGapLeft}
      hasContentGapRight={hasContentGapRight}
    />
  );
}
