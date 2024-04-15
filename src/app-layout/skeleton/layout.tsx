// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import clsx from 'clsx';
import customCssProps from '../../internal/generated/custom-css-properties';
import { AppLayoutPropsWithDefaults } from '../interfaces';
import styles from './styles.css.js';
import { useMobile } from '../../internal/hooks/use-mobile';

interface SkeletonLayoutProps
  extends Pick<
    AppLayoutPropsWithDefaults,
    | 'notifications'
    | 'breadcrumbs'
    | 'contentHeader'
    | 'content'
    | 'contentType'
    | 'minContentWidth'
    | 'maxContentWidth'
    | 'disableContentPaddings'
  > {
  background?: React.ReactNode;
  embeddedViewMode?: boolean;
  className?: string;
  style?: React.CSSProperties;
  topBar?: React.ReactNode;
  bottomBar?: React.ReactNode;
  leftPanel?: React.ReactNode;
  rightPanel?: React.ReactNode;
  placement: { top: number; left: number; bottom: number; width: number };
  hasContentGapLeft?: boolean;
  hasContentGapRight?: boolean;
  hasNotifications?: boolean;
}

export function SkeletonLayout({
  // public props relevant for skeleton
  embeddedViewMode,
  notifications,
  breadcrumbs,
  contentHeader,
  content,
  contentType,
  maxContentWidth,
  minContentWidth,
  disableContentPaddings,

  // computed at index.js
  placement,

  // extensions
  topBar,
  bottomBar,
  leftPanel,
  rightPanel,

  // old-vr-only features
  background,
  hasContentGapLeft,
  hasContentGapRight,
  hasNotifications,
  // overrides for old-vr version
  className,
  style,
}: SkeletonLayoutProps) {
  const isMobile = useMobile();
  // Determine the first content child so the gap will vertically align with the trigger buttons
  const contentFirstChild = getContentFirstChild(
    breadcrumbs,
    contentHeader,
    hasNotifications ?? !!notifications,
    isMobile
  );

  return (
    <main
      className={clsx(
        className,
        styles.layout,
        styles[`content-first-child-${contentFirstChild}`],
        styles[`content-type-${contentType}`],
        {
          [styles['disable-content-paddings']]: disableContentPaddings,
          [styles['has-breadcrumbs']]: breadcrumbs && !isMobile,
          [styles['has-content-gap-left']]: hasContentGapLeft,
          [styles['has-content-gap-right']]: hasContentGapRight,
          [styles['has-header']]: contentHeader,
          [styles['has-max-content-width']]: maxContentWidth && maxContentWidth > 0,
          [styles['is-hide-mobile-toolbar']]: embeddedViewMode,
        }
      )}
      style={{
        [customCssProps.headerHeight]: `${placement.top}px`,
        [customCssProps.footerHeight]: `${placement.bottom}px`,
        [customCssProps.layoutWidth]: `${placement.width}px`,
        [customCssProps.mainOffsetLeft]: `${placement.left}px`,
        ...(maxContentWidth && { [customCssProps.maxContentWidth]: `${maxContentWidth}px` }),
        ...(minContentWidth && { [customCssProps.minContentWidth]: `${minContentWidth}px` }),
        ...style,
      }}
    >
      {background}
      {topBar && <section className={styles['top-bar']}>{topBar}</section>}
      {leftPanel && <div className={styles['left-panel']}>{leftPanel}</div>}
      {notifications && <div className={styles.notifications}>{notifications}</div>}
      {breadcrumbs && <div className={styles.breadcrumbs}>{breadcrumbs}</div>}
      {contentHeader && <div className={styles.contentHeader}>{contentHeader}</div>}
      {content}
      {rightPanel && <div className={styles['right-panel']}>{rightPanel}</div>}
      {bottomBar && <section className={styles['bottom-bar']}>{bottomBar}</section>}
    </main>
  );
}

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
