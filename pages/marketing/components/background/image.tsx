// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React, { ReactElement } from 'react';
import clsx from 'clsx';
import styles from './image.scss';
import '@cloudscape-design/global-styles/dark-mode-utils.css';

interface BackgroundImageComponent {
  image: string;
  imageAlt?: string;
  children?: JSX.Element;
}

export default function BackgroundImage({
  image,
  imageAlt = 'placeholder image',
  children,
}: BackgroundImageComponent): ReactElement {
  const backgroundImageLight = `linear-gradient(60deg, rgba(255, 255, 255, 0.60) 24.77%, rgba(255, 255, 255, 0.00) 60.71%), url(${image})`;
  const backgroundImageDark = `linear-gradient(60deg, rgba(0, 9, 22, 0.40) 0%, rgba(0, 9, 22, 0.00) 74.25%),
    url(${image})`;

  return (
    <>
      <div
        className={clsx(styles['card-background-image'], 'awsui-util-hide-in-dark-mode')}
        role="img"
        aria-label={imageAlt}
        style={{ backgroundImage: backgroundImageLight }}
      >
        {children}
      </div>
      <div
        className={clsx(styles['card-background-image'], 'awsui-util-show-in-dark-mode')}
        role="img"
        aria-label={imageAlt}
        style={{ backgroundImage: backgroundImageDark }}
      >
        {children}
      </div>
    </>
  );
}
