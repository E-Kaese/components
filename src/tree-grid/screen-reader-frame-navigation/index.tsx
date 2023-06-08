// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { useState } from 'react';

import styles from './styles.css.js';
import React from 'react';
import { useUniqueId } from '../../internal/hooks/use-unique-id';
import ScreenreaderOnly from '../../internal/components/screenreader-only';
import LiveRegion from '../../internal/components/live-region/index.js';

export function FrameAnnouncer({
  frameStart,
  frameSize,
  totalSize,
}: {
  frameStart: number;
  frameSize: number;
  totalSize: number;
}) {
  if (frameSize >= totalSize) {
    return null;
  }
  const message = `Showing items ${frameStart + 1} - ${frameStart + frameSize} of ${totalSize}`;
  return <LiveRegion>{message}</LiveRegion>;
}

export function FrameNavigation({
  previousFrameDisabled,
  previousFrameLabel,
  nextFrameDisabled,
  nextFrameLabel,
  ariaDescription,
  onPreviousFrame,
  onNextFrame,
}: {
  previousFrameDisabled?: boolean;
  previousFrameLabel: string;
  nextFrameDisabled?: boolean;
  nextFrameLabel?: string;
  ariaDescription?: string;
  onPreviousFrame: () => void;
  onNextFrame: () => void;
}) {
  const [isNavigationFocused, setIsNavigationFocused] = useState(false);
  const className = isNavigationFocused
    ? styles['screen-reader-navigation-visible']
    : styles['screen-reader-navigation-hidden'];

  const groupId = useUniqueId('frame-nav-group');
  const descriptionId = useUniqueId('frame-nav-description');

  return (
    <div
      role="navigation"
      aria-labelledby={groupId}
      aria-describedby={ariaDescription ? descriptionId : undefined}
      className={className}
    >
      <div role="group" id={groupId}>
        <button
          tabIndex={-1}
          onFocus={() => setIsNavigationFocused(true)}
          onBlur={() => setIsNavigationFocused(false)}
          onClick={onPreviousFrame}
          disabled={previousFrameDisabled}
        >
          {previousFrameLabel}
        </button>
        <button
          tabIndex={-1}
          onFocus={() => setIsNavigationFocused(true)}
          onBlur={() => setIsNavigationFocused(false)}
          onClick={onNextFrame}
          disabled={nextFrameDisabled}
        >
          {nextFrameLabel}
        </button>
      </div>

      {ariaDescription && <ScreenreaderOnly id={descriptionId}>{ariaDescription}</ScreenreaderOnly>}
    </div>
  );
}
