// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React, { ReactElement } from 'react';
import Box from '~components/box';
import Icon from '~components/icon';
import SpaceBetween from '~components/space-between';

import styles from './styles.scss';
import Text from '../text/text';
import Badge from '../badge/badge';
import BackgroundImage from '../background/image';

import clsx from 'clsx';
import { Container } from '~components';

interface CardProps {
  title: string;
  ctaLink: string;
  ctaLabel?: string;
  body?: string;
  badge?: string;
  color?: 'fushia' | 'teal';
  image?: string;
  imageAlt?: string;
}

export default function Card({
  title,
  ctaLink,
  ctaLabel,
  body,
  badge,
  color = 'teal',
  image,
  imageAlt,
}: CardProps): ReactElement {
  const InnerContent = (
    <div data-type={image ? 'img' : 'classic'} className={clsx(styles['inner-content'])}>
      {badge && <Badge text={badge} variant={image ? 'grey' : color} />}
      <Text type="title" size={2} tag="h3">
        {title}
      </Text>

      {body && (
        <Box variant="p" color="text-body-secondary">
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
    </div>
  );
  return (
    <a data-type={image ? 'img' : 'classic'} className={clsx(styles.card, styles[`theme-${color}`])} href={ctaLink}>
      <Container fitHeight={true} disableContentPaddings={true}>
        {image ? (
          <BackgroundImage image={image} imageAlt={imageAlt}>
            {InnerContent}
          </BackgroundImage>
        ) : (
          InnerContent
        )}
      </Container>
    </a>
  );
}
