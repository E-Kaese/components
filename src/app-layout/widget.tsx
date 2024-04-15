// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import { getGlobalFlag } from '../internal/utils/global-flags';
import { AppLayoutInternalProps, AppLayoutProps } from './interfaces';
import { useVisualRefresh } from '../internal/hooks/use-visual-mode';
import { AppLayoutImplementation } from './implementation';

type AppLayoutType = React.ForwardRefExoticComponent<AppLayoutInternalProps & React.RefAttributes<AppLayoutProps.Ref>>;

export function createWidgetizedAppLayout(
  AppLayoutLoader?: React.ComponentType<AppLayoutInternalProps>
): AppLayoutType {
  return React.forwardRef((props, ref) => {
    const isRefresh = useVisualRefresh();
    if (isRefresh && getGlobalFlag('appLayoutWidget') && AppLayoutLoader) {
      return <AppLayoutLoader {...props} />;
    }

    return <AppLayoutImplementation ref={ref} {...props} />;
  });
}
