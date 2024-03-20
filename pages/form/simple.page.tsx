// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React, { useState } from 'react';
import Header from '~components/header';
import AppLayout from '~components/app-layout';
import Form from '~components/form';
import Link from '~components/link';
import Button from '~components/button';
import FormField from '~components/form-field';
import Input from '~components/input';
import Select, { SelectProps } from '~components/select';
import SpaceBetween from '~components/space-between';
import Container from '~components/container';
import { range } from 'lodash';
import Tiles from '~components/tiles';
import Toggle from '~components/toggle';
import labels from '../app-layout/utils/labels';

const options: SelectProps['options'] = range(100).map(i => ({
  label: `item ${i}`,
  value: i.toString(),
}));

export default function FormScenario() {
  const [value, setValue] = useState<string>('bar');
  const [selectedOption, setSelectedOption] = useState<SelectProps['selectedOption']>(null);
  const [showSelect, setShowSelect] = useState(false);

  return (
    <AppLayout
      ariaLabels={labels}
      contentType="form"
      toolsHide={true}
      navigationHide={true}
      content={
        <Form
          header={
            <Header
              variant="h1"
              description="You can find more examples in Form field documentation page"
              info={<Link variant="info">Info</Link>}
            >
              Form header
            </Header>
          }
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link">Cancel</Button>
              <Button variant="primary">Submit</Button>
            </SpaceBetween>
          }
          errorText="This is an error!"
          errorIconAriaLabel="Error"
        >
          <SpaceBetween direction="vertical" size="l">
            <Container header={<Header variant="h2">Form section header 1</Header>}>
              <SpaceBetween direction="vertical" size="l">
                <FormField label="First field">
                  <Input value="" readOnly={true} />
                </FormField>
                <FormField label="Second field">
                  <Input value="" readOnly={true} />
                </FormField>
                <FormField label="First field">
                  <Input value="" readOnly={true} />
                </FormField>
                <FormField label="Second field">
                  <Input value="" readOnly={true} />
                </FormField>
                <FormField label="First field">
                  <Input value="" readOnly={true} />
                </FormField>
                <FormField label="Second field">
                  <Input value="" readOnly={true} />
                </FormField>
              </SpaceBetween>
            </Container>
            <Container header={<Header variant="h2">Form section header 2</Header>}>
              <SpaceBetween direction="vertical" size="l">
                <FormField label="First field">
                  <Input value="" readOnly={true} />
                </FormField>
                <FormField label="Second field">
                  <Input value="" readOnly={true} />
                </FormField>
                <FormField label="Some tiles">
                  <Tiles
                    value={value}
                    onChange={event => setValue(event.detail.value)}
                    columns={3}
                    items={[
                      { label: 'Foo', value: 'foo' },
                      { label: 'Bar', value: 'bar' },
                      { label: 'Baz', value: 'baz', disabled: true },
                      { label: 'Boo', value: 'boo' },
                    ]}
                  />
                </FormField>
                <FormField label="Third field">
                  <Input value="" readOnly={true} />
                </FormField>
              </SpaceBetween>
            </Container>
            <Container>
              <Toggle checked={showSelect} onChange={({ detail }) => setShowSelect(detail.checked)}>
                Change select
              </Toggle>
            </Container>
            {showSelect ? (
              <Container>
                <FormField label={'Select'}>
                  <Select
                    selectedOption={selectedOption}
                    // expandToViewport={true}
                    onChange={({ detail }) => setSelectedOption(detail.selectedOption)}
                    options={options}
                  />
                </FormField>
              </Container>
            ) : (
              <Container>
                <FormField label="First field">
                  <Input value="" readOnly={true} />
                </FormField>
                <FormField label="Second field">
                  <Input value="" readOnly={true} />
                </FormField>
                <FormField label="Some tiles">
                  <Tiles
                    value={value}
                    onChange={event => setValue(event.detail.value)}
                    columns={3}
                    items={[
                      { label: 'Foo', value: 'foo' },
                      { label: 'Bar', value: 'bar' },
                      { label: 'Baz', value: 'baz', disabled: true },
                      { label: 'Boo', value: 'boo' },
                    ]}
                  />
                </FormField>
                <FormField label="Third field">
                  <Input value="" readOnly={true} />
                </FormField>
                <FormField label="First field">
                  <Input value="" readOnly={true} />
                </FormField>
                <FormField label="Second field">
                  <Input value="" readOnly={true} />
                </FormField>
                <FormField label="First field">
                  <Input value="" readOnly={true} />
                </FormField>
                <FormField label="Second field">
                  <Input value="" readOnly={true} />
                </FormField>
                <FormField label="First field">
                  <Input value="" readOnly={true} />
                </FormField>
                <FormField label="Second field">
                  <Input value="" readOnly={true} />
                </FormField>
                <FormField label="First field">
                  <Input value="" readOnly={true} />
                </FormField>
                <FormField label="Second field">
                  <Input value="" readOnly={true} />
                </FormField>
                <FormField label="First field">
                  <Input value="" readOnly={true} />
                </FormField>
                <FormField label="Second field">
                  <Input value="" readOnly={true} />
                </FormField>
              </Container>
            )}
            <Container>
              <FormField label="Another">
                <Input value="" readOnly={true} />
              </FormField>
            </Container>
          </SpaceBetween>
        </Form>
      }
    />
  );
}
