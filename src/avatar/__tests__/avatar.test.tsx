// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { render, act, fireEvent, screen } from '@testing-library/react';
import React from 'react';
import Avatar, { AvatarProps } from '../../../lib/components/avatar';
import createWrapper from '../../../lib/components/test-utils/dom';
import { warnOnce } from '@cloudscape-design/component-toolkit/internal';
import loadingDotsStyles from '../../../lib/components/avatar/loading-dots/styles.selectors.js';
import '../../__a11y__/to-validate-a11y';

const defaultAvatarProps: AvatarProps = { ariaLabel: 'Avatar' };

function renderAvatar(props: AvatarProps) {
  const { container } = render(<Avatar {...props} />);

  return createWrapper(container).findAvatar()!;
}

jest.mock('@cloudscape-design/component-toolkit/internal', () => ({
  ...jest.requireActual('@cloudscape-design/component-toolkit/internal'),
  warnOnce: jest.fn(),
}));
afterEach(() => {
  (warnOnce as jest.Mock).mockReset();
});

describe('Avatar component', () => {
  describe('Basic', () => {
    test('Shows tooltip on focus', () => {
      const tooltipText = 'Jane Doe';
      const wrapper = renderAvatar({ ...defaultAvatarProps, color: 'default', tooltipText });
      wrapper.focus();
      expect(wrapper.findTooltip()?.getElement()).toHaveTextContent(tooltipText);

      wrapper?.blur();
      expect(wrapper.findTooltip()?.getElement()).toBeUndefined();
    });

    test('Shows tooltip on mouse enter', () => {
      const tooltipText = 'Jane Doe';
      const wrapper = renderAvatar({ ...defaultAvatarProps, color: 'default', tooltipText });
      act(() => {
        fireEvent.mouseEnter(wrapper.getElement());
      });
      expect(wrapper.findTooltip()?.getElement()).toHaveTextContent(tooltipText);

      act(() => {
        fireEvent.mouseLeave(wrapper.getElement());
      });
      expect(wrapper.findTooltip()?.getElement()).toBeUndefined();
    });

    test('Does not render tooltip when tooltipText is not passed', () => {
      const wrapper = renderAvatar({ ...defaultAvatarProps, color: 'default' });
      wrapper.focus();
      expect(wrapper.findTooltip()?.getElement()).toBeUndefined();
    });

    test('Renders avatar in loading state', () => {
      const wrapper = renderAvatar({ ...defaultAvatarProps, loading: true });

      const loading = wrapper.findByClassName(loadingDotsStyles.root)?.getElement();
      expect(loading).toBeInTheDocument();
    });

    test('Renders avatar with initials', () => {
      const initials = 'JD';
      const wrapper = renderAvatar({ ...defaultAvatarProps, initials });

      expect(wrapper.getElement()).toHaveTextContent(initials);
    });

    test('Shows warning when initials length is longer than 2', () => {
      const initials = 'JDD';
      renderAvatar({ ...defaultAvatarProps, initials });

      expect(warnOnce).toHaveBeenCalledTimes(1);
      expect(warnOnce).toHaveBeenCalledWith(
        'Avatar',
        `"initials" is longer than 2 characters. Only the first two characters are shown.`
      );
    });

    test('Tooltip is closed on pointer down', () => {
      const tooltipText = 'Tooltip text for avatar';
      const wrapper = renderAvatar({ ...defaultAvatarProps, tooltipText });

      act(() => {
        fireEvent.mouseEnter(wrapper.getElement());
      });
      expect(wrapper.findTooltip()?.getElement()).toHaveTextContent(tooltipText);

      act(() => {
        fireEvent.pointerDown(screen.getByText(tooltipText));
      });
      expect(wrapper.findTooltip()?.getElement()).toBeUndefined();
    });
  });

  describe('a11y', () => {
    test('Validates', async () => {
      const props: AvatarProps = {
        color: 'default',
        initials: 'JD',
        tooltipText: 'Jane Doe',
        ariaLabel: 'User avatar',
      };
      const { container } = render(<Avatar {...props} />);
      await expect(container).toValidateA11y();
    });

    test('ariaLabel is directly used', () => {
      const ariaLabel = 'User avatar JD Jane Doe';
      const wrapper = renderAvatar({ ariaLabel, initials: 'JD', tooltipText: 'Jane Doe' });
      expect(wrapper.getElement()).toHaveAttribute('aria-label', ariaLabel);
    });
  });
});
