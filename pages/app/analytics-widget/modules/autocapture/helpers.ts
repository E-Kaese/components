// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
interface AwsuiNode extends HTMLElement {
  __awsuiMetadata__?: {
    name: string;
  };
}

export function findUp(node: AwsuiNode): AwsuiNode | null {
  if (!node.parentNode) {
    return null;
  }

  if (node.__awsuiMetadata__) {
    return node;
  }

  if (node.dataset.awsuiReferrerId) {
    const referrer = document.getElementById(node.dataset.awsuiReferrerId) as HTMLElement;
    if (referrer) {
      return findUp(referrer);
    }
  }

  return findUp(node.parentNode as HTMLElement);
}

export function getComponentName(node: HTMLElement): string | undefined {
  const awsuiNode = findUp(node);
  return awsuiNode?.__awsuiMetadata__?.name;
}

export function buildAwsuiNodeTree(node: AwsuiNode | null, tree: AwsuiNode[]): AwsuiNode[] {
  if (!node || !node.parentNode) {
    return tree;
  }

  if (node.__awsuiMetadata__) {
    tree.push(node);
  }

  return buildAwsuiNodeTree(node.parentElement, tree);
}
