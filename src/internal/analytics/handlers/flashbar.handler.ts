// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { sendRenderMetric, sendToggleMetric } from '../../../flashbar/internal/analytics';
import { Handler } from '../interfaces';

export const mount: Handler = ({ detail }) => {
  if (!detail?.configuration.analytics) {
    return;
  }

  if (detail?.configuration.analytics.items?.length === 0) {
    return;
  }

  sendRenderMetric(detail?.configuration.analytics.items);
};

export const toggle: Handler = ({ detail }) => {
  if (!detail) {
    return;
  }

  sendToggleMetric(detail.numofItems, detail.expanded);
};
