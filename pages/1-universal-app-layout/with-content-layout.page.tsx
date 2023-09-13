// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React, { useState } from 'react';
import { 
  Alert, 
  AppLayout,
  BreadcrumbGroup,
  Button, 
  Container,
  ContentLayout,
  Header,
  Link, 
  SpaceBetween
} from '~components';

export default function EC2Dashboard() {
  return (
    <AppLayout
      {...{ 
        universalAppLayout: true
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
            <SpaceBetween size='m'>
              <Header
                actions={
                  <Button variant='primary'>
                    Launch instance
                  </Button>
                }
                info={<Link>Info</Link>}
                variant='h1'
              >
                EC2 Dashboard
              </Header>
            </SpaceBetween>
          }
        >
          <Container
            header={
              <Header
                description='Viewing data from N. Virginia region'
                variant='h2'
              >
                Service overview
              </Header>
            }
          />
                    <Container
            header={
              <Header
                description='Viewing data from N. Virginia region'
                variant='h2'
              >
                Service overview
              </Header>
            }
          />
                    <Container
            header={
              <Header
                description='Viewing data from N. Virginia region'
                variant='h2'
              >
                Service overview
              </Header>
            }
          />
                    <Container
            header={
              <Header
                description='Viewing data from N. Virginia region'
                variant='h2'
              >
                Service overview
              </Header>
            }
          />
                    <Container
            header={
              <Header
                description='Viewing data from N. Virginia region'
                variant='h2'
              >
                Service overview
              </Header>
            }
          />
        </ContentLayout>
      }
    />
  );
}
