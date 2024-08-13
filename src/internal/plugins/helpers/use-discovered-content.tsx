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
    const [foundHeaderProvider, setFoundHeaderProvider] = useState<AlertContentConfig | null>(null);
    const [foundContentProvider, setFoundContentProvider] = useState<AlertContentConfig | null>(null);

    useEffect(() => {
      return onContentRegistered(contents => {
        for (const content of contents) {
          if (
            headerRef.current &&
            !foundHeaderProvider &&
            content.mountHeader?.(headerRef.current, { type, headerRef, contentRef })
          ) {
            setFoundHeaderProvider(content);
          }
          if (
            contentRef.current &&
            !foundContentProvider &&
            content.mountContent?.(contentRef.current, { type, headerRef, contentRef })
          ) {
            setFoundContentProvider(content);
          }
        }
        return () => {
          headerRef.current && foundHeaderProvider?.unmountContent?.(headerRef.current);
          contentRef.current && foundContentProvider?.unmountContent?.(contentRef.current);
        };
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [type, header, children]);

    return {
      hasDiscoveredHeader: !!foundHeaderProvider,
      hasDiscoveredContent: !!foundContentProvider,
      headerRef,
      contentRef,
    };
  };
}
