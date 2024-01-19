// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import InternalAlert from '~components/alert/internal';
import Badge from '~components/badge';
import Button from '~components/button';
import Container from '~components/container';
import Header from '~components/header';
import Icon from '~components/icon';
import Link from '~components/link';
import SpaceBetween from '~components/space-between';
import ScreenshotArea from '../utils/screenshot-area';

export default function GenAIComponents() {
  return (
    <article>
      <h1>Simple containers</h1>
      <ScreenshotArea>
        <SpaceBetween size="l">
          <InternalAlert header="AI Assistant">
            Here goes some information that was either produced by AI or part of an AI process.
          </InternalAlert>
          <SpaceBetween direction="horizontal" size="s">
            <Badge>Badge</Badge>
            <Badge>
              <Icon name="gen-ai" size="inherit" /> Badge
            </Badge>
          </SpaceBetween>

          <SpaceBetween direction="horizontal" size="s">
            <Button variant="primary">Primary</Button>
            <Button>Normal</Button>
            <Button variant="link">Link</Button>
            <Button variant="inline-link">Inline link</Button>
          </SpaceBetween>

          <SpaceBetween direction="horizontal" size="s">
            <Button variant="primary" iconName="gen-ai">
              Primary
            </Button>
            <Button iconName="gen-ai">Normal</Button>
            <Button variant="link" iconName="gen-ai">
              Link
            </Button>
            <Button variant="inline-link" iconName="gen-ai">
              Inline link
            </Button>
          </SpaceBetween>

          <Container
            header={
              <Header variant="h2" info={<Link variant="info">Info</Link>}>
                Container
              </Header>
            }
          >
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Phasellus tincidunt suscipit varius. Nullam dui
            tortor, mollis vitae molestie sed, malesuada.Lorem ipsum dolor sit amet, consectetur adipiscing. Nullam dui
            tortor, mollis vitae molestie sed. Phasellus tincidunt suscipit varius.
          </Container>
        </SpaceBetween>
      </ScreenshotArea>
    </article>
  );
}
