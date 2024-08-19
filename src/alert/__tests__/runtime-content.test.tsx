// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import * as React from 'react';
import { act, render, screen } from '@testing-library/react';

import Alert from '../../../lib/components/alert';
import awsuiPlugins from '../../../lib/components/internal/plugins';
import { awsuiPluginsInternal } from '../../../lib/components/internal/plugins/api';
import { AlertContentConfig } from '../../../lib/components/internal/plugins/controllers/alert-content';
import { AlertWrapper } from '../../../lib/components/test-utils/dom';

const pause = (timeout: number) => new Promise(resolve => setTimeout(resolve, timeout));

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
  unmountContent: jest.fn(),
  unmountHeader: jest.fn(),
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

function delay(advanceBy = 1) {
  const promise = act(() => new Promise(resolve => setTimeout(resolve)));
  jest.advanceTimersByTime(advanceBy);
  return promise;
}

beforeEach(() => {
  jest.useFakeTimers();
});
afterEach(() => {
  awsuiPluginsInternal.alertContent.clearRegisteredContent();
  jest.useRealTimers();
  jest.resetAllMocks();
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

describe('unmounting', () => {
  test('unmounts content and header', async () => {
    const plugin: AlertContentConfig = {
      id: 'test-content',
      mountContent: () => true,
      mountHeader: () => true,
      unmountContent: jest.fn(),
      unmountHeader: jest.fn(),
    };
    awsuiPlugins.alertContent.registerContent(plugin);
    const { unmount } = render(<Alert>Alert content</Alert>);
    await delay();
    expect(plugin.unmountContent).toBeCalledTimes(0);
    expect(plugin.unmountHeader).toBeCalledTimes(0);
    unmount();
    await delay();
    expect(plugin.unmountContent).toBeCalledTimes(1);
    expect(plugin.unmountHeader).toBeCalledTimes(1);
  });

  test('does not unmount if not rendered', async () => {
    const contentOnly: AlertContentConfig = {
      id: 'test-content',
      mountContent: () => true,
      unmountContent: jest.fn(),
      unmountHeader: jest.fn(),
    };
    const headerOnly: AlertContentConfig = {
      id: 'test-header',
      mountHeader: () => true,
      unmountContent: jest.fn(),
      unmountHeader: jest.fn(),
    };
    awsuiPlugins.alertContent.registerContent(contentOnly);
    awsuiPlugins.alertContent.registerContent(headerOnly);
    const { unmount } = render(<Alert>Alert content</Alert>);
    await delay();
    unmount();
    await delay();
    expect(contentOnly.unmountContent).toBeCalledTimes(1);
    expect(contentOnly.unmountHeader).toBeCalledTimes(0);
    expect(headerOnly.unmountContent).toBeCalledTimes(0);
    expect(headerOnly.unmountHeader).toBeCalledTimes(1);
  });
});

describe('asynchronous rendering', () => {
  test('allows asynchronous rendering of content', async () => {
    const asyncContent: AlertContentConfig = {
      id: 'test-content-async',
      mountContent: async container => {
        await pause(1000);
        const content = document.createElement('div');
        content.append('New content');
        content.dataset.testid = 'test-content-async';
        container.replaceChildren(content);
        return true;
      },
    };
    awsuiPlugins.alertContent.registerContent(asyncContent);
    const { container } = render(<Alert>Alert content</Alert>);
    const alertWrapper = new AlertWrapper(container);
    await delay();
    expect(screen.queryByTestId('test-content-async')).toBeFalsy();
    expect(alertWrapper.findContent().getElement().textContent).toBe('Alert content');
    await delay(1000);
    expect(screen.queryByTestId('test-content-async')).toBeTruthy();
    expect(alertWrapper.findContent().getElement().textContent).toBe('New content');
  });

  test('cancels asynchronous rendering when unmounting', async () => {
    let rendered = false;
    const asyncContent: AlertContentConfig = {
      id: 'test-content-async',
      mountContent: async (container, { signal }) => {
        await pause(1000);
        if (!signal.aborted) {
          rendered = true;
          return true;
        }
        return false;
      },
    };
    awsuiPlugins.alertContent.registerContent(asyncContent);
    const { unmount } = render(<Alert>Alert content</Alert>);
    await delay(500);
    unmount();
    await delay(1000);
    expect(rendered).toBeFalsy();
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
