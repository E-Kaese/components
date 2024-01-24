// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import createWrapper from '~components/test-utils/selectors';

export function getLastBreadcrumbText(domSnapshot = document.body) {
  const breadcrumbLinksSelector = createWrapper('')
    .findAppLayout()
    .findBreadcrumbs()
    .findBreadcrumbGroup()
    .findBreadcrumbLinks()
    .toSelector();

  const breadcrumbLinks = domSnapshot.querySelectorAll(breadcrumbLinksSelector);
  const lastBreadcrumbLink = breadcrumbLinks[breadcrumbLinks.length - 1];
  return [lastBreadcrumbLink?.textContent, '[data-analytics-funnel-key="funnel-name"]'];
}

function getHeaderText(element: HTMLElement, parentWrapper = createWrapper('')) {
  const headerTextSelector = parentWrapper.findHeader().findHeadingText().toSelector();
  return [element.querySelector(headerTextSelector)?.textContent, headerTextSelector];
}

/**
 * Calculate the name for a given Form
 * 1. Check for Form Header Component
 * 2. Check for Form Header Slot
 */
export function getFormHeaderText(element: HTMLElement) {
  const formHeaderSlot = createWrapper('').findForm().findHeader();
  const [formHeaderText, formHeaderTextSelector] = getHeaderText(element, formHeaderSlot);

  if (formHeaderText) {
    return [formHeaderText, formHeaderTextSelector];
  }

  return [element.querySelector(formHeaderSlot.toSelector())?.textContent, formHeaderSlot.toSelector()];
}

export function getModalHeaderText(domSnapshot: HTMLElement) {
  const modalHeaderSlot = createWrapper('').findModal().findHeader();
  const [modalHeaderText, modalHeaderTextSelector] = getHeaderText(domSnapshot, modalHeaderSlot);

  if (modalHeaderText) {
    return [modalHeaderText, modalHeaderTextSelector];
  }

  return [domSnapshot.querySelector(modalHeaderSlot.toSelector())?.textContent, modalHeaderSlot.toSelector()];
}

export function getContainerHeaderText(element: HTMLElement) {
  const containerHeaderSlot = createWrapper('').findContainer().findHeader();
  const [containerHeaderText, containerHeaderTextSelector] = getHeaderText(element, containerHeaderSlot);

  if (containerHeaderText) {
    return [containerHeaderText, containerHeaderTextSelector];
  }

  return [element.querySelector(containerHeaderSlot.toSelector())?.textContent, containerHeaderSlot.toSelector()];
}
