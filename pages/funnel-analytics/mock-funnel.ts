// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { IFunnelMetrics } from '~components/internal/analytics/interfaces';

const funnelMetricsLog: { action: string; resolvedProps?: any; props: any }[] = [];
(window as any).__awsuiFunnelMetrics__ = funnelMetricsLog;

export function generateUUID() {
  // Generate random bytes
  const cryptoObj = window.crypto; // for IE 11
  const randomBytes = new Uint8Array(16);
  cryptoObj.getRandomValues(randomBytes);

  // Set the version (4) and variant (8, 9, A, or B) bits
  randomBytes[6] = (randomBytes[6] & 0x0f) | 0x40; // version 4
  randomBytes[8] = (randomBytes[8] & 0x3f) | 0x80; // variant 8, 9, A, or B

  // Format the bytes as a UUID string
  const uuid = Array.from(randomBytes)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');

  // Insert the dashes at the appropriate positions
  return `${uuid.slice(0, 8)}-${uuid.slice(8, 12)}-${uuid.slice(12, 16)}-${uuid.slice(16, 20)}-${uuid.slice(20)}`;
}

export const MockedFunnelMetrics: IFunnelMetrics = {
  funnelStart(props): string {
    const funnelName = props.funnelNameSelector ? document.querySelector(props.funnelNameSelector)?.innerHTML : '';
    funnelMetricsLog.push({ action: 'funnelStart', props, resolvedProps: { funnelName } });
    return generateUUID();
  },

  funnelError(props): void {
    funnelMetricsLog.push({ action: 'funnelError', props });
  },

  funnelComplete(props): void {
    funnelMetricsLog.push({ action: 'funnelComplete', props });
  },

  funnelSuccessful(props): void {
    funnelMetricsLog.push({ action: 'funnelSuccessful', props });
  },

  funnelCancelled(props): void {
    funnelMetricsLog.push({ action: 'funnelCancelled', props });
  },

  funnelChange(props): void {
    funnelMetricsLog.push({ action: 'funnelChange', props });
  },

  funnelStepStart(props): void {
    const stepName = props.stepNameSelector ? document.querySelector(props.stepNameSelector)?.innerHTML : '';
    funnelMetricsLog.push({ action: 'funnelStepStart', props, resolvedProps: { stepName } });
  },

  funnelStepComplete(props): void {
    const stepName = props.stepNameSelector ? document.querySelector(props.stepNameSelector)?.innerHTML : '';
    funnelMetricsLog.push({ action: 'funnelStepComplete', props, resolvedProps: { stepName } });
  },

  funnelStepNavigation(props): void {
    const stepName = props.stepNameSelector ? document.querySelector(props.stepNameSelector)?.innerHTML : '';
    // const subStepAllElements = document.querySelectorAll(props.subStepAllSelector); // TODO: Does not work

    funnelMetricsLog.push({ action: 'funnelStepNavigation', props, resolvedProps: { stepName } });
  },

  funnelStepError(props): void {
    const stepName = props.stepNameSelector ? document.querySelector(props.stepNameSelector)?.innerHTML : '';
    funnelMetricsLog.push({ action: 'funnelStepError', props, resolvedProps: { stepName } });
  },

  funnelStepChange(props): void {
    const stepName = props.stepNameSelector ? document.querySelector(props.stepNameSelector)?.innerHTML : '';
    funnelMetricsLog.push({ action: 'funnelStepChange', props, resolvedProps: { stepName } });
  },

  funnelSubStepStart(props): void {
    const stepName = props.stepNameSelector ? document.querySelector(props.stepNameSelector)?.innerHTML : '';
    const subStepName = props.subStepNameSelector ? document.querySelector(props.subStepNameSelector)?.innerHTML : '';
    const subStepAllElements = props.subStepAllSelector ?? document.querySelectorAll(props.subStepAllSelector);
    const subStepElement = props.subStepSelector ?? document.querySelector(props.subStepSelector);

    funnelMetricsLog.push({
      action: 'funnelSubStepStart',
      props,
      resolvedProps: { stepName, subStepName, subStepAllElements, subStepElement },
    });
  },

  funnelSubStepComplete(props): void {
    const stepName = props.stepNameSelector ? document.querySelector(props.stepNameSelector)?.innerHTML : '';
    const subStepName = props.subStepNameSelector ? document.querySelector(props.subStepNameSelector)?.innerHTML : '';
    const subStepAllElements = props.subStepAllSelector ?? document.querySelectorAll(props.subStepAllSelector);
    const subStepElement = props.subStepSelector ?? document.querySelector(props.subStepSelector);

    funnelMetricsLog.push({
      action: 'funnelSubStepComplete',
      props,
      resolvedProps: { stepName, subStepName, subStepAllElements, subStepElement },
    });
  },

  funnelSubStepError(props): void {
    const stepName = props.stepNameSelector ? document.querySelector(props.stepNameSelector)?.innerHTML : '';
    const subStepName = props.subStepNameSelector ? document.querySelector(props.subStepNameSelector)?.innerHTML : '';
    const fieldLabel = props.fieldLabelSelector ? document.querySelector(props.fieldLabelSelector!)?.innerHTML : '';
    const fieldError = props.fieldErrorSelector ? document.querySelector(props.fieldErrorSelector!)?.innerHTML : '';

    funnelMetricsLog.push({
      action: 'funnelSubStepError',
      props,
      resolvedProps: { fieldLabel, fieldError, stepName, subStepName },
    });
  },

  helpPanelInteracted(props): void {
    const stepName = props.stepNameSelector ? document.querySelector(props.stepNameSelector)?.innerHTML : '';
    const subStepName = props.subStepNameSelector ? document.querySelector(props.subStepNameSelector)?.innerHTML : '';
    const subStepElement = props.subStepSelector ?? document.querySelectorAll(props.subStepSelector);
    const subStepAllElements = props.subStepAllSelector ?? document.querySelectorAll(props.subStepAllSelector);
    const element = props.elementSelector ?? document.querySelector(props.elementSelector);

    funnelMetricsLog.push({
      action: 'helpPanelInteracted',
      props,
      resolvedProps: { stepName, subStepName, subStepAllElements, element, subStepElement },
    });
  },

  externalLinkInteracted(props): void {
    const stepName = props.stepNameSelector ? document.querySelector(props.stepNameSelector)?.innerHTML : '';
    const subStepName = props.subStepNameSelector ? document.querySelector(props.subStepNameSelector)?.innerHTML : '';
    const subStepElement = props.subStepSelector ?? document.querySelectorAll(props.subStepSelector);
    const subStepAllElements = props.subStepAllSelector ?? document.querySelectorAll(props.subStepAllSelector);
    const element = props.elementSelector ?? document.querySelector(props.elementSelector);

    funnelMetricsLog.push({
      action: 'externalLinkInteracted',
      props,
      resolvedProps: { stepName, subStepName, subStepAllElements, element, subStepElement },
    });
  },
};
