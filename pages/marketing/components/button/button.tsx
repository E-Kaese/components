// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React, { ReactElement } from 'react';
import clsx from 'clsx';
import Box from '~components/box';
import Icon from '~components/icon';
import CloudscapeButton, { ButtonProps as CloudscapeButtonProps } from '~components/button';
import styles from './styles.scss';

type ButtonProps = CloudscapeButtonProps & {
  __showIcon?: boolean;
};

export default function Button({ __showIcon = false, ...props }: ButtonProps): ReactElement {
  return (
    <span className={clsx(styles[`custom-shadow-${props.variant}`], props.disabled && styles.disabled)}>
      <CloudscapeButton {...props}>
        <Box color="inherit">
          {props.children}
          {__showIcon && (
            <span className={clsx(styles['button-icon-wrapper'])}>
              <Icon name="angle-right" />
            </span>
          )}
        </Box>
      </CloudscapeButton>
    </span>
  );
}
