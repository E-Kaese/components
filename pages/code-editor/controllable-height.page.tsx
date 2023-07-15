// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React, { useState } from 'react';
import CodeEditor from '~components/code-editor';
import { useAce } from './ace-loader';
import { i18nStrings } from './base-props';
import ScreenshotArea from '../utils/screenshot-area';

import { sayHelloSample } from './code-samples';

export default function () {
  const [value, setValue] = useState(sayHelloSample);
  const [resizingHeight, setResizingHeight] = useState(240);
  const { ace, loading } = useAce();

  return (
    <article>
      <h1>Code Editor - controllable Height</h1>
      <ScreenshotArea style={{ maxWidth: 960 }}>
        <CodeEditor
          ace={ace}
          value={value}
          language="javascript"
          onDelayedChange={event => setValue(event.detail.value)}
          onPreferencesChange={() => {}}
          loading={loading}
          i18nStrings={i18nStrings}
          editorContentHeight={resizingHeight}
          onEditorContentResize={event => setResizingHeight(event.detail.height)}
          id={'code-editor-controlled'}
        />
        <div id="event-content">current Height : {resizingHeight}</div>

        <CodeEditor
          ace={ace}
          value={value}
          language="javascript"
          onDelayedChange={event => setValue(event.detail.value)}
          onPreferencesChange={() => {}}
          loading={loading}
          i18nStrings={i18nStrings}
          editorContentHeight={10}
          onEditorContentResize={() => {}}
          id={'editor-minheight'}
        />
      </ScreenshotArea>
    </article>
  );
}
