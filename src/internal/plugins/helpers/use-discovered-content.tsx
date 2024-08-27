// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { ReactNode, useEffect, useRef, useState } from 'react';

import { AlertContentConfig, AlertContentController } from '../controllers/alert-content';

export function createUseDiscoveredContent(onContentRegistered: AlertContentController['onContentRegistered']) {
  return function useDiscoveredContent({
    type,
    header,
    children,
  }: {
    type: string;
    header: ReactNode;
    children: ReactNode;
  }) {
    const headerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const actionsRef = useRef<HTMLDivElement>(null);
    const foundHeaderProviderRef = useRef<AlertContentConfig>();
    const foundContentProviderRef = useRef<AlertContentConfig>();
    const [foundHeaderProvider, setFoundHeaderProvider] = useState<AlertContentConfig | null>(null);
    const [foundContentProvider, setFoundContentProvider] = useState<AlertContentConfig | null>(null);

    useEffect(() => {
      return onContentRegistered(providers => {
        const controller = new AbortController();
        const runHeader = async () => {
          for (const provider of providers) {
            if (
              headerRef.current &&
              !foundHeaderProvider &&
              (await provider.mountHeader?.(headerRef.current, {
                type,
                headerRef,
                contentRef,
                actionsRef,
                signal: controller.signal,
              }))
            ) {
              if (controller.signal.aborted) {
                console.warn('[AwsUi] [runtime alert content] Async header returned after alert unmounted');
                return;
              }
              foundHeaderProviderRef.current = provider;
              setFoundHeaderProvider(provider);
            }
          }
        };
        const runContent = async () => {
          for (const provider of providers) {
            if (
              contentRef.current &&
              !foundContentProvider &&
              (await provider.mountContent?.(contentRef.current, {
                type,
                headerRef,
                contentRef,
                actionsRef,
                signal: controller.signal,
              }))
            ) {
              if (controller.signal.aborted) {
                console.warn('[AwsUi] [runtime alert content] Async content returned after alert unmounted');
                return;
              }
              foundContentProviderRef.current = provider;
              setFoundContentProvider(provider);
            }
          }
        };
        runHeader();
        runContent();
        return () => {
          controller.abort();
          headerRef.current && foundHeaderProviderRef.current?.unmountHeader?.(headerRef.current);
          contentRef.current && foundContentProviderRef.current?.unmountContent?.(contentRef.current);
        };
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [type, header, children]);

    return {
      hasDiscoveredHeader: !!foundHeaderProvider,
      hasDiscoveredContent: !!foundContentProvider,
      headerRef,
      contentRef,
      actionsRef,
    };
  };
}
