// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import * as React from 'react';
import { act, render, screen } from '@testing-library/react';

import Button from '../../../lib/components/button';
import Flashbar from '../../../lib/components/flashbar';
import awsuiPlugins from '../../../lib/components/internal/plugins';
import { awsuiPluginsInternal } from '../../../lib/components/internal/plugins/api';
import { AlertFlashContentConfig } from '../../../lib/components/internal/plugins/controllers/alert-flash-content';
import { FlashbarWrapper } from '../../../lib/components/test-utils/dom';

const pause = (timeout: number) => new Promise(resolve => setTimeout(resolve, timeout));

const defaultContent: AlertFlashContentConfig = {
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

function delay(advanceBy = 1) {
  const promise = act(() => new Promise(resolve => setTimeout(resolve)));
  jest.advanceTimersByTime(advanceBy);
  return promise;
}

beforeEach(() => {
  jest.useFakeTimers();
});
afterEach(() => {
  awsuiPluginsInternal.flashContent.clearRegisteredContent();
  jest.useRealTimers();
  jest.resetAllMocks();
});

test('renders runtime content initially', async () => {
  awsuiPlugins.flashContent.registerContent(defaultContent);
  const { container } = render(
    <Flashbar
      items={[
        {
          content: 'Flash content',
        },
      ]}
    />
  );
  const wrapper = new FlashbarWrapper(container);
  await delay();
  expect(screen.queryByTestId('test-content')).toBeTruthy();
  expect(wrapper.findItems()[0]!.findContent()!.getElement().textContent).toBe('New content');
});

test('renders runtime content asynchronously', async () => {
  render(
    <Flashbar
      items={[
        {
          content: 'Flash content',
        },
      ]}
    />
  );
  await delay();
  expect(screen.queryByTestId('test-content')).toBeFalsy();
  awsuiPlugins.flashContent.registerContent(defaultContent);
  await delay();
  expect(screen.queryByTestId('test-content')).toBeTruthy();
});

describe.each([true, false])('existing header:%p', existingHeader => {
  test('renders runtime header initially', async () => {
    awsuiPlugins.flashContent.registerContent(defaultContent);
    const { container } = render(
      <Flashbar
        items={[
          {
            content: 'Flash content',
            header: existingHeader ? 'Flash header' : undefined,
          },
        ]}
      />
    );
    const wrapper = new FlashbarWrapper(container);
    await delay();
    expect(screen.queryByTestId('test-header')).toBeTruthy();
    expect(wrapper.findItems()[0].findHeader()!.getElement().textContent).toBe('New header');
  });

  test('renders runtime header asynchronously', async () => {
    const { container } = render(
      <Flashbar
        items={[
          {
            content: 'Flash content',
            header: existingHeader ? 'Flash header' : undefined,
          },
        ]}
      />
    );
    const wrapper = new FlashbarWrapper(container);
    await delay();
    expect(screen.queryByTestId('test-header')).toBeFalsy();
    awsuiPlugins.flashContent.registerContent(defaultContent);
    await delay();
    expect(screen.queryByTestId('test-header')).toBeTruthy();
    expect(wrapper.findItems()[0].findHeader()!.getElement().textContent).toBe('New header');
  });
});

describe('mountContent arguments', () => {
  const mountContent = jest.fn();
  beforeEach(() => {
    const plugin: AlertFlashContentConfig = {
      id: 'test-content',
      mountContent,
    };
    awsuiPlugins.flashContent.registerContent(plugin);
  });
  test('refs', async () => {
    render(
      <Flashbar
        items={[
          {
            header: 'Flash header',
            action: <Button>Action button</Button>,
            content: 'Flash content',
          },
        ]}
      />
    );
    await delay();
    expect(mountContent.mock.lastCall[1].headerRef.current).toHaveTextContent('Flash header');
    expect(mountContent.mock.lastCall[1].contentRef.current).toHaveTextContent('Flash content');
    expect(mountContent.mock.lastCall[1].actionsRef.current).toHaveTextContent('Action button');
  });
  test('type - default', async () => {
    render(<Flashbar items={[{}]} />);
    await delay();
    expect(mountContent.mock.lastCall[1].type).toBe('info');
  });
  test('type - custom', async () => {
    render(
      <Flashbar
        items={[
          {
            type: 'error',
          },
        ]}
      />
    );
    await delay();
    expect(mountContent.mock.lastCall[1].type).toBe('error');
  });
});

test('multiple flashes', async () => {
  const plugin: AlertFlashContentConfig = {
    id: 'test-content',
    mountContent: (container, context) => {
      if (context.type === 'error') {
        container.innerHTML = 'Replaced content';
        return true;
      }
      return false;
    },
  };
  awsuiPlugins.flashContent.registerContent(plugin);
  const { container } = render(
    <Flashbar
      items={[
        { content: 'Flash content', type: 'error' },
        { content: 'Flash content', type: 'info' },
        { content: 'Flash content', type: 'error' },
      ]}
    />
  );
  await delay();
  const wrapper = new FlashbarWrapper(container);
  expect(wrapper.findItems()[0].findContent()?.getElement()).toHaveTextContent('Replaced content');
  expect(wrapper.findItems()[1].findContent()?.getElement()).toHaveTextContent('Flash content');
  expect(wrapper.findItems()[2].findContent()?.getElement()).toHaveTextContent('Replaced content');
});

describe('unmounting', () => {
  test('unmounts content and header', async () => {
    const plugin: AlertFlashContentConfig = {
      id: 'test-content',
      mountContent: () => true,
      mountHeader: () => true,
      unmountContent: jest.fn(),
      unmountHeader: jest.fn(),
    };
    awsuiPlugins.flashContent.registerContent(plugin);
    const { unmount } = render(<Flashbar items={[{}]} />);
    await delay();
    expect(plugin.unmountContent).toBeCalledTimes(0);
    expect(plugin.unmountHeader).toBeCalledTimes(0);
    unmount();
    await delay();
    expect(plugin.unmountContent).toBeCalledTimes(1);
    expect(plugin.unmountHeader).toBeCalledTimes(1);
  });
  test('unmounts content and header (individual flash)', async () => {
    const plugin: AlertFlashContentConfig = {
      id: 'test-content',
      mountContent: () => true,
      mountHeader: () => true,
      unmountContent: jest.fn(),
      unmountHeader: jest.fn(),
    };
    awsuiPlugins.flashContent.registerContent(plugin);
    const { rerender } = render(<Flashbar items={[{}]} />);
    await delay();
    expect(plugin.unmountContent).toBeCalledTimes(0);
    expect(plugin.unmountHeader).toBeCalledTimes(0);
    rerender(<Flashbar items={[]} />);
    await delay();
    expect(plugin.unmountContent).toBeCalledTimes(1);
    expect(plugin.unmountHeader).toBeCalledTimes(1);
  });

  test('does not unmount if not rendered', async () => {
    const contentOnly: AlertFlashContentConfig = {
      id: 'test-content',
      mountContent: () => true,
      unmountContent: jest.fn(),
      unmountHeader: jest.fn(),
    };
    const headerOnly: AlertFlashContentConfig = {
      id: 'test-header',
      mountHeader: () => true,
      unmountContent: jest.fn(),
      unmountHeader: jest.fn(),
    };
    awsuiPlugins.flashContent.registerContent(contentOnly);
    awsuiPlugins.flashContent.registerContent(headerOnly);
    const { unmount } = render(<Flashbar items={[{}]} />);
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
    const asyncContent: AlertFlashContentConfig = {
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
    awsuiPlugins.flashContent.registerContent(asyncContent);
    const { container } = render(
      <Flashbar
        items={[
          {
            content: 'Flash content',
          },
        ]}
      />
    );
    const wrapper = new FlashbarWrapper(container);
    await delay();
    expect(screen.queryByTestId('test-content-async')).toBeFalsy();
    expect(wrapper.findItems()[0].findContent()!.getElement().textContent).toBe('Flash content');
    await delay(1000);
    expect(screen.queryByTestId('test-content-async')).toBeTruthy();
    expect(wrapper.findItems()[0].findContent()!.getElement().textContent).toBe('New content');
  });

  test('cancels asynchronous rendering when unmounting', async () => {
    let rendered = false;
    const asyncContent: AlertFlashContentConfig = {
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
    awsuiPlugins.flashContent.registerContent(asyncContent);
    const { unmount } = render(<Flashbar items={[{}]} />);
    await delay(500);
    unmount();
    await delay(1000);
    expect(rendered).toBeFalsy();
  });
});
