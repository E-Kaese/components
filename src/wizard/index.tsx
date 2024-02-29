// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import { getExternalProps } from '../internal/utils/external-props';
import { applyDisplayName } from '../internal/utils/apply-display-name';
import useBaseComponent from '../internal/hooks/use-base-component';

import InternalWizard from './internal';
import { WizardProps } from './interfaces';

function Wizard({ isLoadingNextStep = false, allowSkipTo = false, ...props }: WizardProps) {
  const stepConfiguration = (props.steps || []).map((step, index) => ({
    name: step.title,
    isOptional: !!step.isOptional,
    number: index + 1,
  }));

  const baseComponentProps = useBaseComponent('Wizard', {
    analytics: {
      stepConfiguration,
      activeStepIndex: props.activeStepIndex || 0,
    },
  });

  const externalProps = getExternalProps(props);

  return (
    <InternalWizard
      isLoadingNextStep={isLoadingNextStep}
      allowSkipTo={allowSkipTo}
      {...externalProps}
      {...baseComponentProps}
    />
  );
}

applyDisplayName(Wizard, 'Wizard');

export { WizardProps };
export default Wizard;
