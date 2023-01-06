// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import Box from '~components/box';
import ListHorizontalItemHorizontal from './list-horizontal-item-horizontal';
import ListHoriztonalItemVertical from './list-horizontal-item-vertical';
import ListVerticallItemVertical from './list-vertical-item-vertical';
import ListVerticallItemHorizontal from './list-vertical-item-horizontal';
import ListWithColumnLayout from './list-with-column-layout';
import ScreenshotArea from '../utils/screenshot-area';
import SpaceBetween from '~components/space-between';

export default function DescriptionListPermutations() {
  return (
    <ScreenshotArea disableAnimations={true}>
      <SpaceBetween size="l">
        <Box variant="h1">Description List permutations</Box>
        <ListHoriztonalItemVertical />

        <div
          style={{
            display: 'grid',
            gap: '20px',
            gridAutoFlow: 'row',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          }}
        >
          <ListVerticallItemVertical />
          <ListVerticallItemHorizontal />
        </div>

        <ListHorizontalItemHorizontal />
        <ListWithColumnLayout />
      </SpaceBetween>
    </ScreenshotArea>
  );
}
