// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import * as React from 'react';
import { act, render, screen } from '@testing-library/react';

import Alert from '../../../lib/components/alert';
import awsuiPlugins from '../../../lib/components/internal/plugins';
import { awsuiPluginsInternal } from '../../../lib/components/internal/plugins/api';
import { AlertContentConfig } from '../../../lib/components/internal/plugins/controllers/alert-content';
import { AlertWrapper } from '../../../lib/components/test-utils/dom';

const defaultContent: AlertContentConfig = {
  id: 'test-content',
  mountContent: container => {
    const content = document.createElement('div');
    content.append('New content');
    content.dataset.testid = 'test-content';
    container.replaceChildren(content);
    return true;
  },
  mountHeader: container => {
    const content = document.createElement('div');
    content.append('New header');
    content.dataset.testid = 'test-header';
    container.replaceChildren(content);
    return true;
  },
  unmountContent: container => (container.innerHTML = ''),
  unmountHeader: container => (container.innerHTML = ''),
};
// const conditionalContent: AlertContentConfig = {
//   id: 'test-content',
//   mountContent: (container, {type}) => {
//     if (type === 'success') {
//       return false;
//     }
//     const content = document.createElement('div');
//     content.append('Conditional content')
//     content.dataset.testid = 'test-content-conditional';
//     container.replaceChildren(content);
//     return true;
//   },
//   mountHeader: (container, {type}) => {
//     if (type === 'success') {
//       return false;
//     }
//     const content = document.createElement('div');
//     content.append('Conditional header')
//     content.dataset.testid = 'test-header-conditional';
//     container.replaceChildren(content);
//     return true;
//   },
//   unmountContent: container => (container.innerHTML = ''),
//   unmountHeader: container => (container.innerHTML = ''),
// };

function delay() {
  return act(() => new Promise(resolve => setTimeout(resolve)));
}

afterEach(() => {
  awsuiPluginsInternal.alertContent.clearRegisteredContent();
});

test('renders runtime content initially', async () => {
  awsuiPlugins.alertContent.registerContent(defaultContent);
  const { container } = render(<Alert>Alert content</Alert>);
  const alertWrapper = new AlertWrapper(container);
  await delay();
  expect(screen.queryByTestId('test-content')).toBeTruthy();
  expect(alertWrapper.findContent().getElement().textContent).toBe('New content');
});

test('renders runtime content asynchronously', async () => {
  render(<Alert />);
  await delay();
  expect(screen.queryByTestId('test-content')).toBeFalsy();
  awsuiPlugins.alertContent.registerContent(defaultContent);
  await delay();
  expect(screen.queryByTestId('test-content')).toBeTruthy();
});

describe.each([true, false])('existing header:%p', existingHeader => {
  test('renders runtime header initially', async () => {
    awsuiPlugins.alertContent.registerContent(defaultContent);
    const { container } = render(<Alert header={existingHeader ? 'Header content' : undefined}>Alert content</Alert>);
    const alertWrapper = new AlertWrapper(container);
    await delay();
    expect(screen.queryByTestId('test-header')).toBeTruthy();
    expect(alertWrapper.findHeader()!.getElement().textContent).toBe('New header');
  });

  test('renders runtime header asynchronously', async () => {
    const { container } = render(<Alert header={existingHeader ? 'Header content' : undefined}>Alert content</Alert>);
    const alertWrapper = new AlertWrapper(container);
    await delay();
    expect(screen.queryByTestId('test-header')).toBeFalsy();
    awsuiPlugins.alertContent.registerContent(defaultContent);
    await delay();
    expect(screen.queryByTestId('test-header')).toBeTruthy();
    expect(alertWrapper.findHeader()!.getElement().textContent).toBe('New header');
  });
});

// test('renders runtime content on multiple instances', async () => {
//   awsuiPlugins.alertContent.registerContent(defaultContent);
//   render(
//     <>
//       <Alert />
//       <Alert />
//     </>
//   );
//   await delay();
//   expect(screen.queryAllByTestId('test-content')).toHaveLength(2);
// });

// test('allows skipping rendering content', async () => {
//   const testContent: AlertContentConfig = {
//     ...defaultContent,
//     mountContent: (container, context) => {
//       if (context.type !== 'error') {
//         return;
//       }
//       defaultContent.mountContent(container, context);
//     },
//   };
//   awsuiPlugins.alertContent.registerContent(testContent);
//   const { rerender } = render(<Alert type="info" />);
//   await delay();
//   expect(screen.queryByTestId('test-content')).toBeFalsy();
//   rerender(<Alert type="error" />);
//   await delay();
//   expect(screen.queryByTestId('test-content')).toBeTruthy();
// });

// test('cleans up on unmount', async () => {
//   const testContent: AlertContentConfig = {
//     ...defaultContent,
//     mountContent: jest.fn(),
//     unmountContent: jest.fn(),
//   };
//   awsuiPlugins.alertContent.registerContent(testContent);
//   const { rerender } = render(<Alert />);
//   await delay();
//   expect(testContent.mountContent).toHaveBeenCalledTimes(1);
//   expect(testContent.unmountContent).toHaveBeenCalledTimes(0);
//   rerender(<></>);
//   expect(testContent.mountContent).toHaveBeenCalledTimes(1);
//   expect(testContent.unmountContent).toHaveBeenCalledTimes(1);
// });
