// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React, { useState } from 'react';
import { render, unmountComponentAtNode } from 'react-dom';

import { Checkbox, TextContent } from '~components';
import Alert, { AlertProps } from '~components/alert';
import Button from '~components/button';
import awsuiPlugins from '~components/internal/plugins';

import createPermutations from '../utils/permutations';
import PermutationsView from '../utils/permutations-view';
import ScreenshotArea from '../utils/screenshot-area';

awsuiPlugins.alertContent.registerContent({
  id: 'awsui/alert-test-action',
  mountContent: (container, context) => {
    if (context.type === 'error' && context.contentRef.current?.textContent?.match('Access denied')) {
      render(
        <div>
          Access was denied
          <TextContent>
            <code>Some more details</code>
          </TextContent>
        </div>,
        container
      );
      return true;
    }
    return false;
  },
  mountHeader: (container, context) => {
    if (context.type === 'error' && context.contentRef.current?.textContent?.match('Access denied')) {
      render(<div>Access denied title</div>, container);
      return true;
    }
    return false;
  },
  unmountContent: container => unmountComponentAtNode(container),
  unmountHeader: () => {},
});

/* eslint-disable react/jsx-key */
const permutations = createPermutations<AlertProps>([
  {
    header: [null, 'Alert'],
    children: ['Content', 'There was an error: Access denied because of XYZ'],
    type: ['success', 'error'],
    action: [null, <Button>Action</Button>],
  },
]);
/* eslint-enable react/jsx-key */

export default function () {
  const [loading, setLoading] = useState(true);
  return (
    <>
      <h1>Alert runtime actions</h1>
      <Checkbox onChange={e => setLoading(e.detail.checked)} checked={loading}>
        Loading
      </Checkbox>
      <ScreenshotArea>
        <PermutationsView
          permutations={permutations}
          render={permutation => (
            <>
              <Alert statusIconAriaLabel={permutation.type} dismissAriaLabel="Dismiss" {...permutation} />
              <Alert statusIconAriaLabel={permutation.type} dismissAriaLabel="Dismiss" {...permutation}>
                {loading ? 'Loading' : permutation.children}
              </Alert>
            </>
          )}
        />
      </ScreenshotArea>
    </>
  );
}
