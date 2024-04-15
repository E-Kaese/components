// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import { AppLayoutInternalProps } from '../interfaces';
import { SkeletonLayout } from './layout';
import styles from './styles.css.js';

export function AppLayoutSkeleton({ content, ...rest }: AppLayoutInternalProps) {
  return <SkeletonLayout {...rest} content={<div className={styles.content}>{content}</div>} />;
}

// This renders toolbar experience
export function AppLayoutSkeletonToolbar(props: AppLayoutInternalProps) {
  // TODO: support navigationOpen/navigationHide/navigation resolution
  // TODO: same for tools(?)
  return <SkeletonLayout {...props} />;
}
