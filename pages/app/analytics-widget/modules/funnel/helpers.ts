// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { getParentFunnelNode } from '../../utils/browser';
import { getFunnel } from './funnel';

export const getFunnelFromParentNode = (element: HTMLElement, domSnapshot: Document | undefined) => {
  const parentFunnelNode = getParentFunnelNode(element, domSnapshot);
  if (!parentFunnelNode) {
    return null;
  }

  return getFunnel(parentFunnelNode);
};

export const getFunnelSubstepForElement = (element: HTMLElement, domSnapshot: Document | undefined) => {
  const parentContainer = element.closest('[data-analytics-funnel-substep-number]') as HTMLElement;

  if (!parentContainer) {
    return null;
  }

  const funnel = getFunnelFromParentNode(parentContainer, domSnapshot);
  if (!funnel || !funnel.activeStep) {
    return null;
  }

  return funnel.activeStep.substeps.get(parentContainer);
};

export const kebabCaseToCamelCase = (str: string) => {
  if (!str.includes('-')) {
    return str;
  }

  const camelCase = str
    .split('-')
    .map((word, index) => {
      // Capitalize all words except the first one
      if (index === 0) {
        return word.toLowerCase();
      }

      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join('');
  return camelCase;
};
