// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React, { ReactElement } from 'react';
import CloudscapeBadge, { BadgeProps as CloudscapeBadgeProps } from '~components/badge';
import Box, { BoxProps } from '~components/box';

type BadgeProps = Omit<CloudscapeBadgeProps, 'color'> & {
  size?: 'medium' | 'small';
  variant?: 'grey' | 'fushia';
  text?: string;
};

export default function Badge({ size = 'medium', variant = 'fushia', text, ...props }: BadgeProps): ReactElement {
  const sizeMap: Record<string, BoxProps.FontSize> = {
    medium: 'body-m',
    small: 'body-s',
  };
  const colorMap: Record<string, CloudscapeBadgeProps['color']> = {
    grey: 'grey',
    fushia: 'red',
  };
  return (
    <div className="orion-context-badge">
      <CloudscapeBadge color={colorMap[variant]}>
        <Box padding={{ vertical: 'xxs' }} fontSize={sizeMap[size]} color="inherit">
          {props.children || text}
        </Box>
      </CloudscapeBadge>
    </div>
  );
}
