// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import debounce from '../../debounce';
import { sortByPriority } from '../helpers/utils';

// this code should not depend on React typings, because it is portable between major versions
interface RefShim<T> {
  current: T | null;
}

export interface AlertFlashContentContext {
  type: string;
  headerRef: RefShim<HTMLElement>;
  contentRef: RefShim<HTMLElement>;
  actionsRef: RefShim<HTMLElement>;
  signal: AbortSignal;
}

export interface AlertFlashContentConfig {
  id: string;
  orderPriority?: number;
  mountHeader?: (container: HTMLElement, context: AlertFlashContentContext) => boolean | Promise<boolean>;
  mountContent?: (container: HTMLElement, context: AlertFlashContentContext) => boolean | Promise<boolean>;
  unmountHeader?: (container: HTMLElement) => void;
  unmountContent?: (container: HTMLElement) => void;
}

export interface AlertFlashContentRegistrationListener {
  (providers: Array<AlertFlashContentConfig>): void | (() => void);
  cleanup?: void | (() => void);
}

export interface AlertFlashContentApiPublic {
  registerContent(config: AlertFlashContentConfig): void;
}

export interface AlertFlashContentApiInternal {
  clearRegisteredContent(): void;
  onContentRegistered(listener: AlertFlashContentRegistrationListener): () => void;
}

export class AlertFlashContentController {
  private listeners: Array<AlertFlashContentRegistrationListener> = [];
  private providers: Array<AlertFlashContentConfig> = [];

  private scheduleUpdate = debounce(() => {
    this.listeners.forEach(listener => {
      listener.cleanup = listener(this.providers);
    });
  }, 0);

  registerContent = (content: AlertFlashContentConfig) => {
    this.providers.push(content);
    this.providers = sortByPriority(this.providers);
    this.scheduleUpdate();
  };

  clearRegisteredContent = () => {
    this.providers = [];
  };

  onContentRegistered = (listener: AlertFlashContentRegistrationListener) => {
    this.listeners.push(listener);
    this.scheduleUpdate();
    return () => {
      listener.cleanup?.();
      this.listeners = this.listeners.filter(item => item !== listener);
    };
  };

  installPublic(api: Partial<AlertFlashContentApiPublic> = {}): AlertFlashContentApiPublic {
    api.registerContent ??= this.registerContent;
    return api as AlertFlashContentApiPublic;
  }

  installInternal(internalApi: Partial<AlertFlashContentApiInternal> = {}): AlertFlashContentApiInternal {
    internalApi.clearRegisteredContent ??= this.clearRegisteredContent;
    internalApi.onContentRegistered ??= this.onContentRegistered;
    return internalApi as AlertFlashContentApiInternal;
  }
}
