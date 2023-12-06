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
  const includeShadow = props.variant === 'primary' || props.variant === 'normal';
  return (
    <span className={clsx(includeShadow && styles['custom-shadow'], props.disabled && styles.disabled)}>
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
