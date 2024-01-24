// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: Apache-2.0

import { Handler } from '../../../types';
import { getFunnels } from '../funnel';

export const mount: Handler = () => {
  const funnels = getFunnels();
  for (const funnel of funnels) {
    funnel.start();
  }
};
