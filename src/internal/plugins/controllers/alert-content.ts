// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import debounce from '../../debounce';
import { sortByPriority } from '../helpers/utils';

// this code should not depend on React typings, because it is portable between major versions
interface RefShim<T> {
  current: T | null;
}

export interface AlertContentContext {
  type: string;
  headerRef: RefShim<HTMLElement>;
  contentRef: RefShim<HTMLElement>;
}

export interface AlertContentConfig {
  id: string;
  orderPriority?: number;
  mountHeader?: (container: HTMLElement, context: AlertContentContext) => boolean;
  mountContent?: (container: HTMLElement, context: AlertContentContext) => boolean;
  unmountHeader?: (container: HTMLElement) => void;
  unmountContent?: (container: HTMLElement) => void;
}

export type AlertContentRegistrationListener = (providers: Array<AlertContentConfig>) => void;

export interface AlertContentApiPublic {
  registerContent(config: AlertContentConfig): void;
}

export interface AlertContentApiInternal {
  clearRegisteredContent(): void;
  onContentRegistered(listener: AlertContentRegistrationListener): () => void;
}

export class AlertContentController {
  private listeners: Array<AlertContentRegistrationListener> = [];
  private providers: Array<AlertContentConfig> = [];

  private scheduleUpdate = debounce(() => {
    this.listeners.forEach(listener => listener(this.providers));
  }, 0);

  registerContent = (content: AlertContentConfig) => {
    this.providers.push(content);
    this.providers = sortByPriority(this.providers);
    this.scheduleUpdate();
  };

  clearRegisteredContent = () => {
    this.providers = [];
  };

  onContentRegistered = (listener: AlertContentRegistrationListener) => {
    this.listeners.push(listener);
    this.scheduleUpdate();
    return () => {
      this.listeners = this.listeners.filter(item => item !== listener);
    };
  };

  installPublic(api: Partial<AlertContentApiPublic> = {}): AlertContentApiPublic {
    api.registerContent ??= this.registerContent;
    return api as AlertContentApiPublic;
  }

  installInternal(internalApi: Partial<AlertContentApiInternal> = {}): AlertContentApiInternal {
    internalApi.clearRegisteredContent ??= this.clearRegisteredContent;
    internalApi.onContentRegistered ??= this.onContentRegistered;
    return internalApi as AlertContentApiInternal;
  }
}
