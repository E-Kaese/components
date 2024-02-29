// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import { applyDisplayName } from '../internal/utils/apply-display-name';
import { AlertProps } from './interfaces';
import InternalAlert from './internal';
import useBaseComponent from '../internal/hooks/use-base-component';

export { AlertProps };

const Alert = React.forwardRef(
  ({ type = 'info', visible = true, ...props }: AlertProps, ref: React.Ref<AlertProps.Ref>) => {
    const baseComponentProps = useBaseComponent<HTMLDivElement>('Alert', {
      props: { type, visible, dismissible: props.dismissible },
      analytics: { type },
    });

    return <InternalAlert type={type} visible={visible} {...props} {...baseComponentProps} ref={ref} />;
  }
);

applyDisplayName(Alert, 'Alert');
export default Alert;
