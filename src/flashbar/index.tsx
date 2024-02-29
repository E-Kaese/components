// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import { applyDisplayName } from '../internal/utils/apply-display-name';
import { FlashbarProps } from './interfaces';
import CollapsibleFlashbar from './collapsible-flashbar';
import NonCollapsibleFlashbar from './non-collapsible-flashbar';

export { FlashbarProps };

export default function Flashbar(props: FlashbarProps) {
  return props.stackItems ? <CollapsibleFlashbar {...props} /> : <NonCollapsibleFlashbar {...props} />;
}

applyDisplayName(Flashbar, 'Flashbar');
