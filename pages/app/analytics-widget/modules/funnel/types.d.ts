// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
export interface FunnelStepConfig {
  stepName: string;
  stepNumber: string;
  isOptional: boolean;
  substeps: FunnelSubStepConfig[];
}

export interface FunnelSubStepConfig {
  stepNumber: string;
  stepName: string;
  subStepName: string;
  subStepNumber: string;
  element: HTMLElement;
}

export type FunnelType = 'single-page' | 'multi-page' | 'modal' | undefined;
export type FunnelState = 'initial' | 'started' | 'completed' | 'submitting' | 'error';
export interface FunnelConfig {
  funnelName: string;
  funnelType: FunnelType;
  initialStepNumber: string;
  steps: FunnelStepConfig[];
  optionalSteps: string[];
  selectors: Record<string, string>;
}
