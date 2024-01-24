// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import * as handlers from './handlers';
import { AnalyticsModule, BufferItem } from '../../types';
import { kebabCaseToCamelCase } from './helpers';

export const ROOT_COMPONENT = 'AppLayout';
export const SUBSTEP_COMPONENTS = ['Container', 'ExpandableSection'];

const EVENT_ORDER_PRIORITY: Record<string, number> = { AppLayout: 999, BreadcrumbGroup: 998, Form: 997, Wizard: 997 };

class FunnelAnalyticsModules implements AnalyticsModule {
  protected rootMounted = false;
  protected eventBuffer: BufferItem[] = [];

  onRegister() {
    console.log('Funnel module registered');
  }

  onUnregister() {
    console.log('Funnel module unregistered');
  }

  flushEventBuffer() {
    this.eventBuffer.sort((a: BufferItem, b: BufferItem) => {
      const indexA = a.event.eventName === 'mount' ? EVENT_ORDER_PRIORITY[a.event.detail.componentName] || 0 : 0;
      const indexB = b.event.eventName === 'mount' ? EVENT_ORDER_PRIORITY[b.event.detail.componentName] || 0 : 0;
      return indexB - indexA;
    });

    while (this.eventBuffer.length > 0) {
      const item = this.eventBuffer.shift();
      if (!item) {
        break;
      }

      const { event, domSnapshot } = item;
      this.trackEvent(event.target, event.eventName, event.detail, domSnapshot);
    }
  }

  trackEvent(
    target: HTMLElement,
    eventNameKebabCase: string,
    detail: { componentName: string },
    domSnapshot?: HTMLElement
  ) {
    const eventName = kebabCaseToCamelCase(eventNameKebabCase);

    if (!this.rootMounted) {
      this.eventBuffer.push({ event: { target, eventName, detail }, domSnapshot });

      if (eventName === 'mount' && detail.componentName === ROOT_COMPONENT) {
        this.rootMounted = true;
        this.flushEventBuffer();
        const rootMountHandler = handlers[ROOT_COMPONENT];
        if (rootMountHandler) {
          rootMountHandler.mount({ target, eventName, detail }, domSnapshot);
        }
      }

      return;
    }

    const componentHandlers = (handlers as any)[detail.componentName] || handlers.fallback;
    if (componentHandlers) {
      const specificHandler = componentHandlers[eventName] || (handlers.fallback as any)[eventName];
      if (specificHandler) {
        specificHandler({ target, eventName, detail }, domSnapshot);
      } else {
        console.warn(`Handler for event '${eventName}' not found in '${detail.componentName}' handlers.`);
      }
    }
  }
}

export default new FunnelAnalyticsModules();
