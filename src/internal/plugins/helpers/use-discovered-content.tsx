// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { ReactNode, useEffect, useRef, useState } from 'react';

import { AlertFlashContentConfig, AlertFlashContentController } from '../controllers/alert-flash-content';

export function createUseDiscoveredContent(onContentRegistered: AlertFlashContentController['onContentRegistered']) {
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
    const foundHeaderProviderRef = useRef<AlertFlashContentConfig>();
    const foundContentProviderRef = useRef<AlertFlashContentConfig>();
    const [foundHeaderProvider, setFoundHeaderProvider] = useState<AlertFlashContentConfig | null>(null);
    const [foundContentProvider, setFoundContentProvider] = useState<AlertFlashContentConfig | null>(null);

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
                console.warn('[AwsUi] [Runtime alert/flash content] Async header returned after component unmounted');
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
                console.warn('[AwsUi] [Runtime alert/flash content] Async content returned after component unmounted');
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
