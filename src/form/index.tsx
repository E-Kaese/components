// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import { applyDisplayName } from '../internal/utils/apply-display-name';
import { FormProps } from './interfaces';
import InternalForm, { InternalFormProps } from './internal';
import useBaseComponent from '../internal/hooks/use-base-component';

import { AnalyticsFunnel, AnalyticsFunnelStep } from '../internal/analytics/components/analytics-funnel';
import { ButtonContext, ButtonContextProps } from '../internal/context/button-context';
import { useFunnel, useFunnelNameSelector, useFunnelStep } from '../internal/analytics/hooks/use-funnel';

import formStyles from './styles.css.js';
import headerStyles from '../header/styles.css.js';
import { trackEvent } from '@cloudscape-design/component-toolkit/internal';

export { FormProps };

const FormWithAnalytics = ({ variant = 'full-page', actions, ...props }: FormProps) => {
  const { funnelProps, funnelSubmit, funnelNextOrSubmitAttempt } = useFunnel();
  const { funnelStepProps } = useFunnelStep();

  const handleActionButtonClick: ButtonContextProps['onClick'] = ({ variant }) => {
    if (variant === 'primary') {
      funnelNextOrSubmitAttempt();
      funnelSubmit();

      if ((props as InternalFormProps).__internalRootRef) {
        trackEvent((props as InternalFormProps).__internalRootRef?.current as HTMLElement, 'submit', {
          componentName: 'Form',
        });
      }
    }
  };

  return (
    <ButtonContext.Provider value={{ onClick: handleActionButtonClick }}>
      <InternalForm variant={variant} actions={actions} {...props} {...funnelProps} {...funnelStepProps} />
    </ButtonContext.Provider>
  );
};

export default function Form({ variant = 'full-page', ...props }: FormProps) {
  const baseComponentProps = useBaseComponent('Form');
  const inheritedFunnelNameSelector = useFunnelNameSelector();
  const funnelNameSelector = inheritedFunnelNameSelector || `.${headerStyles['heading-text']}`;

  return (
    <AnalyticsFunnel
      funnelType="single-page"
      optionalStepNumbers={[]}
      totalFunnelSteps={1}
      funnelNameSelectors={[funnelNameSelector, `.${formStyles.header}`]}
    >
      <AnalyticsFunnelStep stepNumber={1}>
        <FormWithAnalytics variant={variant} {...props} {...baseComponentProps} />
      </AnalyticsFunnelStep>
    </AnalyticsFunnel>
  );
}

applyDisplayName(Form, 'Form');
