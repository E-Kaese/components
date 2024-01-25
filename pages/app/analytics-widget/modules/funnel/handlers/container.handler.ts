// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Handler } from '../../../types';
import { getSubStepName } from '../../../utils/funnel';
import { getFunnelFromParentNode } from '../helpers';

export const mount: Handler = (event, domSnapshot) => {
  const funnel = getFunnelFromParentNode(event.target, domSnapshot);
  if (!funnel) {
    return;
  }

  const [substepName] = getSubStepName(event.target);

  if (!substepName) {
    return;
  }

  const substep = funnel.activeStep?.registerSubStep(event.target, substepName);

  if (!substep) {
    return;
  }

  (event.target as any).__analytics__ = substep.config;
  event.target.setAttribute('data-analytics-funnel-substep-number', substep.config.subStepNumber);
};

export const unmount: Handler = (event, domSnapshot) => {
  const funnel = getFunnelFromParentNode(event.target, domSnapshot);
  if (!funnel) {
    return;
  }

  funnel.activeStep?.unregisterSubStep(event.target);
};
