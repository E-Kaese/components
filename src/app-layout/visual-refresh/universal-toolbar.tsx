// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import clsx from 'clsx';
import { InternalButton } from '../../button/internal';
import { MobileTriggers as DrawersMobileTriggers } from './drawers';
import { DesktopTriggers as DrawersToolbarTriggers } from './drawers';
import { useAppLayoutInternals } from './context';
import customCssProps from '../../internal/generated/custom-css-properties';
import styles from './styles.css.js';
import testutilStyles from '../test-classes/styles.css.js';
import TriggerButton from './trigger-button';

export default function UniversalToolbar() {
  const {
    ariaLabels,
    breadcrumbs,
    drawers,
    handleNavigationClick,
    handleToolsClick,
    hasDrawerViewportOverlay,
    isMobile,
    isNavigationOpen,
    isToolsOpen,
    navigationHide,
    navigationRefs,
    toolsHide,
    toolsRefs,
    toolbarRef,
  } = useAppLayoutInternals();

  if (navigationHide && !breadcrumbs && toolsHide && drawers.length === 0) {
    return null;
  }

  let previousScrollPosition = window.pageYOffset;

  window.onscroll = function handleToolbarStyles() {
    const currentScrollPosition = window.pageYOffset;
    const toolbar = document.getElementById('toolbar');

    if (toolbar) {
      console.log(previousScrollPosition, currentScrollPosition);
      if (previousScrollPosition > currentScrollPosition) {
        toolbar.style.top = toolbar.style.getPropertyValue(customCssProps.offsetTop);
        toolbar.style.opacity = '1';
        toolbar.style.height = `48px`;
        toolbar.classList.remove(styles['toolbar-hidden']);
        // 80 is an arbitrary number to have a pause before the toolbar scrolls out of view. toolbar.offsetHeight was another option
      } else if (currentScrollPosition > 80) {
        toolbar.style.top = '-60px';
        toolbar.style.opacity = '0';
        toolbar.style.height = '0px';
        toolbar.classList.add(styles['toolbar-hidden']);
      }
      if (currentScrollPosition > 0) {
        toolbar.classList.add(styles['toolbar-sticky']);
      } else {
        toolbar.classList.remove(styles['toolbar-sticky']);
      }
    }

    previousScrollPosition = currentScrollPosition;
  };

  return (
    <section
      id="toolbar"
      ref={toolbarRef}
      className={clsx(
        styles['universal-toolbar'],
        {
          [styles['has-breadcrumbs']]: breadcrumbs,
          [styles.unfocusable]: hasDrawerViewportOverlay,
          [testutilStyles['mobile-bar']]: isMobile,
        },
        testutilStyles['mobile-bar']
      )}
    >
      {!navigationHide && (
        <nav
          aria-hidden={isNavigationOpen}
          className={clsx(styles['universal-toolbar-nav'], { [testutilStyles['drawer-closed']]: !isNavigationOpen })}
        >
          <TriggerButton
            ariaLabel={ariaLabels?.navigationToggle ?? undefined}
            ariaExpanded={isNavigationOpen ? undefined : false}
            iconName="menu"
            className={testutilStyles['navigation-toggle']}
            onClick={() => handleNavigationClick(!isNavigationOpen)}
            ref={navigationRefs.toggle}
            selected={isNavigationOpen}
          />
        </nav>
      )}

      {breadcrumbs && (
        <div className={clsx(styles['universal-toolbar-breadcrumbs'], testutilStyles.breadcrumbs)}>{breadcrumbs}</div>
      )}

      {!toolsHide && drawers.length === 0 && (
        <aside
          aria-hidden={isToolsOpen}
          aria-label={ariaLabels?.tools ?? undefined}
          className={clsx(styles['universal-toolbar-tools'], { [testutilStyles['drawer-closed']]: !isToolsOpen })}
        >
          <TriggerButton
            className={testutilStyles['tools-toggle']}
            ariaExpanded={isToolsOpen}
            ariaLabel={ariaLabels?.toolsToggle ?? undefined}
            iconName="status-info"
            onClick={() => handleToolsClick(!isToolsOpen)}
            ref={toolsRefs.toggle}
            selected={isToolsOpen}
          />
        </aside>
      )}
      {isMobile ? <DrawersMobileTriggers /> : <DrawersToolbarTriggers />}
    </section>
  );
}