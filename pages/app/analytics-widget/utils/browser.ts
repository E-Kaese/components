// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { type Fiber } from 'react-reconciler';

const reactFiberPrefix = '__reactFiber$';
const react16FiberPrefix = '__reactInternalInstance$';

export function getFiberNodeFromElement(element: Element): Fiber | undefined {
  for (const key in element) {
    if (key.startsWith(reactFiberPrefix) || key.startsWith(react16FiberPrefix)) {
      return element[key as keyof Element] as unknown as Fiber;
    }
  }
}

export function getElementFromFiberNode(node: Fiber): HTMLElement | undefined {
  const fiberNodeRef = node.ref as any;
  return fiberNodeRef.current as HTMLElement;
}

export function getNodeFromRef(element: Element): HTMLElement | undefined {
  for (const key in element) {
    if (key.startsWith(reactFiberPrefix) || key.startsWith(react16FiberPrefix)) {
      const fiberNode = element[key as keyof Element] as unknown as Fiber;
      if (fiberNode.ref && (fiberNode.ref as any).current) {
        console.log('debug2', fiberNode);
        return getElementFromFiberNode(fiberNode);
      }
    }
  }
  return undefined;
}

export function findClosestAncestor(element: Element, componentName: string): Fiber | undefined {
  const startNode = getFiberNodeFromElement(element)!;
  for (let current: Fiber | null = startNode; current !== null && current !== undefined; current = current.return) {
    if (current.type?.displayName && current.type?.displayName === componentName) {
      return current;
    }
  }

  return undefined;
}

export function getAncestors(startNode: Fiber): string[] {
  const ancestors = [];
  for (let current: Fiber | null = startNode; current !== null && current !== undefined; current = current.return) {
    if (current.type?.displayName) {
      ancestors.push(current.type.displayName);
    }
  }
  return ancestors;
}

export function findUp(
  componentName: string,
  node: HTMLElement,
  domSnapshot: HTMLElement = document.body
): HTMLElement | null {
  if (!node.parentNode) {
    return null;
  }

  if ((node as any).__awsuiMetadata__?.name === componentName) {
    return node;
  }

  if (node.dataset.awsuiReferrerId) {
    const referrer = domSnapshot.querySelector(`[id=${node.dataset.awsuiReferrerId}]`) as HTMLElement;
    if (referrer) {
      return findUp(componentName, referrer, domSnapshot);
    }
  }

  return findUp(componentName, node.parentNode as HTMLElement, domSnapshot);
}

export function findDown(componentName: string, node: HTMLElement): HTMLElement | null {
  if ((node as any).__awsuiMetadata__?.name === componentName) {
    return node;
  }

  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    const result = findDown(componentName, child as HTMLElement);
    if (result) {
      return result;
    }
  }

  return null;
}

export function isInComponent(element: HTMLElement, componentName: string) {
  const tree = getAncestors(getFiberNodeFromElement(element)!);
  return tree.includes(componentName);
}

export function getParentFunnelNode(element: HTMLElement, domSnapshot = document.body): HTMLElement | null {
  if (isInComponent(element, 'Modal')) {
    return findDown('Form', element);
  }

  const componentKey = isInComponent(element, 'Wizard') ? 'Wizard' : 'Form';

  return findUp(componentKey, element, domSnapshot);
}
