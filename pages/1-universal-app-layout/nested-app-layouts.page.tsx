// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React, { useState } from 'react';
import {
  AppLayout,
  BreadcrumbGroup,
  Button,
  Container,
  ContentLayout,
  Flashbar,
  Header,
  Link,
  SpaceBetween,
} from '~components';

export default function EC2Dashboard() {
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [isToolsVisible, setIsToolsVisible] = useState(false);

  return (
    <AppLayout
      {...{
        hideToolbar: true,
        universalAppLayout: true,
      }}
      content={
        <AppLayout
          {...{
            hideToolbar: false,
            universalAppLayout: true,
          }}
          breadcrumbs={
            <BreadcrumbGroup
              items={[
                { text: 'EC2', href: '#' },
                { text: 'Dashboard', href: '#' },
              ]}
            />
          }
          content={
            <ContentLayout
              header={
                <SpaceBetween size="m">
                  <Header
                    actions={<Button variant="primary">Launch instance</Button>}
                    info={<Link>Info</Link>}
                    variant="h1"
                  >
                    EC2 Dashboard
                  </Header>
                </SpaceBetween>
              }
            >
              <SpaceBetween size="l">
                {[...Array(8)].map((_, index) => {
                  return (
                    <Container
                      key={index}
                      header={
                        <Header description="Viewing data from N. Virginia region" variant="h2">
                          Service overview
                        </Header>
                      }
                    />
                  );
                })}
              </SpaceBetween>
            </ContentLayout>
          }
          tools={isToolsVisible && <span>I'm in the child app layout!</span>}
          onToolsChange={() => setIsToolsVisible(!isToolsVisible)}
          onNavigationChange={() => setIsNavVisible(!isNavVisible)}
          notifications={
            <Flashbar
              items={[
                {
                  type: 'success',
                  header: 'Great notification message',
                  statusIconAriaLabel: 'success',
                },
                {
                  type: 'info',
                  header: 'Neat notification message',
                  statusIconAriaLabel: 'info',
                },
                {
                  type: 'warning',
                  header: 'Uh oh notification message',
                  statusIconAriaLabel: 'warning',
                },
                {
                  type: 'error',
                  header: 'Oops notification message',
                  statusIconAriaLabel: 'error',
                },
              ]}
            />
          }
        />
      }
      navigation={isNavVisible && <span>I'm in the parent app layout!</span>}
    />
  );
}
