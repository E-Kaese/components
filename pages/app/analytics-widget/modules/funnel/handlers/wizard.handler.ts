// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Handler } from '../../../types';
import { getMultiPageFunnelName } from '../../../utils/funnel';
import { createFunnel } from '../funnel';
import { getFunnelFromParentNode } from '../helpers';
import { FunnelStepConfig } from '../types';

export const mount: Handler = (event, domSnapshot) => {
  const [funnelName, funnelNameSelector] = getMultiPageFunnelName(domSnapshot);
  const { componentConfiguration } = event.detail;

  createFunnel(
    {
      funnelName: funnelName || 'Unknown funnel',
      funnelType: 'multi-page',
      initialStepNumber: `${componentConfiguration.activeStepIndex || 0 + 1}`,
      steps: componentConfiguration.steps.map((step: any, index: number) => ({
        stepName: step.title,
        stepNumber: (index + 1).toString(),
        isOptional: !!step.isOptional,
        substeps: {},
      })),
      optionalSteps: componentConfiguration.optionalSteps.map((step: number) => `${step}`),
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
    console.warn('Could not find funnel for wizard unmount');
    return;
  }

  funnel.complete();
};

export const stepNavigation: Handler = (event, domSnapshot) => {
  const funnel = getFunnelFromParentNode(event.target, domSnapshot);
  if (!funnel) {
    console.warn('Could not find funnel for wizard step navigation');
    return;
  }

  if (funnel.state === 'intitial') {
    return;
  }

  funnel.setActiveStep(`${event.detail.detail.destinationStepNumber}`);
};

export const cancel: Handler = (event, domSnapshot) => {
  const funnel = getFunnelFromParentNode(event.target, domSnapshot);
  if (!funnel) {
    console.warn('Could not find funnel for wizard step navigation');
    return;
  }

  funnel.complete();
};

export const stepMount: Handler = (event, domSnapshot) => {
  const funnel = getFunnelFromParentNode(event.target, domSnapshot);
  if (!funnel) {
    console.warn('Could not find funnel for wizard step navigation');
    return;
  }

  if (!funnel.activeStep) {
    console.warn('Could not find active step for wizard step navigation');
    return;
  }

  (event.target as any).__analytics__ = funnel.activeStep.config;
  event.target.setAttribute('data-awsui-funnel-step-number', `${funnel.activeStep.config.stepNumber}`);
};

export const propertyChange: Handler = (event, domSnapshot) => {
  const funnel = getFunnelFromParentNode(event.target, domSnapshot);
  if (!funnel) {
    console.warn('Could not find funnel for wizard step navigation');
    return;
  }

  const { steps } = event.detail.detail;
  if (steps) {
    const stepConfigs: FunnelStepConfig[] = (steps as { title: string; isOptional?: boolean }[]).map((step, index) => ({
      isOptional: !!step.isOptional,
      stepName: step.title,
      stepNumber: `${index + 1}`,
      substeps: [], // TODO: How to get this?
    }));

    funnel.updateStepConfig(stepConfigs);
  }
};
