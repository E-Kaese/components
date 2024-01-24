// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AnalyticsModule } from '../../types';

class PerformanceAnalyticsModules implements AnalyticsModule {
  onRegister() {
    console.log('Performance module registered');
  }

  onUnregister() {
    console.log('Performance module unregistered');
  }
}

export default new PerformanceAnalyticsModules();
