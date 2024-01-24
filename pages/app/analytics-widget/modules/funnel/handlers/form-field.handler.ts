// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Handler } from '../../../types';
import { getFunnelFromParentNode } from '../helpers';

export const error: Handler = (event, domSnapshot) => {
  const funnel = getFunnelFromParentNode(event.target, domSnapshot);
  if (!funnel) {
    console.warn('Could not find funnel for formfield error');
    return;
  }

  const { fieldLabel, fieldError } = event.detail.detail;
  funnel.activeStep?.activeSubstep?.error(fieldLabel, fieldError);

  console.log('funnelFieldError', fieldLabel, fieldError);
};

export const errorClear: Handler = (event, domSnapshot) => {
  const funnel = getFunnelFromParentNode(event.target, domSnapshot);
  if (!funnel) {
    console.warn('Could not find funnel for formfield error clear');
    return;
  }

  const { fieldLabel, fieldError } = event.detail.detail;
  funnel.activeStep?.activeSubstep?.clearError(fieldLabel, fieldError);

  console.log('funnelFieldErrorClear', fieldLabel);
};
