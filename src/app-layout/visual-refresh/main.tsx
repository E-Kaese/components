// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import clsx from 'clsx';
import { useAppLayoutInternals } from './context';
import styles from './styles.css.js';
import testutilStyles from '../test-classes/styles.css.js';

export default function Main() {
  const {
    content,
    disableContentPaddings,
    hasDrawerViewportOverlay,
    isNavigationOpen,
    isSplitPanelOpen,
    isToolsOpen,
    mainElement,
    splitPanelDisplayed,
    splitPanelPosition,
    activeDrawerId,
  } = useAppLayoutInternals();

  return (
    <div
      className={clsx(
        styles.container,
        styles[`split-panel-position-${splitPanelPosition ?? 'bottom'}`],
        {
          [styles['disable-content-paddings']]: disableContentPaddings,
          [styles['has-split-panel']]: splitPanelDisplayed,
          [styles['is-navigation-open']]: isNavigationOpen,
          [styles['is-tools-open']]: isToolsOpen,
          [styles['has-active-drawer']]: !!activeDrawerId,
          [styles['is-split-panel-open']]: isSplitPanelOpen,
          [styles.unfocusable]: hasDrawerViewportOverlay,
        },
        testutilStyles.content
      )}
      ref={mainElement}
    >
      {content}
    </div>
  );
}
