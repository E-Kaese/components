// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import { render } from '@testing-library/react';

import Alert from '../../../lib/components/alert';

describe('Alert Analytics', () => {
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

  test('sends funnelSubStepError metric when the alert is placed inside a substep', () => {
    render(<Alert type="error">This is the error text</Alert>);
  });

  test('sends funnelError metric when the alert is placed inside a step', () => {
    render(<Alert type="error">This is the error text</Alert>);
  });

  test('does not send any error metric when the alert is invisible', () => {
    render(
      <Alert type="error" visible={false}>
        This is the error text{' '}
      </Alert>
    );
  });

  test('does not send any error metrics for non-error alerts', () => {
    render(
      <>
        <Alert>Default</Alert>
        <Alert type="info">Info</Alert>
        <Alert type="success">Success</Alert>
        <Alert type="warning">Warning</Alert>
      </>
    );
  });

  test('sends a funnelSubStepError metric when there is an error and the user attempts to submit the form', () => {
    const { rerender } = render(<Alert type="error">This is the error text</Alert>);
    rerender(<Alert type="error">This is the error text</Alert>);
  });

  test('does not send any error metrics when outside of a funnel context', () => {
    render(<Alert type="error">This is the error text</Alert>);
  });

  test('does not send multiple funnelSubStepError metrics on rerender', () => {
    const { rerender } = render(<Alert type="error">This is the error text</Alert>);
    rerender(<Alert type="error">This is the error text</Alert>);
  });

  test('does not send multiple funnelError metrics on rerender', () => {
    const { rerender } = render(<Alert type="error">This is the error text</Alert>);
    rerender(<Alert type="error">This is the error text</Alert>);
  });
});
