// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React, { useState } from 'react';
import CodeEditor from '~components/code-editor';
import { i18nStrings } from './base-props';
import { useAce } from './ace-loader';

import 'ace-builds/css/ace.css';
import 'ace-builds/css/theme/dawn.css';
import 'ace-builds/css/theme/tomorrow_night_bright.css';
import Box from '~components/box';

import { sayHelloSample } from './code-samples';

export default function () {
  const [value, setValue] = useState(sayHelloSample);
  const { ace, loading } = useAce();

  return (
    <article>
      <Box padding="m">
        <h1>Code Editor - Vertical scroll</h1>
        <div style={{ height: 600 }}>
          <p>Scroll the page below to see the code editor</p>
        </div>
        <CodeEditor
          ace={ace}
          value={value}
          language="javascript"
          onDelayedChange={event => setValue(event.detail.value)}
          // not present in this demo
          onPreferencesChange={() => {}}
          loading={loading}
          i18nStrings={i18nStrings}
        />
        <div style={{ height: 400 }}>
          <p>Extra empty content</p>
        </div>
      </Box>
    </article>
  );
}
