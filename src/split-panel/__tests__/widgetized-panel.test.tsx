// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import { render } from '@testing-library/react';
import { describeWithAppLayoutFeatureFlagEnabled } from '../../internal/widgets/__tests__/utils';
import { useVisualRefresh } from '../../../lib/components/internal/hooks/use-visual-mode';
import createWrapper from '../../../lib/components/test-utils/dom';
import { createWidgetizedSplitPanel } from '../../../lib/components/split-panel/implementation';
import { SplitPanelProps } from '../../../lib/components/split-panel/interfaces';
import { SplitPanelContextProvider } from '../../../lib/components/internal/context/split-panel-context';
import { defaultSplitPanelContextProps } from './helpers';

const LoaderSkeleton = React.forwardRef<HTMLElement, SplitPanelProps>(() => {
  return <div data-testid="loader">Loading...</div>;
});

function findLoader(container: HTMLElement) {
  return container.querySelector('[data-testid="loader"]');
}

function renderComponent(jsx: React.ReactElement) {
  const { container } = render(jsx, {
    wrapper: ({ children }) => (
      <SplitPanelContextProvider value={defaultSplitPanelContextProps}>{children}</SplitPanelContextProvider>
    ),
  });
  const wrapper = createWrapper(container).findSplitPanel();

  return { wrapper, container };
}

const WidgetizedPanel = createWidgetizedSplitPanel(LoaderSkeleton);

const defaultProps: SplitPanelProps = {
  header: '',
  children: <></>,
};

jest.mock('../../../lib/components/internal/hooks/use-visual-mode', () => ({
  useVisualRefresh: jest.fn().mockReturnValue(false),
}));

describe('Classic design', () => {
  beforeEach(() => {
    jest.mocked(useVisualRefresh).mockReturnValue(false);
  });

  test('should render normal panel by default', () => {
    const { wrapper, container } = renderComponent(<WidgetizedPanel {...defaultProps} />);
    expect(wrapper).toBeTruthy();
    expect(findLoader(container)).toBeFalsy();
  });

  describeWithAppLayoutFeatureFlagEnabled(() => {
    test('should render normal layout', () => {
      const { wrapper, container } = renderComponent(<WidgetizedPanel {...defaultProps} />);
      expect(wrapper).toBeTruthy();
      expect(findLoader(container)).toBeFalsy();
    });
  });
});

describe('Refresh design', () => {
  beforeEach(() => {
    jest.mocked(useVisualRefresh).mockReturnValue(true);
  });

  test('should render normal layout by default', () => {
    const { wrapper, container } = renderComponent(<WidgetizedPanel {...defaultProps} />);
    expect(wrapper).toBeTruthy();
    expect(findLoader(container)).toBeFalsy();
  });

  describeWithAppLayoutFeatureFlagEnabled(() => {
    test('should render loader', () => {
      const { wrapper, container } = renderComponent(<WidgetizedPanel {...defaultProps} />);
      expect(wrapper).toBeFalsy();
      expect(findLoader(container)).toBeTruthy();
    });
  });
});
