// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import Container from '~components/container';
import ScreenshotArea from '../utils/screenshot-area';

export default function SimpleContainers() {
  return (
    <article>
      <h1>Simple containers</h1>
      <ScreenshotArea>
        <div>
          <Container variant="stacked"> Content</Container>
          <Container variant="stacked"> Content</Container>
          <div></div>
        </div>
      </ScreenshotArea>
    </article>
  );
}
