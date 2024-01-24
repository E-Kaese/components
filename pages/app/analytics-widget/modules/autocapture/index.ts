// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AnalyticsModule } from '../../types';
import { buildAwsuiNodeTree, getComponentName } from './helpers';

type EventHandler = (event: Event) => void;

const autoCaptureEvents = [];

const debouncedHandler = (handler: EventHandler, timeOutInMs: number) => {
  let timer: ReturnType<typeof setTimeout>;
  return (event: Event) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      handler(event);
    }, timeOutInMs);
  };
};

const collectAwsuiNodeData = (event: Event) => {
  const componentName = getComponentName(event.target as HTMLElement);
  const awsuiNodeTree = buildAwsuiNodeTree(event.target as HTMLElement, []).map(node => node.__awsuiMetadata__?.name);

  return { componentName, awsuiNodeTree };
};

const listeners = [
  {
    eventName: 'mousedown',
    handler: (event: Event) => {
      const { componentName, awsuiNodeTree } = collectAwsuiNodeData(event);
      autoCaptureEvents.push({ type: 'mousedown', componentName, awsuiNodeTree, event });
    },
  },
  {
    eventName: 'click',
    handler: (event: Event) => {
      const { componentName, awsuiNodeTree } = collectAwsuiNodeData(event);
      console.log('click', componentName, awsuiNodeTree, event);
    },
  },
  {
    eventName: 'scroll',
    handler: debouncedHandler((event: Event) => {
      const { componentName, awsuiNodeTree } = collectAwsuiNodeData(event);
      autoCaptureEvents.push({ type: 'scroll', componentName, awsuiNodeTree, event });
    }, 250),
  },
  {
    eventName: 'change',
    handler: (event: Event) => {
      const { componentName, awsuiNodeTree } = collectAwsuiNodeData(event);
      console.log('change', componentName, awsuiNodeTree, event);
    },
  },
  {
    eventName: 'mouseup',
    handler: (event: Event) => {
      const { componentName, awsuiNodeTree } = collectAwsuiNodeData(event);
      console.log('mouseup', componentName, awsuiNodeTree, event);
    },
  },
  {
    eventName: 'mousemove',
    handler: debouncedHandler((event: Event) => {
      const { componentName, awsuiNodeTree } = collectAwsuiNodeData(event);
      autoCaptureEvents.push({ type: 'mousemove', componentName, awsuiNodeTree, event });
    }, 250),
  },
];

class AutocaptureAnalyticsModule implements AnalyticsModule {
  onRegister() {
    console.log('Autocapture module registered');
    listeners.forEach(listener => {
      document.addEventListener(listener.eventName, listener.handler);
    });
  }

  onUnregister() {
    console.log('Autocapture module unregistered');
    listeners.forEach(listener => {
      document.removeEventListener(listener.eventName, listener.handler);
    });
  }
}

export default new AutocaptureAnalyticsModule();
