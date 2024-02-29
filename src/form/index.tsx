// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import { applyDisplayName } from '../internal/utils/apply-display-name';
import { FormProps } from './interfaces';
import InternalForm from './internal';
import useBaseComponent from '../internal/hooks/use-base-component';

import { ButtonContext, ButtonContextProps } from '../internal/context/button-context';
import { trackEvent } from '../internal/analytics';

export { FormProps };

export default function Form({ variant = 'full-page', ...props }: FormProps) {
  const baseComponentProps = useBaseComponent('Form');

  const handleActionButtonClick: ButtonContextProps['onClick'] = ({ variant }) => {
    if (variant === 'primary') {
      if (baseComponentProps.__internalRootRef) {
        trackEvent(baseComponentProps.__internalRootRef.current as HTMLElement, 'submit', {
          componentName: 'Form',
        });
      }
    }
  };

  return (
    <ButtonContext.Provider value={{ onClick: handleActionButtonClick }}>
      <InternalForm variant={variant} {...props} {...baseComponentProps} />
    </ButtonContext.Provider>
  );
}

applyDisplayName(Form, 'Form');
