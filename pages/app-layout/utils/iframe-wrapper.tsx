// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React, { useContext, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

import AppContext from '../../app/app-context';

import styles from './iframe-wrapper.scss';

function copyStyles(srcDoc: Document, targetDoc: Document) {
  for (const stylesheet of Array.from(srcDoc.querySelectorAll('link[rel=stylesheet]'))) {
    const newStylesheet = targetDoc.createElement('link');
    for (const attr of stylesheet.getAttributeNames()) {
      newStylesheet.setAttribute(attr, stylesheet.getAttribute(attr)!);
    }
    targetDoc.head.appendChild(newStylesheet);
  }
}

function syncClasses(from: HTMLElement, to: HTMLElement) {
  to.className = from.className;
  const observer = new MutationObserver(() => {
    to.className = from.className;
  });

  observer.observe(from, { attributes: true, attributeFilter: ['class'] });

  return () => {
    observer.disconnect();
  };
}

export function IframeWrapper({ id, AppComponent }: { id: string; AppComponent: React.ComponentType }) {
  const { urlParams } = useContext(AppContext);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframeEl = iframeRef.current;
    if (!iframeEl || !iframeEl.contentDocument) {
      return;
    }
    const iframeDocument = iframeEl.contentDocument;
    const innerAppRoot = iframeDocument.createElement('div');
    iframeDocument.body.appendChild(innerAppRoot);
    copyStyles(document, iframeDocument);
    iframeDocument.dir = document.dir;
    const syncClassesCleanup = syncClasses(document.body, iframeDocument.body);
    ReactDOM.render(<AppComponent />, innerAppRoot);
    return () => {
      syncClassesCleanup();
      ReactDOM.unmountComponentAtNode(innerAppRoot);
    };
  }, [AppComponent, urlParams.visualRefresh]);

  return <iframe id={id} title={id} ref={iframeRef} className={styles['full-screen']}></iframe>;
}