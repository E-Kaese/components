// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { FunnelMetrics } from '~components/internal/analytics';
import {
  FunnelStartProps,
  FunnelStepCompleteProps,
  FunnelStepErrorProps,
  FunnelStepStartProps,
  FunnelSubStepProps,
} from '~components/internal/analytics/interfaces';
import { PACKAGE_VERSION, THEME } from '~components/internal/environment';

import { FunnelConfig, FunnelStepConfig, FunnelSubStepConfig } from './types';

class FunnelSubstep {
  private state: 'intitial' | 'started' | 'completed' | 'error' = 'intitial';
  private errors: string[] = [];

  constructor(private scope: Funnel, public config: FunnelSubStepConfig) {}

  start() {
    this.state = 'started';
    const funnelSubstepProps = this._getFunnelMetricsProps();
    FunnelMetrics.funnelSubStepStart(funnelSubstepProps);
    console.log('funnelSubStepStart', funnelSubstepProps);
  }

  complete() {
    this.state = 'completed';
    const funnelSubstepProps = this._getFunnelMetricsProps();
    FunnelMetrics.funnelSubStepComplete(funnelSubstepProps);
    console.log('funnelSubStepComplete', funnelSubstepProps);
  }

  error(fieldLabel: string, fieldError: string) {
    this.errors.push(fieldLabel);

    if (this.state === 'error' || this.scope.state === 'submitting') {
      return;
    }

    this.state = 'error';
    const funnelSubstepProps = this._getFunnelMetricsProps();
    FunnelMetrics.funnelSubStepError({ ...funnelSubstepProps, additional: { fieldLabel, fieldError } } as any);
    console.log('funnelSubStepError', { ...funnelSubstepProps, additional: { fieldLabel, fieldError } });
  }

  clearError(fieldLabel: string, fieldError: string) {
    if (this.scope.state === 'submitting' || this.scope.state === 'error') {
      return;
    }

    const index = this.errors.indexOf(fieldLabel);
    if (index > -1) {
      this.errors.splice(index, 1);
    }

    if (this.errors.length > 0) {
      return;
    }

    this.state === 'started';
    const funnelSubstepProps = this._getFunnelMetricsProps();
    console.log('funnelSubStepErrorCleared', { ...funnelSubstepProps, additional: { fieldLabel, fieldError } });
  }

  _getFunnelMetricsProps() {
    const funnelSubstepProps: FunnelSubStepProps = {
      stepNameSelector: '',
      subStepNameSelector: '',
      subStepSelector: '',
      subStepAllSelector: '',
      funnelInteractionId: this.scope.interactionId!,
      stepNumber: parseInt(this.config.stepNumber),
      stepName: this.config.stepName,
      subStepNumber: parseInt(this.config.subStepNumber),
      subStepName: this.config.subStepName,
    };
    return funnelSubstepProps;
  }
}

class FunnelStep {
  private state: 'intitial' | 'started' | 'completed' | 'error' = 'intitial';
  private _substeps: FunnelSubstep[] = [];

  public substeps: WeakMap<HTMLElement, FunnelSubstep> = new WeakMap();
  public activeSubstep: FunnelSubstep | null = null;

  constructor(private scope: Funnel, public config: FunnelStepConfig) {}

  registerSubStep(element: HTMLElement, subStepName: string) {
    const subStepNumber = this._substeps.length + 1;
    const newSubstep = new FunnelSubstep(this.scope, {
      stepNumber: this.config.stepNumber,
      stepName: this.config.stepName,
      subStepName,
      subStepNumber: subStepNumber.toString(),
      element,
    });

    this._substeps.push(newSubstep);
    this.substeps.set(element, newSubstep);
  }

  unregisterSubStep(element: HTMLElement) {
    const substep = this.substeps.get(element);
    if (!substep) {
      return;
    }

    const index = this._substeps.indexOf(substep);
    if (index > -1) {
      this._substeps.splice(index, 1);
    }

    this.substeps.delete(element);
  }

  setActiveSubstep(substep: FunnelSubstep) {
    if (substep === this.activeSubstep) {
      return;
    }

    this.activeSubstep?.complete();
    this.activeSubstep = substep;
    this.activeSubstep.start();
  }

  start() {
    if (this.state === 'started') {
      return;
    }

    this.state = 'started';
    const funnelStepStartProps: FunnelStepStartProps = {
      funnelInteractionId: this.scope.interactionId!,
      stepNumber: parseInt(this.config.stepNumber),
      stepName: this.config.stepName,
      subStepConfiguration: this._substeps.map(substep => ({
        name: substep.config.subStepName,
        number: parseInt(substep.config.subStepNumber),
      })),
      totalSubSteps: Object.values(this._substeps).length,
      stepNameSelector: '',
      subStepAllSelector: '',
    };

    FunnelMetrics.funnelStepStart(funnelStepStartProps);
    console.log('funnelStepStart', funnelStepStartProps);
  }

  complete() {
    if (this.state === 'completed') {
      return;
    }

    this.activeSubstep?.complete();

    this.state = 'completed';
    const funnelStepComplete: FunnelStepCompleteProps = {
      funnelInteractionId: this.scope.interactionId!,
      stepNumber: parseInt(this.config.stepNumber),
      stepName: this.config.stepName,
      stepNameSelector: '',
      subStepAllSelector: '',
    };

    FunnelMetrics.funnelStepComplete(funnelStepComplete);
    console.log('funnelStepComplete', funnelStepComplete);
  }

  error(errorText: string) {
    if (this.state === 'error') {
      return;
    }

    this.state = 'error';
    const funnelStepError: FunnelStepErrorProps = {
      funnelInteractionId: this.scope.interactionId!,
      stepNumber: parseInt(this.config.stepNumber),
      stepName: this.config.stepName,
      stepNameSelector: '',
      subStepAllSelector: '',
      stepErrorSelector: '',
    };

    FunnelMetrics.funnelStepError({ ...funnelStepError, additional: { errorText } } as any);
    console.log('funnelStepError', { ...funnelStepError, additional: { errorText } } as any);
  }
}

class Funnel {
  private _version = '2.0';
  private _steps: Record<string, FunnelStep> = {};

  public interactionId: string | undefined;
  public state: 'intitial' | 'started' | 'submitting' | 'error' | 'completed' = 'intitial';
  public activeStep: FunnelStep | null = null;

  constructor(private config: FunnelConfig) {
    config.steps.forEach(step => {
      const funnelStep = new FunnelStep(this, step);
      this._steps[step.stepNumber] = funnelStep;
    });

    this.activeStep = this._steps[config.initialStepNumber] ?? null;
  }

  setActiveStep(stepNumber: string) {
    const newActiveStep = this._steps[stepNumber] ?? null;
    if (newActiveStep === this.activeStep) {
      return;
    }

    if (!newActiveStep) {
      console.error('Could not find step', stepNumber);
      return;
    }

    this.activeStep?.complete();
    this.activeStep = newActiveStep;
    this.activeStep.start();
  }

  updateStepConfig(stepConfigs: FunnelStepConfig[]) {
    this._steps = {};
    stepConfigs.forEach(stepConfig => {
      const funnelStep = new FunnelStep(this, stepConfig);
      this._steps[stepConfig.stepNumber] = funnelStep;
    });

    console.log('stepFunnelConfigurationChanged', stepConfigs);
  }

  start() {
    const funnelStartProps: FunnelStartProps = {
      funnelType: this.config.funnelType as any,
      funnelVersion: this._version,
      componentVersion: PACKAGE_VERSION,
      theme: THEME,
      funnelNameSelector: this.config.selectors.funnelName,
      optionalStepNumbers: this.config.optionalSteps.map(stepNumber => parseInt(stepNumber, 10)),
      totalFunnelSteps: this.config.steps.length,
      stepConfiguration: this.config.steps.map(step => ({
        name: step.stepName || '',
        number: parseInt(step.stepNumber),
        isOptional: step.isOptional,
      })),
    };

    this.interactionId = FunnelMetrics.funnelStart({ ...funnelStartProps, funnelName: this.config.funnelName } as any);
    this.state = 'started';
    console.log('funnelStart', funnelStartProps, this.interactionId);

    this.activeStep?.start();
  }

  complete() {
    if (!this.interactionId) {
      console.error('No interaction id for funnel to complete.');
      return;
    }

    this.activeStep?.complete();

    FunnelMetrics.funnelComplete({ funnelInteractionId: this.interactionId });
    console.log('funnelComplete', { funnelInteractionId: this.interactionId });

    if (this.state === 'submitting') {
      FunnelMetrics.funnelSuccessful({ funnelInteractionId: this.interactionId });
      console.log('funnelSuccessful', { funnelInteractionId: this.interactionId });
    } else {
      FunnelMetrics.funnelCancelled({ funnelInteractionId: this.interactionId });
      console.log('funnelCancelled', { funnelInteractionId: this.interactionId });
    }

    this.state = 'completed';
  }

  submit() {
    if (!this.interactionId) {
      console.error('No interaction id for funnel to complete.');
      return;
    }

    this.state = 'submitting';
    console.log('funnelSubmitting', { funnelInteractionId: this.interactionId });
  }

  error(errorText: string) {
    if (!this.interactionId) {
      console.error('No interaction id for funnel to complete.');
      return;
    }

    this.state = 'error';
    FunnelMetrics.funnelError({ funnelInteractionId: this.interactionId, additional: { errorText } } as any);
    console.log('funnelError', { funnelInteractionId: this.interactionId, additional: { errorText } });
  }
}

const funnels: Funnel[] = [];
const funnelElementMap = new WeakMap<HTMLElement, Funnel>();

export const createFunnel = (funnelConfig: FunnelConfig, rootElement: HTMLElement) => {
  const funnel = new Funnel(funnelConfig);
  funnels.push(funnel);
  funnelElementMap.set(rootElement, funnel);
  return funnel;
};

export const deleteFunnel = (rootElement: HTMLElement) => {
  const funnel = funnelElementMap.get(rootElement);
  if (!funnel) {
    return;
  }

  const index = funnels.indexOf(funnel);
  if (index > -1) {
    funnels.splice(index, 1);
  }
};

export const getFunnel = (rootElement: HTMLElement) => {
  return funnelElementMap.get(rootElement);
};

export const getFunnels = () => {
  return funnels;
};
