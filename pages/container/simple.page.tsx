// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import Container from '~components/container';
import ScreenshotArea from '../utils/screenshot-area';
import { SpaceBetween } from '~components';

export default function SimpleContainers() {
  return (
    <article>
      <h1>Simple containers</h1>
      <ScreenshotArea>
        <SpaceBetween direction="vertical" size="m">
          <div>
            <Container variant="stacked">first container</Container>
            <Container variant="stacked">last container, with trailing div</Container>
            <div></div>
          </div>

          <div>
            <Container variant="stacked">first container</Container>
            <Container variant="stacked">last container, no trailing div</Container>
          </div>

          <div>
            <div></div>
            <Container variant="stacked">first container, with leading div</Container>
            <Container variant="stacked">container</Container>
            <Container variant="stacked">container</Container>
            <Container variant="stacked">last container, with trailing div</Container>
            <div></div>
          </div>
        </SpaceBetween>
      </ScreenshotArea>
    </article>
  );
}
