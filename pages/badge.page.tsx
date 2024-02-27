// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import * as React from 'react';
import ScreenshotArea from './utils/screenshot-area';

import Badge, { BadgeProps } from '~components/badge';
import createPermutations from './utils/permutations';
import PermutationsView from './utils/permutations-view';
import { Box } from '~components';
import { colorBackgroundDropdownItemHover } from '~design-tokens';

const permutations = createPermutations<BadgeProps>([
  {
    color: ['blue', 'grey', 'green', 'red'],
    children: [
      'ABC',
      'Badge With A Very Long Text',
      <>
        Badge with <strong>html</strong>
      </>,
    ],
  },
]);

const marketingPermutations = createPermutations<BadgeProps>([
  {
    color: ['grey', 'red'],
    children: [
      <>
        <Box padding={{ vertical: 'xxs' }} fontSize="body-m" color="inherit">
          Tag: I&#39;m a tag
        </Box>
      </>,
      <>
        <Box padding={{ vertical: 'xxs' }} fontSize="body-s" color="inherit">
          Tag: I&#39;m a tag
        </Box>
      </>,
    ],
  },
]);

export default function BadgePermutations() {
  return (
    <>
      <h1>Badge permutations</h1>
      <ScreenshotArea disableAnimations={true}>
        <>
          <PermutationsView permutations={permutations} render={permutation => <Badge {...permutation} />} />
          <div className="orion-context-badge" style={{ backgroundColor: colorBackgroundDropdownItemHover }}>
            <h2>Marketing</h2>
            <PermutationsView permutations={marketingPermutations} render={permutation => <Badge {...permutation} />} />
          </div>
        </>
      </ScreenshotArea>
    </>
  );
}
