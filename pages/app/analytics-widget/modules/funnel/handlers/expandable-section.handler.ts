// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { BufferEvent, Handler } from '../../../types';
import { mount as containerMount, unmount as containerUnmount } from './container.handler';

const isContainerVariant = (event: BufferEvent) => {
  const variant = (event.target as any).__awsuiMetadata__.componentConfiguration.variant;
  return variant === 'container' || variant === 'stacked';
};

export const mount: Handler = (event, domSnapshot) => {
  if (!isContainerVariant(event)) {
    return;
  }

  return containerMount(event, domSnapshot);
};

export const unmount: Handler = (event, domSnapshot) => {
  if (!isContainerVariant(event)) {
    return;
  }

  return containerUnmount(event, domSnapshot);
};
