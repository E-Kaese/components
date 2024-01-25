// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Handler } from '../../../types';
import { getFunnelFromParentNode } from '../helpers';

export const click: Handler = (event, domSnapshot) => {
  const funnel = getFunnelFromParentNode(event.target, domSnapshot);
  if (!funnel) {
    return;
  }

  const { external, variant } = event.detail as any;
  if (external) {
    funnel.externalLinkInteraction();
    return;
  }

  if (variant === 'info') {
    funnel.infoLinkInteraction();
    return;
  }
};
