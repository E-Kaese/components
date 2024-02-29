// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import { render } from '@testing-library/react';

import FormField from '../../../lib/components/form-field';
import ExpandableSection from '../../../lib/components/expandable-section';

describe('FormField Analytics', () => {
  beforeEach(() => {
    // These numbers were chosen at random
    jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      width: 300,
      height: 200,
      x: 30,
      y: 50,
      left: 30,
      top: 50,
      bottom: 100,
      right: 400,
      toJSON: () => '',
    });
  });

  test('sends funnelSubStepError metric when errorText is present', () => {
    render(<FormField label="Label" errorText="Error" />);
  });

  test('sends a funnelSubStepError metric when there is an error and the errorText is changed', () => {
    const { rerender } = render(<FormField errorText="Error" label="Label" />);
    rerender(<FormField errorText="New Error" label="Label" />);
  });

  test('does not send a funnelSubStepError metric when hidden', () => {
    jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      bottom: 0,
      right: 0,
      toJSON: () => '',
    });

    render(
      <ExpandableSection expanded={false} onChange={() => {}}>
        <FormField errorText="Error" />
      </ExpandableSection>
    );
  });

  test('does not send a funnelSubStepError metric when there is no error', () => {
    render(<FormField label="Label" />);
  });

  test('does not send a funnelSubStepError metric when the errorText is removed', () => {
    const { rerender } = render(<FormField errorText="Error" label="Label" />);

    rerender(<FormField label="Label" />);
  });

  test('adds data-analytics attributes for label and error selectors', () => {
    const { getByTestId } = render(<FormField errorText="Error" label="Label" data-testid="form-field" />);

    const formField = getByTestId('form-field');
    expect(formField).toHaveAttribute('DATA_ATTR_FIELD_LABEL', expect.any(String));
    expect(formField).toHaveAttribute('DATA_ATTR_FIELD_ERROR', expect.any(String));
  });
});
