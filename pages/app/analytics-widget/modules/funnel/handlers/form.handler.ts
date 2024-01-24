// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Handler } from '../../../types';
import { isInComponent } from '../../../utils/browser';
import { getModalFunnelName, getSinglePageFunnelName } from '../../../utils/funnel';
import { createFunnel } from '../funnel';
import { getFunnelFromParentNode } from '../helpers';

export const mount: Handler = (event, domSnapshot) => {
  const isInModal = isInComponent(event.target, 'Modal');
  const funnelType = isInModal ? 'modal' : 'single-page';
  const [funnelName, funnelNameSelector] = isInModal
    ? getModalFunnelName(domSnapshot)
    : getSinglePageFunnelName(event.target, domSnapshot);

  createFunnel(
    {
      funnelName: funnelName || 'Unknown funnel',
      funnelType,
      initialStepNumber: '1',
      steps: [{ stepName: funnelName || 'Unknown step', stepNumber: '1', isOptional: false, substeps: [] }],
      optionalSteps: [],
      selectors: {
        funnelName: funnelNameSelector!,
      },
    },
    event.target
  );
};

export const unmount: Handler = (event, domSnapshot) => {
  const funnel = getFunnelFromParentNode(event.target, domSnapshot);
  if (!funnel) {
    console.warn('Could not find funnel for form unmount');
    return;
  }

  funnel.complete();
};

export const error: Handler = (event, domSnapshot) => {
  const funnel = getFunnelFromParentNode(event.target, domSnapshot);
  if (!funnel) {
    console.warn('Could not find funnel for form unmount');
    return;
  }

  const errorText = (event.detail as any).errorText;
  funnel.activeStep?.error(errorText);
  funnel.error(errorText);
};

export const submit: Handler = (event, domSnapshot) => {
  const funnel = getFunnelFromParentNode(event.target, domSnapshot);
  if (!funnel) {
    console.warn('Could not find funnel for form unmount');
    return;
  }

  funnel.submit();
};
