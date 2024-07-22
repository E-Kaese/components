// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';

import useBaseComponent from '../internal/hooks/use-base-component';
import { applyDisplayName } from '../internal/utils/apply-display-name';
import { RadioGroupProps } from './interfaces';
import InternalRadioGroup from './internal';

export { RadioGroupProps };

const RadioGroup = React.forwardRef((props: RadioGroupProps, ref: React.Ref<RadioGroupProps.Ref>) => {
  const baseComponentProps = useBaseComponent('RadioGroup');
  return <InternalRadioGroup ref={ref} {...props} {...baseComponentProps} />;
});

applyDisplayName(RadioGroup, 'RadioGroup');
export default RadioGroup;
