// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React, { useState } from 'react';
import {
  Alert,
  AppLayout,
  Badge,
  Box,
  BreadcrumbGroup,
  Button,
  ColumnLayout,
  Container,
  ContentLayout,
  ExpandableSection,
  Form,
  FormField,
  Grid,
  Header,
  Input,
  Link,
  Select,
  SelectProps,
  SpaceBetween,
  Tabs,
  Tiles,
  Toggle,
} from '~components';

import { setFunnelMetrics } from '~components/internal/analytics';
import { MockedFunnelMetrics } from '../../mock-funnel';

setFunnelMetrics(MockedFunnelMetrics);

import awsLogo from './aws.svg';

const ValueWithLabel = ({ label, children }: { label: React.ReactNode; children: React.ReactNode }) => (
  <div>
    <Box variant="awsui-key-label">{label}</Box>
    <div>{children}</div>
  </div>
);

export default function EC2LaunchInstancePage() {
  const [numOfInstances, setNumOfInstances] = useState('1');
  const [selectedTabId, setSelectedTabId] = useState('quick-start');
  const [selectedOS, setSelectedOS] = useState('amazon-linux');
  const [selectedAmiOption, setSelectedAmOption] = useState<SelectProps['selectedOption']>({
    label: 'Amazon Linux 2023 AMI',
    value: 'al-2023',
    description: 'ami-0292a7daeeda6b851 (64-bit (x86), uefi-preferred) / ami-0ee4632a5e025f7fe (64-bit (Arm), uefi)',
    tags: ['Virtualization: hvm', 'ENA enabled: true', 'Root device type: ebs'],
    labelTag: 'Free tier eligible',
  });
  const [selectedArchitecture, setSelectedArchitecture] = useState<SelectProps['selectedOption']>({
    label: '64-bit (x86)',
    value: 'x86',
  });
  const [selectedInstanceTypeOption, setSelectedInstanceTypeOption] = useState<SelectProps['selectedOption']>({
    label: 'Option 1',
    value: '1',
  });

  return (
    <AppLayout
      contentType="default"
      toolsHide={true}
      navigationHide={true}
      breadcrumbs={
        <BreadcrumbGroup
          items={[
            { text: 'EC2', href: '#' },
            { text: 'Instances', href: '#instances' },
            {
              text: 'Launch an instance',
              href: '#instances/launch-instance',
            },
          ]}
          ariaLabel="Breadcrumbs"
        />
      }
      content={
        <ContentLayout
          header={
            <Header
              info={<Link variant="info">Info</Link>}
              description="Amazon EC2 allows you to create virtual machines, or instances, that run on the AWS Cloud. Quickly get started by following the simple steps below."
            >
              Launch an instance
            </Header>
          }
        >
          <Form>
            <Grid gridDefinition={[{ colspan: 8 }, { colspan: 4 }]}>
              <div>
                <Container
                  header={<Header info={<Link variant="info">Info</Link>}>Name and tags</Header>}
                  variant="stacked"
                >
                  <FormField label="Name">
                    <Input type="text" placeholder="e.g. My Web Server" value="" />
                  </FormField>
                </Container>
                <ExpandableSection
                  defaultExpanded={true}
                  variant="stacked"
                  headerText="Application and OS Images (Amazon Machine Image)"
                  headerInfo={<Link variant="info">Info</Link>}
                  headerDescription="An AMI is a template that contains the software configuration (operating system, application server, and applications) required to launch your instance. Search or Browse for AMIs if you don’t see what you are looking for below"
                >
                  <SpaceBetween size="m">
                    <Input
                      type="search"
                      placeholder="Search our full catalog including 1000s of application and OS images"
                      value=""
                    />
                    <Tabs
                      activeTabId={selectedTabId}
                      onChange={e => setSelectedTabId(e.detail.activeTabId)}
                      tabs={[
                        {
                          label: 'Recents',
                          id: 'recents',
                          content: 'First tab content area',
                        },
                        {
                          label: 'Quick Start',
                          id: 'quick-start',
                          content: (
                            <>
                              <SpaceBetween size="s">
                                <Tiles
                                  columns={4}
                                  onChange={({ detail }) => setSelectedOS(detail.value)}
                                  value={selectedOS}
                                  items={[
                                    {
                                      label: 'Amazon Linux',
                                      value: 'amazon-linux',
                                      image: <img height={64} src={awsLogo} alt="aws logo" />,
                                    },
                                    {
                                      label: 'macOS',
                                      value: 'mac-os',
                                      image: <img height={64} src={awsLogo} alt="aws logo" />,
                                    },
                                    {
                                      label: 'Ubuntu',
                                      value: 'ubuntu',
                                      image: <img height={64} src={awsLogo} alt="aws logo" />,
                                    },
                                    {
                                      label: 'Windows',
                                      value: 'windows',
                                      image: <img height={64} src={awsLogo} alt="aws logo" />,
                                    },
                                    {
                                      label: 'Red Hat',
                                      value: 'red-hat',
                                      image: <img height={64} src={awsLogo} alt="aws logo" />,
                                    },
                                    {
                                      label: 'SUSE Linux',
                                      value: 'suse',
                                      image: <img height={64} src={awsLogo} alt="aws logo" />,
                                    },
                                    {
                                      label: 'Debian',
                                      value: 'debian',
                                      image: <img height={64} src={awsLogo} alt="aws logo" />,
                                    },
                                  ]}
                                />
                                <FormField label="Amazon Machine Image (AMI)" stretch={true}>
                                  <Select
                                    selectedOption={selectedAmiOption}
                                    onChange={({ detail }) => setSelectedAmOption(detail.selectedOption)}
                                    options={[
                                      {
                                        label: 'Amazon Linux 2023 AMI',
                                        value: 'al-2023',
                                        description:
                                          'ami-0292a7daeeda6b851 (64-bit (x86), uefi-preferred) / ami-0ee4632a5e025f7fe (64-bit (Arm), uefi)',
                                        tags: ['Virtualization: hvm', 'ENA enabled: true', 'Root device type: ebs'],
                                        labelTag: 'Free tier eligible',
                                      },
                                    ]}
                                    triggerVariant="option"
                                  />
                                </FormField>
                                <FormField label="Description">
                                  {selectedAmiOption?.description ?? 'No description available'}
                                </FormField>
                                <ColumnLayout columns={4}>
                                  <FormField label="Architecture">
                                    <Select
                                      selectedOption={selectedArchitecture}
                                      onChange={({ detail }) => setSelectedArchitecture(detail.selectedOption)}
                                      options={[
                                        { label: '64-bit (x86)', value: 'x86' },
                                        { label: '64-bit (arm)', value: 'arm' },
                                      ]}
                                    />
                                  </FormField>
                                  <FormField label="Boot mode">uefi-preferred</FormField>
                                  <FormField label="AMI ID">ami-0292a7daeeda6b851</FormField>
                                  <FormField label=".">
                                    <Badge color="green">Verified provider</Badge>
                                  </FormField>
                                </ColumnLayout>
                              </SpaceBetween>
                            </>
                          ),
                        },
                      ]}
                    />
                  </SpaceBetween>
                </ExpandableSection>
                <ExpandableSection
                  defaultExpanded={true}
                  variant="stacked"
                  headerText="Instance type"
                  headerInfo={<Link variant="info">Info</Link>}
                >
                  <FormField label="Instance type" secondaryControl={<Toggle checked={false}>All generations</Toggle>}>
                    <Select
                      selectedOption={selectedInstanceTypeOption}
                      onChange={({ detail }) => setSelectedInstanceTypeOption(detail.selectedOption)}
                      options={[
                        { label: 'Option 1', value: '1' },
                        { label: 'Option 2', value: '2' },
                        { label: 'Option 3', value: '3' },
                        { label: 'Option 4', value: '4' },
                        { label: 'Option 5', value: '5' },
                      ]}
                    />
                  </FormField>
                </ExpandableSection>
                <ExpandableSection
                  defaultExpanded={true}
                  variant="stacked"
                  headerText="Key pair (login)"
                  headerInfo={<Link variant="info">Info</Link>}
                >
                  <FormField label="Key pair name" secondaryControl={<Button iconName="refresh" />}>
                    <Select
                      selectedOption={selectedInstanceTypeOption}
                      onChange={({ detail }) => setSelectedInstanceTypeOption(detail.selectedOption)}
                      options={[
                        { label: 'Option 1', value: '1' },
                        { label: 'Option 2', value: '2' },
                        { label: 'Option 3', value: '3' },
                        { label: 'Option 4', value: '4' },
                        { label: 'Option 5', value: '5' },
                      ]}
                    />
                  </FormField>
                </ExpandableSection>
              </div>
              <div>
                <ExpandableSection defaultExpanded={true} variant="stacked" headerText="Summary">
                  <SpaceBetween size="s">
                    <FormField label="Number of instances" info={<Link variant="info">Info</Link>}>
                      <Input
                        type="number"
                        inputMode="numeric"
                        value={numOfInstances}
                        onChange={e => setNumOfInstances(e.detail.value)}
                      />
                    </FormField>
                    <ValueWithLabel label={<Link>Software Image (AMI)</Link>}>
                      Amazon Linux 2023 AMI 2023.3.20240117.0 x86_64 HVM kernel-6.1
                    </ValueWithLabel>
                    <ValueWithLabel label={<Link>Virtual server type (instance type)</Link>}>t2.micro</ValueWithLabel>
                    <ValueWithLabel label={<Link>Firewall (security group)</Link>}>New security group</ValueWithLabel>
                    <ValueWithLabel label={<Link>Storage (volumes)</Link>}>1 volume(s) - 8 GiB</ValueWithLabel>
                    <Alert statusIconAriaLabel="Info" header="Free tier">
                      In your first year includes 750 hours of t2.micro (or t3.micro in the Regions in which t2.micro is
                      unavailable) instance usage on free tier AMIs per month, 30 GiB of EBS storage, 2 million IOs, 1
                      GB of snapshots, and 100 GB of bandwidth to the internet.
                    </Alert>
                  </SpaceBetween>
                </ExpandableSection>
                <Container variant="stacked">
                  <Box float="right">
                    <SpaceBetween direction="horizontal" size="xs">
                      <Button>Cancel</Button>
                      <Button variant="primary">Launch instance</Button>
                    </SpaceBetween>
                  </Box>
                </Container>
              </div>
            </Grid>
          </Form>
        </ContentLayout>
      }
    />
  );
}
