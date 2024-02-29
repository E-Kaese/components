// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export function mockInnerText() {
  if (!('innerText' in HTMLElement.prototype)) {
    // JSDom does not support the `innerText` property. For tests, `textContent` is usually close enough.

    beforeEach(() =>
      Object.defineProperty(HTMLElement.prototype, 'innerText', {
        get() {
          return this.textContent;
        },
        set(v) {
          this.textContent = v;
        },
        configurable: true,
      })
    );

    afterEach(() => delete (HTMLElement.prototype as Partial<HTMLElement>).innerText);
  }
}
