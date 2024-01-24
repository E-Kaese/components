// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Handler } from '../../../types';
import { getFunnels } from '../funnel';
import { getFunnelFromParentNode, getFunnelSubstepForElement } from '../helpers';

export const mount: Handler = () => {};
export const unmount: Handler = () => {};
export const click: Handler = () => {};

export const focus: Handler = (event, domSnapshot) => {
  const funnel = getFunnelFromParentNode(event.target, domSnapshot);
  if (!funnel) {
    // Focussed outside of a funnel. Complete all active substeps
    getFunnels().forEach(funnel => {
      funnel.activeStep?.activeSubstep?.complete();
    });

    return;
  }

  const substep = getFunnelSubstepForElement(event.target, domSnapshot);
  if (!substep) {
    console.warn('Could not find substep for element', event.target);
    return;
  }

  funnel.activeStep?.setActiveSubstep(substep);
};

export const blur: Handler = () => {};
