// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Handler } from '../../../types';
import { getFunnelFromParentNode } from '../helpers';

export const propertyChange: Handler = (event, domSnapshot) => {
  const funnel = getFunnelFromParentNode(event.target, domSnapshot);
  if (!funnel) {
    return;
  }

  const { visible } = event.detail.detail;
  if (visible === true) {
    funnel.start();
  } else {
    funnel.complete();
  }
};

export const submit: Handler = (event, domSnapshot) => {
  const funnel = getFunnelFromParentNode(event.target, domSnapshot);
  if (!funnel) {
    return;
  }

  funnel.submit();
};
