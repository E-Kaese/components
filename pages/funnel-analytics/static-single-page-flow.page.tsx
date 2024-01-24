// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React, { useState } from 'react';
import {
  AppLayout,
  BreadcrumbGroup,
  Button,
  Container,
  Form,
  FormField,
  Header,
  Input,
  Link,
  Modal,
  Select,
  NonCancelableCustomEvent,
  S3ResourceSelector,
  S3ResourceSelectorProps,
  SpaceBetween,
  SelectProps,
  ExpandableSection,
  RadioGroup,
  Box,
} from '~components';

import { fetchBuckets, fetchObjects, fetchVersions } from '../s3-resource-selector/data/request';
import { i18nStrings } from '../s3-resource-selector/data/i18n-strings';
import { SelfDismissibleAlert, uriToConsoleUrl } from '../s3-resource-selector/shared';

import { setFunnelMetrics } from '~components/internal/analytics';
import { MockedFunnelMetrics } from './mock-funnel';

setFunnelMetrics(MockedFunnelMetrics);

export default function StaticSinglePageCreatePage() {
  const [mounted, setUnmounted] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [value, setValue] = useState('');
  const [value2, setValue2] = useState('');
  const [value3, setValue3] = useState('');
  const [value4, setValue4] = useState('');
  const [errorText, setErrorText] = useState('');
  const [validationError, setValidationError] = useState<string | undefined>();
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [resource, setResource] = useState<S3ResourceSelectorProps.Resource>({ uri: '' });
  const [selectedOption, setSelectedOption] = useState<SelectProps['selectedOption']>({
    label: 'Option 1',
    value: '1',
  });
  const [radioValue, setRadioValue] = React.useState('second');

  const [loading, setLoading] = useState(false);

  function wrapWithErrorHandler<T extends (...args: any[]) => Promise<unknown>>(callback: T): T {
    return ((...args) => {
      setFetchError(null);
      return callback(...args).catch(error => {
        setFetchError(error.message);
        throw error;
      });
    }) as T;
  }

  const s3ResourceSelectorProps: S3ResourceSelectorProps = {
    resource,
    viewHref: resource?.uri !== '' && !validationError ? uriToConsoleUrl(resource.uri) : '',
    alert: fetchError && (
      <SelfDismissibleAlert type="error" header="Data fetching error">
        {fetchError}
      </SelfDismissibleAlert>
    ),
    invalid: !!validationError,
    selectableItemsTypes: ['objects', 'versions'],
    bucketsVisibleColumns: ['CreationDate', 'Region', 'Name'],
    objectsIsItemDisabled: object => !!object.IsFolder,
    i18nStrings,
    fetchBuckets: wrapWithErrorHandler(fetchBuckets),
    fetchObjects: wrapWithErrorHandler(fetchObjects),
    fetchVersions: wrapWithErrorHandler(fetchVersions),
    onChange: ({ detail }: NonCancelableCustomEvent<S3ResourceSelectorProps.ChangeDetail>) => {
      setResource(detail.resource);
      setValidationError(detail.errorText);
    },
  };

  return (
    <AppLayout
      contentType="form"
      breadcrumbs={
        <BreadcrumbGroup
          items={[
            { text: 'System', href: '#' },
            { text: 'Components', href: '#components' },
            {
              text: 'Create Resource',
              href: '#components/breadcrumb-group',
            },
          ]}
          ariaLabel="Breadcrumbs"
        />
      }
      content={
        mounted && (
          <Form
            errorText={errorText}
            actions={
              <SpaceBetween size="xs" direction="horizontal">
                <Button data-testid="unmount" onClick={() => setUnmounted(false)}>
                  Unmount component
                </Button>
                <Button data-testid="embedded-form-modal" onClick={() => setModalVisible(true)}>
                  Open Modal
                </Button>
                {modalVisible && (
                  <Modal
                    header="Modal title"
                    visible={modalVisible}
                    onDismiss={() => setModalVisible(false)}
                    footer={
                      <Box float="right">
                        <SpaceBetween direction="horizontal" size="xs">
                          <Button
                            variant="link"
                            onClick={() => {
                              setModalVisible(false);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="primary"
                            onClick={() => {
                              setModalVisible(false);
                            }}
                          >
                            Submit Feedback
                          </Button>
                        </SpaceBetween>
                      </Box>
                    }
                  >
                    <Form>
                      <SpaceBetween size="m">
                        <FormField label="Modal input field">
                          <Input value={value3} onChange={event => setValue3(event.detail.value)} />
                        </FormField>
                        <FormField label="Modal input field 2">
                          <Input value={value4} onChange={event => setValue4(event.detail.value)} />
                        </FormField>
                      </SpaceBetween>
                    </Form>
                  </Modal>
                )}
                <Button data-testid="cancel" onClick={() => setUnmounted(false)}>
                  Cancel
                </Button>
                <Button
                  data-testid="submit"
                  variant="primary"
                  loading={loading}
                  onClick={() => {
                    setErrorText('');
                    setLoading(true);
                    setTimeout(() => {
                      if (value === 'error') {
                        setErrorText('There is an error');
                      } else {
                        setErrorText('');
                        setUnmounted(false);
                      }
                      setLoading(false);
                    }, 3000);
                  }}
                >
                  Submit
                </Button>
              </SpaceBetween>
            }
            header={
              <Header variant="h1" info={<Link>Info</Link>} description="Form header description">
                Form Header
              </Header>
            }
          >
            <SpaceBetween size="m">
              <Container
                header={
                  <Header variant="h2" description="Container 1 - description">
                    Container 1 - header
                  </Header>
                }
              >
                <SpaceBetween size="s">
                  <FormField
                    info={
                      <Link data-testid="external-link" external={true} href="#">
                        Learn more
                      </Link>
                    }
                    errorText={value === 'error' ? 'Trigger error' : ''}
                    label="Input field"
                  >
                    <Input
                      data-testid="field1"
                      value={value}
                      onChange={event => {
                        setValue(event.detail.value);
                      }}
                    />
                  </FormField>
                  <FormField errorText={value2 === 'error' ? 'Trigger error' : ''} label="Input field 2">
                    <Input
                      data-testid="field1"
                      value={value2}
                      onChange={event => {
                        setValue2(event.detail.value);
                      }}
                    />
                  </FormField>
                  <FormField
                    info={
                      <Link variant="info" href="#">
                        Info
                      </Link>
                    }
                    description="expandToViewport={true}"
                    label="Dropdown field"
                  >
                    <Select
                      selectedOption={selectedOption}
                      onChange={({ detail }) => setSelectedOption(detail.selectedOption)}
                      options={[
                        { label: 'Option 1', value: '1' },
                        { label: 'Option 2', value: '2' },
                        { label: 'Option 3', value: '3' },
                        { label: 'Option 4', value: '4' },
                        { label: 'Option 5', value: '5' },
                      ]}
                      expandToViewport={true}
                    />
                  </FormField>
                  <FormField label="Radiogroup field">
                    <RadioGroup
                      onChange={({ detail }) => setRadioValue(detail.value)}
                      value={radioValue}
                      items={[
                        { value: 'first', label: 'First choice' },
                        { value: 'second', label: 'Second choice' },
                        { value: 'third', label: 'Third choice' },
                      ]}
                    />
                  </FormField>
                </SpaceBetween>
              </Container>
              <ExpandableSection defaultExpanded={true} variant="container" headerText="Additional configuration">
                <FormField
                  info={
                    <Link data-testid="external-link" external={true} href="#">
                      Learn more
                    </Link>
                  }
                  label="Input field 2"
                >
                  <Input
                    value={value2}
                    onChange={event => {
                      setValue2(event.detail.value);
                    }}
                  />
                </FormField>
              </ExpandableSection>
              <Container
                header={
                  <Header variant="h2" description="Container 2 - description">
                    Container 2 - header
                  </Header>
                }
                footer={
                  <ExpandableSection headerText="Additional settings" variant="footer">
                    Place additional form fields here.
                  </ExpandableSection>
                }
              >
                <FormField
                  info={
                    <Link data-testid="info-link" variant="info">
                      Info
                    </Link>
                  }
                  label="Read audio files from S3"
                  description="Choose an audio file in Amazon S3. Amazon S3 is object storage built to store and retrieve data."
                  constraintText="Format: s3://bucket/prefix/object. For objects in a bucket with versioning enabled, you can choose the most recent or a previous version of the object."
                  errorText={validationError}
                  stretch={true}
                >
                  <S3ResourceSelector {...s3ResourceSelectorProps} />
                </FormField>
              </Container>
            </SpaceBetween>
          </Form>
        )
      }
    />
  );
}
