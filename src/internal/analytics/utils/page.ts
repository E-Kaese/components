// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export function getLastBreadcrumbText() {
  const breadcrumbs = document.querySelectorAll('[data-analytics-selector="breadcrumb-item"]');
  if (breadcrumbs.length === 0) {
    return '';
  }

  return breadcrumbs[breadcrumbs.length - 1].textContent;
}

/**
 * Calculate the name for a given Form
 * 1. Check for Form Header Component
 * 2. Check for Form Header Slot
 */
export function getFormHeaderText() {
  const formHeader = document.querySelector('[data-analytics-selector="form-header"]');
  const formHeaderSlot = formHeader?.querySelector('h1');
  if (formHeaderSlot) {
    return formHeaderSlot.textContent;
  }

  return formHeader?.textContent;
}

export function getModalHeaderText() {
  const modalHeader = document.querySelector('[data-analytics-selector="modal-header"]');
  return modalHeader?.textContent;
}

export function getContainerHeaderText(target: HTMLElement) {
  const containerHeader = target.querySelector('[data-analytics-selector="container-header"]');
  const containerHeaderSlot = containerHeader?.querySelector('h2');
  if (containerHeaderSlot) {
    return containerHeaderSlot.textContent;
  }

  return containerHeader?.textContent;
}
