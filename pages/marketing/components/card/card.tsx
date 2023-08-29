// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React, { ReactElement } from 'react';
import Box from '~components/box';
import Icon from '~components/icon';
import SpaceBetween from '~components/space-between';

import styles from './styles.scss';
import Text from '../text/text';
import Badge from '../badge/badge';
import clsx from 'clsx';

interface CardProps {
  title: string;
  ctaLink: string;
  ctaLabel?: string;
  body?: string;
  badge?: string;
  color?: 'fushia' | 'teal';
}

export default function Card({ title, ctaLink, ctaLabel, body, badge, color = 'teal' }: CardProps): ReactElement {
  return (
    <a className={clsx(styles['classic-card'], styles[`theme-${color}`])} href={ctaLink}>
      <div className={styles.header}>
        <SpaceBetween size="s">
          {badge && <Badge text={badge} variant="fushia" />}
          <Text type="title" size={2} tag="h3">
            {title}
          </Text>
        </SpaceBetween>
      </div>

      {body && (
        <Box variant="p" color="text-body-secondary" padding={{ vertical: 'm' }}>
          {body}
        </Box>
      )}

      <div className={styles.footer}>
        <SpaceBetween direction="horizontal" size="xs">
          {ctaLabel && (
            <Text type="subheading" size={2}>
              {ctaLabel}
            </Text>
          )}
          <Text type="subheading" size={2}>
            <Icon name="arrow-left" className={styles.icon} />
          </Text>
        </SpaceBetween>
      </div>
    </a>
  );
}
