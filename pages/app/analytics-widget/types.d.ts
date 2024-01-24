// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
export interface BufferEvent {
  eventName: string;
  target: HTMLElement;
  detail: {
    componentName: string;
    props?: any;
    detail?: any;
    componentConfiguration?: any;
  };
}
export interface BufferItem {
  event: BufferEvent;
  domSnapshot?: HTMLElement;
}

export interface AnalyticsModule {
  onRegister?: () => void;
  onUnregister?: () => void;
  trackEvent?: (target: HTMLElement, eventName: string, detail: any, domSnapshot?: HTMLElement) => void;
}

export type Handler = (event: BufferEvent, domSnapshot?: HTMLElement) => void;
export interface Handlers {
  [key: string]: Handler;
}

export type CreateHandlersFactory = (handlers: Handlers) => Handler;
