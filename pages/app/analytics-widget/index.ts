// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import funnelModule from './modules/funnel';
import autocaptureModule from './modules/autocapture';
import performanceModule from './modules/performance';

import { AnalyticsModule } from './types';

export default class AnalyticsWidget {
  protected initialized: boolean;
  protected modules: AnalyticsModule[];

  constructor() {
    this.initialized = false;
    this.modules = [funnelModule, autocaptureModule, performanceModule];
  }

  public trackEvent(target: HTMLElement, eventName: string, detail: any, domSnapshot?: HTMLElement) {
    for (const module of this.modules) {
      module.trackEvent && module.trackEvent(target, eventName, detail, domSnapshot);
    }
  }

  public flushBuffer() {
    const { analytics } = (window as any).__awsui__;

    while (analytics.eventBuffer.length > 0) {
      const item = analytics.eventBuffer.shift();
      if (!item) {
        continue;
      }

      const { event, domSnapshot } = item;
      this.trackEvent(event.target, event.eventName, event.detail, domSnapshot);
    }
  }

  public register() {
    for (const module of this.modules) {
      try {
        module.onRegister && module.onRegister();
      } catch (ex) {
        console.log('Unable to register module', module, ex);
      }
    }

    this.flushBuffer();
    this.initialized = true;
    const { analytics } = (window as any).__awsui__;
    analytics.trackEvent = this.trackEvent.bind(this);
  }

  public unregister() {
    for (const module of this.modules) {
      try {
        module.onUnregister && module.onUnregister();
      } catch (ex) {
        console.log('Unable to unregister module', module, ex);
      }
    }

    const { analytics } = (window as any).__awsui__;
    analytics.trackEvent = undefined;
    this.initialized = false;
  }
}
