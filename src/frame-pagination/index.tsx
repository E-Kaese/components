// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import { applyDisplayName } from '../internal/utils/apply-display-name';
import useBaseComponent from '../internal/hooks/use-base-component';
import { FramePaginationProps } from './interfaces';
import InternalFramePagination from './internal';

export { FramePaginationProps };

export default function FramePagination(props: FramePaginationProps) {
  const baseComponentProps = useBaseComponent('FramePagination');
  return <InternalFramePagination {...props} {...baseComponentProps} />;
}

applyDisplayName(FramePagination, 'FramePagination');
