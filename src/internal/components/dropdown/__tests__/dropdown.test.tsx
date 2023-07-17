// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React, { useState } from 'react';
import { act, screen, render, fireEvent } from '@testing-library/react';
import Dropdown from '../../../../../lib/components/internal/components/dropdown';
import { calculatePosition } from '../../../../../lib/components/internal/components/dropdown/dropdown-fit-handler';
import DropdownWrapper from '../../../../../lib/components/test-utils/dom/internal/dropdown';

const outsideId = 'outside';

function renderDropdown(dropdown: React.ReactNode): [DropdownWrapper, HTMLElement] {
  const renderResult = render(
    <div>
      <button data-testid={outsideId} />
      {dropdown}
    </div>
  );
  const outsideElement = renderResult.getByTestId(outsideId);
  const dropdownElement = renderResult.container.querySelector<HTMLElement>(`.${DropdownWrapper.rootSelector}`)!;
  return [new DropdownWrapper(dropdownElement), outsideElement];
}

jest.mock('../../../../../lib/components/internal/components/dropdown/dropdown-fit-handler', () => {
  const originalModule = jest.requireActual(
    '../../../../../lib/components/internal/components/dropdown/dropdown-fit-handler'
  );
  return {
    ...originalModule,
    calculatePosition: jest.fn(originalModule.calculatePosition),
  };
});

describe('Dropdown Component', () => {
  describe.each([
    [true, false],
    [true, false],
  ])('Properties (expandToViewport=%s, expandDropdownWidth=%s)', (expandToViewport, expandDropdownWidth) => {
    test('closed by default', () => {
      const [wrapper] = renderDropdown(
        <Dropdown trigger={<button />} expandToViewport={expandToViewport} expandDropdownWidth={expandDropdownWidth}>
          <div id="content" />
        </Dropdown>
      );
      expect(wrapper.findOpenDropdown()).not.toBeTruthy();
    });
    test('opens with the prop', () => {
      const [wrapper] = renderDropdown(
        <Dropdown
          trigger={<button />}
          open={true}
          expandToViewport={expandToViewport}
          expandDropdownWidth={expandDropdownWidth}
        />
      );
      expect(wrapper.findOpenDropdown()).toBeTruthy();
    });
    test('renders the trigger', () => {
      const id = 'trigger';
      const [wrapper] = renderDropdown(
        <Dropdown
          trigger={<button id={id} />}
          expandToViewport={expandToViewport}
          expandDropdownWidth={expandDropdownWidth}
        />
      );
      expect(wrapper.find(`#${id}`)).toBeTruthy();
    });
  });
  describe('"DropdownClose" Event', () => {
    test('fires close event on outside click', async () => {
      const handleCloseDropdown = jest.fn();
      const [, outsideElement] = renderDropdown(
        <Dropdown trigger={<button />} onDropdownClose={handleCloseDropdown} open={true} />
      );
      await runPendingEvents();

      act(() => outsideElement.click());
      expect(handleCloseDropdown).toBeCalled();
    });

    test('does not fire close event when a self-destructible element inside dropdown was clicked', async () => {
      function SelfDestructible() {
        const [visible, setVisible] = useState(true);
        return visible ? (
          <button data-testid="dismiss" onClick={() => setVisible(false)}>
            Dismiss
          </button>
        ) : (
          <span data-testid="after-dismiss">Gone!</span>
        );
      }
      const handleCloseDropdown = jest.fn();
      const [wrapper] = renderDropdown(
        <Dropdown trigger={<button />} onDropdownClose={handleCloseDropdown} open={true}>
          <SelfDestructible />
        </Dropdown>
      );
      await runPendingEvents();

      // NB: this should NOT be wrapped into act or React re-render will happen too late to reproduce the issue
      wrapper.find('[data-testid="dismiss"]')!.click();

      expect(handleCloseDropdown).not.toBeCalled();
      expect(screen.getByTestId('after-dismiss')).toBeTruthy();
    });
  });
  describe('dropdown recalculate position on scroll', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });
    afterAll(() => {
      jest.useRealTimers();
    });
    test('dropdown position is calculated on window scroll when dropdown is open', () => {
      render(<Dropdown trigger={<button />} open={true} />);
      (calculatePosition as jest.Mock).mockClear();
      fireEvent.scroll(window, { target: { scrollY: 100 } });
      expect(calculatePosition).toHaveBeenCalledTimes(1);
    });
    test('dropdown position is not calculated when dropdown not open', () => {
      render(<Dropdown trigger={<button />} open={false} />);
      (calculatePosition as jest.Mock).mockClear();
      fireEvent.scroll(window, { target: { scrollY: 100 } });
      expect(calculatePosition).toHaveBeenCalledTimes(0);
    });
    test('dropdown position is not calculated when dropdown closes ', () => {
      const renderResult = render(<Dropdown trigger={<button />} open={true} />);
      renderResult.rerender(<Dropdown trigger={<button />} open={false} />);
      (calculatePosition as jest.Mock).mockClear();
      fireEvent.scroll(window, { target: { scrollY: 100 } });
      expect(calculatePosition).toHaveBeenCalledTimes(0);
    });
    test('dropdown handler is not calculated on window scroll after timeout when dropdown is open', () => {
      render(<Dropdown trigger={<button />} open={true} />);
      jest.runAllTimers();
      (calculatePosition as jest.Mock).mockClear();
      fireEvent.scroll(window, { target: { scrollY: 100 } });
      expect(calculatePosition).toHaveBeenCalledTimes(0);
    });
  });
});

/**
 * This function causes a zero-time delay in order
 * to allow events that are queued in the event loop
 * (such as setTimeout calls in components) to run.
 */
async function runPendingEvents() {
  await act(() => new Promise(r => setTimeout(r, 0)));
}
