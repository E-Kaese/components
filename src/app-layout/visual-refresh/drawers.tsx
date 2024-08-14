// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React, { useMemo, useRef } from 'react';
import clsx from 'clsx';

import { useContainerQuery } from '@cloudscape-design/component-toolkit';

import { InternalButton } from '../../button/internal';
import customCssProps from '../../internal/generated/custom-css-properties';
import { getLimitedValue } from '../../split-panel/utils/size-utils';
import { splitItems } from '../drawer/drawers-helpers';
import OverflowMenu from '../drawer/overflow-menu';
import { TOOLS_DRAWER_ID } from '../utils/use-drawers';
import useResize from '../utils/use-resize';
import { useAppLayoutInternals } from './context';
import SplitPanel from './split-panel';
import TriggerButton from './trigger-button';

import splitPanelTestUtilStyles from '../../split-panel/test-classes/styles.css.js';
import testutilStyles from '../test-classes/styles.css.js';
import styles from './styles.css.js';

/**
 * The Drawers root component is mounted in the AppLayout index file. It will only
 * render if the drawers are defined, and it will take over the mounting of and
 * rendering of the Tools and SplitPanel (side position) if they exist. If drawers
 * do not exist then the Tools and SplitPanel will be handled by the Tools component.
 */
export default function Drawers() {
  const {
    activeDrawersIds,
    disableBodyScroll,
    drawers,
    drawersTriggerCount,
    hasDrawerViewportOverlay,
    hasOpenDrawer,
    navigationOpen,
    navigationHide,
    isMobile,
  } = useAppLayoutInternals();

  const isUnfocusable = hasDrawerViewportOverlay && navigationOpen && !navigationHide;

  if (!drawers || drawersTriggerCount === 0) {
    return null;
  }

  return (
    <div
      className={clsx(styles['drawers-container'], {
        [styles['disable-body-scroll']]: disableBodyScroll,
        [styles['has-open-drawer']]: hasOpenDrawer,
        [styles.unfocusable]: isUnfocusable,
      })}
    >
      <SplitPanel.Side />
      {activeDrawersIds
        ?.filter(drawerId => !!drawers.find(drawer => drawer.id === drawerId))
        .map(activeDrawerId => <ActiveDrawer key={activeDrawerId} activeDrawerId={activeDrawerId} />)}
      {!isMobile && <DesktopTriggers />}
    </div>
  );
}

function ActiveDrawer({ activeDrawerId }: { activeDrawerId: string }) {
  const {
    activeDrawersIds,
    ariaLabels,
    drawers,
    handleDrawersClick,
    hasDrawerViewportOverlay,
    isMobile,
    navigationOpen,
    navigationHide,
    drawersRefs,
    drawersMinWidth,
    drawersMaxWidth,
    onActiveDrawerResize,
    loseDrawersFocus,
    isToolsOpen,
    drawerSizes,
    toolsWidth,
    activeDrawersRefs,
  } = useAppLayoutInternals();

  const activeDrawer = drawers?.find(item => item.id === activeDrawerId);

  const remainingActiveDrawersWidth = useMemo(() => {
    const remainingActiveDrawersIds = (activeDrawersIds ?? []).filter(id => id !== activeDrawerId);
    let result = 0;

    remainingActiveDrawersIds.forEach(drawerId => {
      const activeDrawer = drawers?.find(item => item.id === drawerId);
      result += drawerSizes[drawerId ?? ''] ?? activeDrawer?.defaultSize ?? toolsWidth;
    });

    return result;
  }, [activeDrawerId, activeDrawersIds, drawerSizes, drawers, toolsWidth]);

  const { resizeHandle, drawerSize } = useResize(activeDrawersRefs[activeDrawerId]!, {
    onActiveDrawerResize,
    activeDrawerSize: drawerSizes[activeDrawerId ?? ''] ?? activeDrawer?.defaultSize ?? toolsWidth,
    activeDrawer,
    drawersRefs: drawersRefs[activeDrawerId],
    isToolsOpen,
    drawersMaxWidth: drawersMaxWidth - remainingActiveDrawersWidth,
    drawersMinWidth,
  });

  const computedAriaLabels = {
    closeButton: activeDrawerId ? activeDrawer?.ariaLabels?.closeButton : ariaLabels?.toolsClose,
    content: activeDrawerId ? activeDrawer?.ariaLabels?.drawerName : ariaLabels?.tools,
  };

  const isHidden = !activeDrawerId;
  const isUnfocusable = isHidden || (hasDrawerViewportOverlay && navigationOpen && !navigationHide);
  const isToolsDrawer = activeDrawerId === TOOLS_DRAWER_ID;
  const toolsContent = drawers?.find(drawer => drawer.id === TOOLS_DRAWER_ID)?.content;

  const size = getLimitedValue(drawersMinWidth, drawerSize, drawersMaxWidth - remainingActiveDrawersWidth);

  return (
    <aside
      id={activeDrawerId ?? undefined}
      aria-hidden={isHidden}
      aria-label={computedAriaLabels.content}
      className={clsx(styles.drawer, {
        [styles['is-drawer-open']]: activeDrawerId,
        [styles.unfocusable]: isUnfocusable,
        [testutilStyles['active-drawer']]: activeDrawerId,
        [testutilStyles.tools]: isToolsDrawer,
      })}
      style={{
        ...(!isMobile && drawerSize && { [customCssProps.drawerSize]: `${size}px` }),
      }}
      ref={activeDrawersRefs[activeDrawerId]}
      onBlur={e => {
        if (!e.relatedTarget || !e.currentTarget.contains(e.relatedTarget)) {
          loseDrawersFocus();
        }
      }}
    >
      {!isMobile && activeDrawer?.resizable && <div className={styles['drawer-slider']}>{resizeHandle}</div>}
      <div className={styles['drawer-content-container']}>
        <div className={styles['drawer-close-button']}>
          <InternalButton
            ariaLabel={computedAriaLabels.closeButton}
            className={clsx({
              [testutilStyles['active-drawer-close-button']]: activeDrawerId,
              [testutilStyles['tools-close']]: isToolsDrawer,
            })}
            formAction="none"
            iconName={isMobile ? 'close' : 'angle-right'}
            onClick={() => {
              handleDrawersClick(activeDrawerId);
            }}
            ref={drawersRefs[activeDrawerId].close}
            variant="icon"
          />
        </div>
        {toolsContent && (
          <div
            className={clsx(
              styles['drawer-content'],
              activeDrawerId !== TOOLS_DRAWER_ID && styles['drawer-content-hidden']
            )}
          >
            {toolsContent}
          </div>
        )}
        {activeDrawerId !== TOOLS_DRAWER_ID && (
          <div className={styles['drawer-content']}>{activeDrawerId && activeDrawer?.content}</div>
        )}
      </div>
    </aside>
  );
}

/**
 * The DesktopTriggers will render the trigger buttons for Tools, Drawers, and the
 * SplitPanel in non-mobile viewports. Changes to the activeDrawerId need to be
 * tracked by the previousActiveDrawerId property in order to appropriately apply
 * the ref required to manage focus control.
 */
function DesktopTriggers() {
  const {
    activeDrawersIds,
    drawers,
    drawersAriaLabel,
    drawersOverflowAriaLabel,
    drawersOverflowWithBadgeAriaLabel,
    drawersRefs,
    drawersTriggerCount,
    handleDrawersClick,
    handleSplitPanelClick,
    hasOpenDrawer,
    isSplitPanelOpen,
    splitPanel,
    splitPanelControlId,
    splitPanelDisplayed,
    splitPanelPosition,
    splitPanelRefs,
    splitPanelToggle,
    splitPanelReportedHeaderHeight,
    splitPanelReportedSize,
    headerVariant,
  } = useAppLayoutInternals();

  const hasMultipleTriggers = drawersTriggerCount > 1;
  const hasSplitPanel = splitPanel && splitPanelDisplayed && splitPanelPosition === 'side';
  // leftmost active drawer
  const activeDrawerId = activeDrawersIds[0];

  const previousActiveDrawerId = useRef(activeDrawerId);
  const [containerHeight, triggersContainerRef] = useContainerQuery(rect => rect.contentBoxHeight);

  if (activeDrawerId) {
    previousActiveDrawerId.current = activeDrawerId;
  }

  const splitPanelHeight =
    isSplitPanelOpen && splitPanelPosition === 'bottom' ? splitPanelReportedSize : splitPanelReportedHeaderHeight;

  const getIndexOfOverflowItem = () => {
    if (containerHeight) {
      const ITEM_HEIGHT = 48;
      const overflowSpot =
        activeDrawerId && isSplitPanelOpen
          ? (containerHeight - splitPanelReportedHeaderHeight) / 1.5
          : (containerHeight - splitPanelHeight) / 1.5;

      const index = Math.floor(overflowSpot / ITEM_HEIGHT);

      let splitPanelItem = 0;
      if (hasSplitPanel && splitPanelToggle.displayed) {
        splitPanelItem = 1;
      }
      return index - splitPanelItem;
    }

    return 0;
  };

  const { visibleItems, overflowItems } = splitItems(drawers ?? undefined, getIndexOfOverflowItem(), activeDrawerId);
  const overflowMenuHasBadge = !!overflowItems.find(item => item.badge);

  return (
    <aside
      className={clsx(styles['drawers-desktop-triggers-container'], {
        [styles['has-multiple-triggers']]: hasMultipleTriggers,
        [styles['has-open-drawer']]: hasOpenDrawer,
      })}
      aria-label={drawersAriaLabel}
      ref={triggersContainerRef}
      role="region"
    >
      <div
        className={clsx(styles['drawers-trigger-content'], {
          [styles['has-multiple-triggers']]: hasMultipleTriggers,
          [styles['has-open-drawer']]: hasOpenDrawer,
        })}
        role="toolbar"
        aria-orientation="vertical"
      >
        {visibleItems.map(item => {
          return (
            <TriggerButton
              ariaLabel={item.ariaLabels?.triggerButton}
              ariaExpanded={activeDrawersIds?.includes(item.id)}
              ariaControls={activeDrawersIds?.includes(item.id) ? item.id : undefined}
              className={clsx(
                styles['drawers-trigger'],
                testutilStyles['drawers-trigger'],
                item.id === TOOLS_DRAWER_ID && testutilStyles['tools-toggle']
              )}
              iconName={item.trigger.iconName}
              iconSvg={item.trigger.iconSvg}
              key={item.id}
              onClick={() => handleDrawersClick(item.id)}
              ref={item.id === previousActiveDrawerId.current ? drawersRefs[activeDrawerId]?.toggle : undefined}
              selected={activeDrawersIds?.includes(item.id)}
              badge={item.badge}
              testId={`awsui-app-layout-trigger-${item.id}`}
              highContrastHeader={headerVariant === 'high-contrast'}
            />
          );
        })}

        {overflowItems.length > 0 && (
          <OverflowMenu
            items={overflowItems}
            ariaLabel={overflowMenuHasBadge ? drawersOverflowWithBadgeAriaLabel : drawersOverflowAriaLabel}
            customTriggerBuilder={({ onClick, triggerRef, ariaLabel, ariaExpanded, testUtilsClass }) => (
              <TriggerButton
                ref={triggerRef}
                ariaLabel={ariaLabel}
                ariaExpanded={ariaExpanded}
                badge={overflowMenuHasBadge}
                className={clsx(styles['drawers-trigger'], testutilStyles['drawers-trigger'], testUtilsClass)}
                iconName="ellipsis"
                onClick={onClick}
                highContrastHeader={headerVariant === 'high-contrast'}
              />
            )}
            onItemClick={({ detail }) => {
              handleDrawersClick(detail.id);
            }}
          />
        )}
        {hasSplitPanel && splitPanelToggle.displayed && (
          <TriggerButton
            ariaLabel={splitPanelToggle.ariaLabel}
            ariaControls={splitPanelControlId}
            ariaExpanded={!!isSplitPanelOpen}
            className={clsx(styles['drawers-trigger'], splitPanelTestUtilStyles['open-button'])}
            iconName="view-vertical"
            onClick={() => handleSplitPanelClick()}
            selected={hasSplitPanel && isSplitPanelOpen}
            ref={splitPanelRefs.toggle}
            highContrastHeader={headerVariant === 'high-contrast'}
          />
        )}
      </div>
    </aside>
  );
}

/**
 * The MobileTriggers will be mounted inside of the AppBar component and
 * only rendered when Drawers are defined in mobile viewports. The same logic
 * will in the AppBar component will suppress the rendering of the legacy
 * trigger button for the Tools drawer.
 */
export function MobileTriggers() {
  const {
    activeDrawersIds,
    drawers,
    drawersAriaLabel,
    drawersOverflowAriaLabel,
    drawersOverflowWithBadgeAriaLabel,
    drawersRefs,
    handleDrawersClick,
    hasDrawerViewportOverlay,
  } = useAppLayoutInternals();

  // leftmost active drawer
  const activeDrawerId = activeDrawersIds[0];

  const previousActiveDrawerId = useRef(activeDrawerId);

  if (!drawers) {
    return null;
  }

  if (activeDrawerId) {
    previousActiveDrawerId.current = activeDrawerId;
  }

  const { visibleItems, overflowItems } = splitItems(drawers, 2, activeDrawerId);
  const overflowMenuHasBadge = !!overflowItems.find(item => item.badge);

  return (
    <aside
      aria-hidden={hasDrawerViewportOverlay}
      className={clsx({
        [styles.unfocusable]: hasDrawerViewportOverlay,
      })}
      aria-label={drawersAriaLabel}
      role="region"
    >
      <div className={styles['drawers-mobile-triggers-container']} role="toolbar" aria-orientation="horizontal">
        {visibleItems.map(item => (
          <InternalButton
            ariaExpanded={item.id === activeDrawerId}
            ariaLabel={item.ariaLabels?.triggerButton}
            className={clsx(
              styles['drawers-trigger'],
              testutilStyles['drawers-trigger'],
              item.id === TOOLS_DRAWER_ID && testutilStyles['tools-toggle']
            )}
            disabled={hasDrawerViewportOverlay}
            ref={item.id === previousActiveDrawerId.current ? drawersRefs[activeDrawerId]?.toggle : undefined}
            formAction="none"
            iconName={item.trigger.iconName}
            iconSvg={item.trigger.iconSvg}
            badge={item.badge}
            key={item.id}
            onClick={() => handleDrawersClick(item.id)}
            variant="icon"
            __nativeAttributes={{ 'aria-haspopup': true, 'data-testid': `awsui-app-layout-trigger-${item.id}` }}
          />
        ))}
        {overflowItems.length > 0 && (
          <OverflowMenu
            items={overflowItems}
            ariaLabel={overflowMenuHasBadge ? drawersOverflowWithBadgeAriaLabel : drawersOverflowAriaLabel}
            onItemClick={({ detail }) => handleDrawersClick(detail.id)}
          />
        )}
      </div>
    </aside>
  );
}
