// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React, { useEffect, useRef, useState } from 'react';

import { useStableCallback } from '@cloudscape-design/component-toolkit/internal';

import { fireNonCancelableEvent } from '../../internal/events';
import { useControllable } from '../../internal/hooks/use-controllable';
import { awsuiPluginsInternal } from '../../internal/plugins/api';
import { sortByPriority } from '../../internal/plugins/helpers/utils';
import { AppLayoutProps } from '../interfaces';
import { convertRuntimeDrawers, DrawersLayout } from '../runtime-api';
import { togglesConfig } from '../toggles';

export const TOOLS_DRAWER_ID = 'awsui-internal-tools';

interface ToolsProps {
  toolsHide: boolean | undefined;
  toolsOpen: boolean | undefined;
  toolsWidth: number;
  tools: React.ReactNode | undefined;
  onToolsToggle: (newOpen: boolean) => void;
  ariaLabels: AppLayoutProps.Labels | undefined;
  disableDrawersMerge?: boolean;
}

function getToolsDrawerItem(props: ToolsProps): AppLayoutProps.Drawer | null {
  if (props.toolsHide) {
    return null;
  }
  const { iconName, getLabels } = togglesConfig.tools;
  const { mainLabel, closeLabel, openLabel } = getLabels(props.ariaLabels);
  return {
    id: TOOLS_DRAWER_ID,
    content: props.tools,
    resizable: false,
    ariaLabels: {
      triggerButton: openLabel,
      closeButton: closeLabel,
      drawerName: mainLabel ?? '',
    },
    trigger: {
      iconName: iconName,
    },
  };
}

const DRAWERS_LIMIT = 2;

function useRuntimeDrawers(
  disableRuntimeDrawers: boolean | undefined,
  activeDrawerId: string | null,
  onActiveDrawerChange: (newDrawerId: string | null) => void,
  activeGlobalDrawersIds: Array<string>,
  setActiveGlobalDrawersIds: (newDrawerId: string) => void
) {
  const [runtimeLocalDrawers, setRuntimeLocalDrawers] = useState<DrawersLayout>({ before: [], after: [] });
  const [runtimeGlobalDrawers, setRuntimeGlobalDrawers] = useState<DrawersLayout>({ before: [], after: [] });
  const onLocalDrawerChangeStable = useStableCallback(onActiveDrawerChange);
  const onGlobalDrawersChangeStable = useStableCallback(setActiveGlobalDrawersIds);

  const localDrawerWasOpenRef = useRef(false);
  localDrawerWasOpenRef.current = localDrawerWasOpenRef.current || !!activeDrawerId;

  const globalDrawersWereOpenRef = useRef(false);

  useEffect(() => {
    if (disableRuntimeDrawers) {
      return;
    }
    const unsubscribe = awsuiPluginsInternal.appLayout.onDrawersRegistered(drawers => {
      const localDrawers = drawers.filter(drawer => drawer.type !== 'global');
      const globalDrawers = drawers.filter(drawer => drawer.type === 'global');
      setRuntimeLocalDrawers(convertRuntimeDrawers(localDrawers));
      setRuntimeGlobalDrawers(convertRuntimeDrawers(globalDrawers));
      if (!localDrawerWasOpenRef.current) {
        const defaultActiveLocalDrawer = sortByPriority(localDrawers).find(drawer => drawer.defaultActive);
        if (defaultActiveLocalDrawer) {
          onLocalDrawerChangeStable(defaultActiveLocalDrawer.id);
        }
      }

      if (!globalDrawersWereOpenRef.current) {
        const defaultActiveGlobalDrawers = sortByPriority(globalDrawers).filter(
          drawer => drawer.defaultActive && !activeGlobalDrawersIds.includes(drawer.id)
        );
        defaultActiveGlobalDrawers.forEach(drawer => {
          onGlobalDrawersChangeStable(drawer.id);
        });
        globalDrawersWereOpenRef.current = true;
      }
    });
    return () => {
      unsubscribe();
      setRuntimeLocalDrawers({ before: [], after: [] });
    };
  }, [activeGlobalDrawersIds, disableRuntimeDrawers, onGlobalDrawersChangeStable, onLocalDrawerChangeStable]);

  return {
    local: runtimeLocalDrawers,
    global: runtimeGlobalDrawers,
  };
}

function applyToolsDrawer(toolsProps: ToolsProps, runtimeDrawers: DrawersLayout) {
  const drawers = [...runtimeDrawers.before, ...runtimeDrawers.after];
  if (drawers.length === 0 && toolsProps.disableDrawersMerge) {
    return null;
  }
  const toolsItem = getToolsDrawerItem(toolsProps);
  if (toolsItem) {
    drawers.unshift(toolsItem);
  }

  return drawers;
}

export const MIN_DRAWER_SIZE = 290;

type UseDrawersProps = Pick<AppLayoutProps, 'drawers' | 'activeDrawerId' | 'onDrawerChange'> & {
  __disableRuntimeDrawers?: boolean;
  onGlobalDrawerFocus?: (drawerId?: string) => void;
  onAddNewActiveDrawer?: (drawerId: string) => void;
};

export function useDrawers(
  {
    drawers,
    activeDrawerId: controlledActiveDrawerId,
    onDrawerChange,
    onGlobalDrawerFocus,
    onAddNewActiveDrawer,
    __disableRuntimeDrawers: disableRuntimeDrawers,
  }: UseDrawersProps,
  ariaLabels: AppLayoutProps['ariaLabels'],
  toolsProps: ToolsProps
) {
  const [activeDrawerId = null, setActiveDrawerId] = useControllable(controlledActiveDrawerId, onDrawerChange, null, {
    componentName: 'AppLayout',
    controlledProp: 'activeDrawerId',
    changeHandler: 'onChange',
  });
  const [activeGlobalDrawersIds, setActiveGlobalDrawersIds] = useState<Array<string>>([]);
  const [drawerSizes, setDrawerSizes] = useState<Record<string, number>>({});
  // FIFO queue that keeps track of open drawers, where the first element is the most recently opened drawer
  const [drawersOpenQueue, setDrawersOpenQueue] = useState<Array<string>>([]);

  function onActiveDrawerResize({ id, size }: { id: string; size: number }) {
    setDrawerSizes(oldSizes => ({ ...oldSizes, [id]: size }));
    fireNonCancelableEvent(activeDrawer?.onResize, { id, size });
    const activeGlobalDrawer = combinedGlobalDrawers.find(drawer => drawer.id === id);
    fireNonCancelableEvent(activeGlobalDrawer?.onResize, { id, size });
  }

  function onActiveDrawerChange(newDrawerId: string | null) {
    setActiveDrawerId(newDrawerId);
    newDrawerId && onAddNewActiveDrawer?.(newDrawerId);
    if (hasOwnDrawers) {
      fireNonCancelableEvent(onDrawerChange, { activeDrawerId: newDrawerId });
    } else if (!toolsProps.toolsHide) {
      toolsProps.onToolsToggle(newDrawerId === TOOLS_DRAWER_ID);
    }

    if (newDrawerId) {
      setDrawersOpenQueue(oldQueue => [newDrawerId, ...oldQueue]);
    } else if (activeDrawerId) {
      setDrawersOpenQueue(oldQueue => oldQueue.filter(id => id !== activeDrawerId));
    }
  }

  function onActiveGlobalDrawersChange(drawerId: string) {
    if (activeGlobalDrawersIds.includes(drawerId)) {
      setActiveGlobalDrawersIds(currentState => currentState.filter(id => id !== drawerId));
      onGlobalDrawerFocus && onGlobalDrawerFocus();
      setDrawersOpenQueue(oldQueue => oldQueue.filter(id => id !== drawerId));
    } else if (drawerId) {
      onAddNewActiveDrawer?.(drawerId);
      setActiveGlobalDrawersIds(currentState => [drawerId, ...currentState].slice(0, DRAWERS_LIMIT!));
      onGlobalDrawerFocus && onGlobalDrawerFocus(drawerId);
      setDrawersOpenQueue(oldQueue => [drawerId, ...oldQueue]);
    }
  }

  const hasOwnDrawers = !!drawers;
  const { local: runtimeLocalDrawers, global: runtimeGlobalDrawers } = useRuntimeDrawers(
    disableRuntimeDrawers,
    activeDrawerId,
    onActiveDrawerChange,
    activeGlobalDrawersIds,
    onActiveGlobalDrawersChange
  );
  const combinedLocalDrawers = drawers
    ? [...runtimeLocalDrawers.before, ...drawers, ...runtimeLocalDrawers.after]
    : applyToolsDrawer(toolsProps, runtimeLocalDrawers);
  const combinedGlobalDrawers = [...runtimeGlobalDrawers.before, ...runtimeGlobalDrawers.after];
  // support toolsOpen in runtime-drawers-only mode
  let activeDrawerIdResolved = toolsProps?.toolsOpen && !hasOwnDrawers ? TOOLS_DRAWER_ID : activeDrawerId;
  const activeDrawer = combinedLocalDrawers?.find(drawer => drawer.id === activeDrawerIdResolved);
  // ensure that id is only defined when the drawer exists
  activeDrawerIdResolved = activeDrawer?.id ?? null;
  const activeGlobalDrawers = combinedGlobalDrawers.filter(drawer => activeGlobalDrawersIds.includes(drawer.id));

  const activeDrawerSize = activeDrawerIdResolved
    ? drawerSizes[activeDrawerIdResolved] ?? activeDrawer?.defaultSize ?? toolsProps.toolsWidth
    : toolsProps.toolsWidth;
  const activeGlobalDrawersSizes: Record<string, number> = activeGlobalDrawersIds.reduce(
    (acc, currentGlobalDrawerId) => {
      const currentGlobalDrawer = combinedGlobalDrawers.find(drawer => drawer.id === currentGlobalDrawerId);
      return {
        ...acc,
        [currentGlobalDrawerId]:
          drawerSizes[currentGlobalDrawerId] ?? currentGlobalDrawer?.defaultSize ?? MIN_DRAWER_SIZE,
      };
    },
    {}
  );
  const minGlobalDrawersSizes: Record<string, number> = combinedGlobalDrawers.reduce((acc, globalDrawer) => {
    return {
      ...acc,
      [globalDrawer.id]: Math.min(globalDrawer.defaultSize ?? MIN_DRAWER_SIZE, MIN_DRAWER_SIZE),
    };
  }, {});
  const minDrawerSize = Math.min(activeDrawer?.defaultSize ?? MIN_DRAWER_SIZE, MIN_DRAWER_SIZE);

  return {
    ariaLabelsWithDrawers: ariaLabels,
    drawers: combinedLocalDrawers || undefined,
    activeDrawer,
    activeDrawerId: activeDrawerIdResolved,
    globalDrawers: combinedGlobalDrawers,
    activeGlobalDrawers: activeGlobalDrawers,
    activeGlobalDrawersIds,
    activeGlobalDrawersSizes,
    activeDrawerSize,
    minDrawerSize,
    minGlobalDrawersSizes,
    drawerSizes,
    drawersOpenQueue,
    onActiveDrawerChange,
    onActiveDrawerResize,
    onActiveGlobalDrawersChange,
  };
}
