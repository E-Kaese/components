// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { RefObject, useEffect } from 'react';
import {
  ComponentConfiguration,
  PackageSettings,
} from '@cloudscape-design/component-toolkit/lib/internal/base-component/metrics/interfaces';
import { trackEvent } from './analytics';

function toKebabCase(str: string) {
  return str
    .trim()
    .replace(/\s+/g, '-')
    .replace(/_/g, '-')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();
}

export function useComponentTracking<T>(
  ref: RefObject<T>,
  componentName: string,
  configuration: ComponentConfiguration = { props: {}, analytics: {} },
  packageSettings?: PackageSettings
) {
  useEffect(() => {
    if (ref.current) {
      const node = ref.current as unknown as HTMLElement;
      trackEvent(node, 'mount', { componentName, detail: { packageSettings, configuration } });

      return () => {
        trackEvent(node, 'unmount', { componentName });
      };
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (ref.current) {
      const node = ref.current as unknown as HTMLElement;
      node.setAttribute('data-analytics-component', toKebabCase(componentName));
      trackEvent(node, 'render', { componentName, detail: { packageSettings, configuration } });
    }
  });
}
