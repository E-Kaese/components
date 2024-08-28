// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { act, fireEvent, render } from '@testing-library/react';

import TestI18nProvider from '../../../lib/components/i18n/testing';
import { useMobile } from '../../../lib/components/internal/hooks/use-mobile';
import PropertyFilter from '../../../lib/components/property-filter';
import {
  FilteringOption,
  FilteringProperty,
  PropertyFilterProps,
  Ref,
} from '../../../lib/components/property-filter/interfaces';
import createWrapper from '../../../lib/components/test-utils/dom';
import { createDefaultProps, i18nStrings, providedI18nStrings } from './common';

jest.mock('../../../lib/components/internal/hooks/use-mobile', () => ({
  ...jest.requireActual('../../../lib/components/internal/hooks/use-mobile'),
  useMobile: jest.fn().mockReturnValue(true),
}));

const filteringProperties: readonly FilteringProperty[] = [
  {
    key: 'string',
    propertyLabel: 'string',
    operators: ['!:', ':', '=', '!='],
    groupValuesLabel: 'String values',
  },
  // property label has the a prefix equal to another property's label
  {
    key: 'other-string',
    propertyLabel: 'string-other',
    operators: ['!:', ':', '=', '!='],
    groupValuesLabel: 'Other string values',
  },
  // operator unspecified
  {
    key: 'default-operator',
    propertyLabel: 'default',
    groupValuesLabel: 'Default values',
  },
  // supports range operators
  {
    key: 'range',
    propertyLabel: 'range',
    operators: ['>', '<', '=', '!=', '>=', '<='],
    groupValuesLabel: 'Range values',
    group: 'group-name',
  },
  // property label is consists of another property with an operator after
  {
    key: 'edge-case',
    propertyLabel: 'string!=',
    operators: ['!:', ':', '=', '!='],
    groupValuesLabel: 'Edge case values',
  },
];

const filteringOptions: readonly FilteringOption[] = [
  { propertyKey: 'string', value: 'value1' },
  { propertyKey: 'other-string', value: 'value1' },
  { propertyKey: 'string', value: 'value2' },
  { propertyKey: 'range', value: '1' },
  { propertyKey: 'range', value: '2' },
  { propertyKey: 'other-string', value: 'value2' },
  { propertyKey: 'missing-property', value: 'value' },
  { propertyKey: 'default-operator', value: 'value' },
];

const defaultProps = createDefaultProps(filteringProperties, filteringOptions);

function renderComponent(props?: Partial<PropertyFilterProps & { ref: React.Ref<Ref> }>, withI18nProvider = false) {
  return withI18nProvider
    ? render(
        <TestI18nProvider messages={providedI18nStrings}>
          <PropertyFilter {...defaultProps} {...props} />
        </TestI18nProvider>
      )
    : render(<PropertyFilter {...defaultProps} {...props} />);
}

function openEditor(tokenIndex: number, options: { expandToViewport?: boolean; isMobile?: boolean }) {
  const propertyFilter = createWrapper().findPropertyFilter()!;
  const token = propertyFilter.findTokens()[tokenIndex];
  if (token.findEditButton()) {
    token.findEditButton()!.click();
  } else {
    token.findLabel()!.click();
  }
  return findEditor(tokenIndex, options)!;
}

function findEditor(
  tokenIndex: number,
  { expandToViewport = false, isMobile = false }: { expandToViewport?: boolean; isMobile?: boolean }
) {
  const propertyFilter = createWrapper().findPropertyFilter()!;
  const editor = propertyFilter.findTokens()[tokenIndex].findEditorDropdown({ expandToViewport })!;
  return editor
    ? {
        textContent: editor.getElement().textContent,
        header: editor.findHeader(),
        dismissButton: editor.findDismissButton(),
        propertyField: (index?: number) => editor.findPropertyField(index),
        propertySelect: (index?: number) => editor.findPropertyField(index).findControl()!.findSelect()!,
        operatorField: (index?: number) => editor.findOperatorField(index),
        operatorSelect: (index?: number) => editor.findOperatorField(index).findControl()!.findSelect()!,
        valueField: (index?: number) => editor.findValueField(index),
        valueAutosuggest: (index?: number) => editor.findValueField(index).findControl()!.findAutosuggest()!,
        removeActions: (index?: number) => editor.findTokenRemoveActions(index),
        removeActionsRemove(index: number) {
          editor.findTokenRemoveActions(index)!.openDropdown();
          return isMobile
            ? editor.findTokenRemoveActions(index)!.findMainAction()!
            : editor.findTokenRemoveActions(index)!.findItems()[0];
        },
        removeActionsRemoveFromGroup(index: number, openDropdown = true) {
          if (openDropdown) {
            editor.findTokenRemoveActions(index)!.openDropdown();
          }
          return editor.findTokenRemoveActions(index)!.findItems()[isMobile ? 0 : 1];
        },
        addActions: editor.findTokenAddActions(),
        cancelButton: editor.findCancelButton(),
        submitButton: editor.findSubmitButton(),
        form: editor.findForm(),
      }
    : null;
}

describe.each([false, true])('token editor, expandToViewport=%s', expandToViewport => {
  test('uses i18nStrings to populate header', () => {
    renderComponent({
      query: { tokens: [{ value: 'first', operator: '!:' }], operation: 'or' },
    });
    const editor = openEditor(0, { expandToViewport });
    expect(editor.header.getElement()).toHaveTextContent(i18nStrings.editTokenHeader!);
  });

  describe('form controls content', () => {
    test('default', () => {
      renderComponent({
        query: { tokens: [{ propertyKey: 'string', value: 'first', operator: '!:' }], operation: 'or' },
      });
      const editor = openEditor(0, { expandToViewport });
      expect(editor.textContent).toBe('Edit filterPropertystringOperator!:Does not containValueCancelApply');
      act(() => editor.propertySelect().openDropdown());
      expect(
        editor
          .propertySelect()
          .findDropdown()
          .findOptions()!
          .map(optionWrapper => optionWrapper.getElement().textContent)
      ).toEqual(['All properties', 'string', 'string-other', 'default', 'string!=', 'range']);

      act(() => editor.operatorSelect().openDropdown());
      expect(
        editor
          .operatorSelect()
          .findDropdown()
          .findOptions()!
          .map(optionWrapper => optionWrapper.getElement().textContent)
      ).toEqual(['=Equals', '!=Does not equal', ':Contains', '!:Does not contain']);

      act(() => editor.valueAutosuggest().focus());
      expect(
        editor
          .valueAutosuggest()
          .findDropdown()
          .findOptions()!
          .map(optionWrapper => optionWrapper.getElement().textContent)
      ).toEqual(['value1', 'value2']);
    });

    test('with free text disabled', () => {
      renderComponent({
        disableFreeTextFiltering: true,
        query: { tokens: [{ propertyKey: 'string', value: 'first', operator: '!:' }], operation: 'or' },
      });
      const editor = openEditor(0, { expandToViewport });
      expect(editor.textContent).toBe('Edit filterPropertystringOperator!:Does not containValueCancelApply');
      act(() => editor.propertySelect().openDropdown());
      expect(
        editor
          .propertySelect()
          .findDropdown()
          .findOptions()!
          .map(optionWrapper => optionWrapper.getElement().textContent)
      ).toEqual(['string', 'string-other', 'default', 'string!=', 'range']);
    });

    test('with custom free text operators', () => {
      renderComponent({
        freeTextFiltering: { operators: ['=', '!=', ':', '!:'] },
        query: { tokens: [{ value: 'first', operator: '!=' }], operation: 'or' },
      });
      const editor = openEditor(0, { expandToViewport });
      expect(editor.textContent).toBe('Edit filterPropertyAll propertiesOperator!=Does not equalValueCancelApply');
      act(() => editor.operatorSelect().openDropdown());
      expect(
        editor
          .operatorSelect()
          .findDropdown()
          .findOptions()!
          .map(optionWrapper => optionWrapper.getElement().textContent)
      ).toEqual(['=Equals', '!=Does not equal', ':Contains', '!:Does not contain']);
    });

    test('preserves fields, when one is edited', () => {
      renderComponent({
        disableFreeTextFiltering: true,
        query: { tokens: [{ propertyKey: 'string', value: 'first', operator: ':' }], operation: 'or' },
      });
      const editor = openEditor(0, { expandToViewport });

      // Change operator
      act(() => editor.operatorSelect().openDropdown());
      act(() => editor.operatorSelect().selectOption(1));
      expect(editor.propertySelect().findTrigger().getElement()).toHaveTextContent('string');
      expect(editor.operatorSelect().findTrigger().getElement()).toHaveTextContent('=Equals');
      expect(editor.valueAutosuggest().findNativeInput().getElement()).toHaveAttribute('value', 'first');

      // Change value
      act(() => editor.valueAutosuggest().setInputValue('123'));
      expect(editor.propertySelect().findTrigger().getElement()).toHaveTextContent('string');
      expect(editor.operatorSelect().findTrigger().getElement()).toHaveTextContent('=Equals');
      expect(editor.valueAutosuggest().findNativeInput().getElement()).toHaveAttribute('value', '123');

      // Change property
      // This preserves operator but not value because the value type between properties can be different.
      act(() => editor.propertySelect().openDropdown());
      act(() => editor.propertySelect().selectOption(2));
      expect(editor.propertySelect().findTrigger().getElement()).toHaveTextContent('string-other');
      expect(editor.operatorSelect().findTrigger().getElement()).toHaveTextContent('=Equals');
      expect(editor.valueAutosuggest().findNativeInput().getElement()).toHaveAttribute('value', '');
    });
  });

  describe('exit actions', () => {
    test('dismiss button closes the popover and discards the changes', () => {
      const handleChange = jest.fn();
      renderComponent({
        onChange: handleChange,
        query: { tokens: [{ propertyKey: 'string', value: 'first', operator: '!:' }], operation: 'or' },
      });
      const editor = openEditor(0, { expandToViewport });

      act(() => editor.valueAutosuggest().setInputValue('123'));
      act(() => editor.operatorSelect().openDropdown());
      act(() => editor.operatorSelect().selectOption(1));
      act(() => editor.propertySelect().openDropdown());
      act(() => editor.propertySelect().selectOption(1));
      act(() => editor.dismissButton.click());
      expect(findEditor(0, { expandToViewport })).toBeNull();
      expect(handleChange).not.toHaveBeenCalled();
    });

    test('cancel button closes the popover and discards the changes', () => {
      const handleChange = jest.fn();
      renderComponent({
        onChange: handleChange,
        query: { tokens: [{ propertyKey: 'string', value: 'first', operator: '!:' }], operation: 'or' },
      });
      const editor = openEditor(0, { expandToViewport });

      act(() => editor.valueAutosuggest().setInputValue('123'));
      act(() => editor.operatorSelect().openDropdown());
      act(() => editor.operatorSelect().selectOption(1));
      act(() => editor.propertySelect().openDropdown());
      act(() => editor.propertySelect().selectOption(1));
      act(() => editor.cancelButton.click());
      expect(findEditor(0, { expandToViewport })).toBeNull();
      expect(handleChange).not.toHaveBeenCalled();
    });

    test('submit button closes the popover and saves the changes', () => {
      const handleChange = jest.fn();
      renderComponent({
        onChange: handleChange,
        query: { tokens: [{ propertyKey: 'string', value: 'first', operator: '!:' }], operation: 'or' },
      });
      const editor = openEditor(0, { expandToViewport });

      act(() => editor.operatorSelect().openDropdown());
      act(() => editor.operatorSelect().selectOption(1));
      act(() => editor.propertySelect().openDropdown());
      act(() => editor.propertySelect().selectOption(1));
      act(() => editor.valueAutosuggest().setInputValue('123'));
      act(() => editor.submitButton.click());
      expect(findEditor(0, { expandToViewport })).toBeNull();
      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: { operation: 'or', tokens: [{ operator: ':', propertyKey: undefined, value: '123' }] },
        })
      );
    });

    test('form submit closes the popover and saves the changes', () => {
      const handleChange = jest.fn();
      renderComponent({
        onChange: handleChange,
        query: { tokens: [{ propertyKey: 'string', value: 'first', operator: '!:' }], operation: 'or' },
      });
      const editor = openEditor(0, { expandToViewport });

      act(() => editor.operatorSelect().openDropdown());
      act(() => editor.operatorSelect().selectOption(1));
      act(() => editor.propertySelect().openDropdown());
      act(() => editor.propertySelect().selectOption(1));
      act(() => editor.valueAutosuggest().setInputValue('123'));
      fireEvent.submit(editor.form!.getElement());
      expect(findEditor(0, { expandToViewport })).toBeNull();
      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: { operation: 'or', tokens: [{ operator: ':', propertyKey: undefined, value: '123' }] },
        })
      );
    });
  });
});

const tokenJohn = { propertyKey: 'string', operator: '=', value: 'John' };
const tokenJane = { propertyKey: 'string', operator: '=', value: 'Jane' };
const tokenJack = { propertyKey: 'string', operator: '=', value: 'Jack' };

describe.each([false, true] as const)('isMobile = %s', isMobile => {
  beforeEach(() => {
    jest.mocked(useMobile).mockReturnValue(isMobile);
  });

  describe.each([false, true])('with i18n-provider %s', withI18nProvider => {
    test.each([false, true])(
      'token editor with a single property has correct labels, enableTokenGroups=%s',
      enableTokenGroups => {
        renderComponent({ enableTokenGroups, query: { operation: 'and', tokens: [tokenJohn] } }, withI18nProvider);
        const editor = openEditor(0, { expandToViewport: false, isMobile });

        expect(editor.header.getElement()).toHaveTextContent('Edit filter');
        expect(editor.dismissButton.getElement()).toHaveAccessibleName('Dismiss');

        // Token inputs
        expect(editor.propertyField().findControl()!.find('button')!.getElement()).toHaveAccessibleName(
          'Property string'
        );
        expect(editor.operatorField().findControl()!.find('button')!.getElement()).toHaveAccessibleName('Operator =');
        expect(editor.valueField().findControl()!.find('input')!.getElement()).toHaveAccessibleName('Value');
        expect(editor.valueField().findControl()!.find('input')!.getElement()).toHaveValue('John');

        if (enableTokenGroups) {
          expect(editor.removeActions()!.findNativeButton().getElement()).toHaveAccessibleName(
            'Remove actions, string equals John'
          );
          expect(editor.removeActions()!.findNativeButton().getElement()).toBeDisabled();

          expect(editor.addActions!.findNativeButton().getElement()).toHaveAccessibleName('Add filter actions');
          expect(editor.addActions!.findNativeButton().getElement()).toBeDisabled();
          expect(editor.addActions!.findMainAction()!.getElement()).toHaveTextContent('Add new filter');
        } else {
          expect(editor.removeActions()).toBe(null);
          expect(editor.addActions).toBe(null);
        }

        // Form actions
        expect(editor.cancelButton.getElement()).toHaveTextContent('Cancel');
        expect(editor.submitButton.getElement()).toHaveTextContent('Apply');
      }
    );
  });
});

describe.each([false, true] as const)('token editor labels, isMobile = %s', isMobile => {
  beforeEach(() => {
    jest.mocked(useMobile).mockReturnValue(isMobile);
  });

  describe.each([false, true])('with i18n-provider %s', withI18nProvider => {
    test.each([false, true])('token editor with a single filter, enableTokenGroups=%s', enableTokenGroups => {
      renderComponent(
        {
          enableTokenGroups,
          query: { operation: 'and', tokens: [tokenJohn] },
        },
        withI18nProvider
      );
      const editor = openEditor(0, { expandToViewport: false, isMobile });

      expect(editor.header.getElement()).toHaveTextContent('Edit filter');
      expect(editor.dismissButton.getElement()).toHaveAccessibleName('Dismiss');

      expect(editor.propertyField().findControl()!.find('button')!.getElement()).toHaveAccessibleName(
        'Property string'
      );
      expect(editor.operatorField().findControl()!.find('button')!.getElement()).toHaveAccessibleName('Operator =');
      expect(editor.valueField().findControl()!.find('input')!.getElement()).toHaveAccessibleName('Value');
      expect(editor.valueField().findControl()!.find('input')!.getElement()).toHaveValue('John');

      if (enableTokenGroups) {
        expect(editor.removeActions()!.findNativeButton().getElement()).toHaveAccessibleName(
          'Remove actions, string equals John'
        );
        expect(editor.removeActions()!.findNativeButton().getElement()).toBeDisabled();

        expect(editor.addActions!.findNativeButton().getElement()).toHaveAccessibleName('Add filter actions');
        expect(editor.addActions!.findNativeButton().getElement()).toBeDisabled();
        expect(editor.addActions!.findMainAction()!.getElement()).toHaveTextContent('Add new filter');
      } else {
        expect(editor.removeActions()).toBe(null);
        expect(editor.addActions).toBe(null);
      }

      expect(editor.cancelButton.getElement()).toHaveTextContent('Cancel');
      expect(editor.submitButton.getElement()).toHaveTextContent('Apply');
    });

    test('token editor with two filters', () => {
      renderComponent(
        {
          enableTokenGroups: true,
          query: {
            operation: 'and',
            tokenGroups: [{ operation: 'or', tokens: [tokenJohn, tokenJane] }, tokenJack],
            tokens: [],
          },
        },
        withI18nProvider
      );
      const editor = openEditor(0, { expandToViewport: false, isMobile });

      expect(editor.propertyField().findControl()!.find('button')!.getElement()).toHaveAccessibleName(
        'Property string'
      );
      expect(editor.operatorField().findControl()!.find('button')!.getElement()).toHaveAccessibleName('Operator =');
      expect(editor.valueField().findControl()!.find('input')!.getElement()).toHaveAccessibleName('Value');
      expect(editor.valueField().findControl()!.find('input')!.getElement()).toHaveValue('John');

      expect(editor.propertyField(2).findControl()!.find('button')!.getElement()).toHaveAccessibleName(
        'Property string'
      );
      expect(editor.operatorField(2).findControl()!.find('button')!.getElement()).toHaveAccessibleName('Operator =');
      expect(editor.valueField(2).findControl()!.find('input')!.getElement()).toHaveAccessibleName('Value');
      expect(editor.valueField(2).findControl()!.find('input')!.getElement()).toHaveValue('Jane');

      expect(editor.removeActions()!.findNativeButton().getElement()).toHaveAccessibleName(
        'Remove actions, string equals John'
      );
      expect(editor.removeActionsRemove(1).getElement()).toHaveTextContent('Remove filter');
      expect(editor.removeActionsRemoveFromGroup(1, false).getElement()).toHaveTextContent('Remove filter from group');

      expect(editor.removeActions(2)!.findNativeButton().getElement()).toHaveAccessibleName(
        'Remove actions, string equals Jane'
      );
      expect(editor.removeActionsRemove(2).getElement()).toHaveTextContent('Remove filter');
      expect(editor.removeActionsRemoveFromGroup(2, false).getElement()).toHaveTextContent('Remove filter from group');

      expect(editor.addActions!.findMainAction()!.getElement()).toHaveTextContent('Add new filter');
      expect(editor.addActions!.findNativeButton().getElement()).toHaveAccessibleName('Add filter actions');
      editor.addActions!.openDropdown();
      expect(editor.addActions!.findItems()[0].getElement()).toHaveTextContent('Add filter string = Jack to group');
    });
  });
});

describe('token editor with groups', () => {
  beforeEach(() => {
    jest.mocked(useMobile).mockReturnValue(false);
  });

  function render(props: Partial<PropertyFilterProps>) {
    return renderComponent({ enableTokenGroups: true, ...props });
  }

  test('changes property name', () => {
    const onChange = jest.fn();
    render({
      query: { operation: 'and', tokens: [tokenJohn] },
      onChange,
    });
    const editor = openEditor(0, { expandToViewport: false });

    editor.propertySelect().openDropdown();
    editor.propertySelect().selectOptionByValue('other-string');
    editor.submitButton.click();

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          operation: 'and',
          tokenGroups: [{ propertyKey: 'other-string', operator: '=', value: null }],
          tokens: [],
        },
      })
    );
  });

  test('changes property operator', () => {
    const onChange = jest.fn();
    render({
      query: { operation: 'and', tokens: [tokenJohn] },
      onChange,
    });
    const editor = openEditor(0, { expandToViewport: false });

    editor.operatorSelect().openDropdown();
    editor.operatorSelect().selectOptionByValue('!=');
    editor.submitButton.click();

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          operation: 'and',
          tokenGroups: [{ propertyKey: 'string', operator: '!=', value: 'John' }],
          tokens: [],
        },
      })
    );
  });

  test('changes property value', () => {
    const onChange = jest.fn();
    render({
      query: { operation: 'and', tokens: [tokenJohn] },
      onChange,
    });
    const editor = openEditor(0, { expandToViewport: false });

    editor.valueAutosuggest().setInputValue('Jane');
    editor.submitButton.click();

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: { operation: 'and', tokenGroups: [tokenJane], tokens: [] },
      })
    );
  });

  test('removes first property', () => {
    const onChange = jest.fn();
    render({
      query: { operation: 'and', tokenGroups: [{ operation: 'or', tokens: [tokenJohn, tokenJane] }], tokens: [] },
      onChange,
    });
    const editor = openEditor(0, { expandToViewport: false });

    editor.removeActionsRemove(1).click();
    editor.submitButton.click();

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: { operation: 'and', tokenGroups: [tokenJane], tokens: [] },
      })
    );
  });

  test('removes second property', () => {
    const onChange = jest.fn();
    render({
      query: { operation: 'and', tokenGroups: [{ operation: 'or', tokens: [tokenJohn, tokenJane] }], tokens: [] },
      onChange,
    });
    const editor = openEditor(0, { expandToViewport: false });

    editor.removeActionsRemove(2).click();
    editor.submitButton.click();

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: { operation: 'and', tokenGroups: [tokenJohn], tokens: [] },
      })
    );
  });

  test('removes first property from group', () => {
    const onChange = jest.fn();
    render({
      query: { operation: 'and', tokenGroups: [{ operation: 'or', tokens: [tokenJohn, tokenJane] }], tokens: [] },
      onChange,
    });
    const editor = openEditor(0, { expandToViewport: false });

    editor.removeActionsRemoveFromGroup(1).click();
    editor.submitButton.click();

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: { operation: 'and', tokenGroups: [tokenJane, tokenJohn], tokens: [] },
      })
    );
  });

  test('adds new property', () => {
    const onChange = jest.fn();
    render({
      query: { operation: 'and', tokenGroups: [{ operation: 'or', tokens: [tokenJohn, tokenJane] }], tokens: [] },
      onChange,
    });
    const editor = openEditor(0, { expandToViewport: false });

    editor.addActions!.findMainAction()!.click();
    editor.submitButton.click();

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          operation: 'and',
          tokenGroups: [{ operation: 'or', tokens: [tokenJohn, tokenJane, { operator: ':', value: null }] }],
          tokens: [],
        },
      })
    );
  });

  test('adds new property from standalone', () => {
    const onChange = jest.fn();
    render({
      query: {
        operation: 'and',
        tokenGroups: [{ operation: 'or', tokens: [tokenJohn, tokenJane] }, tokenJack, tokenJohn],
        tokens: [],
      },
      onChange,
    });
    const editor = openEditor(0, { expandToViewport: false });

    editor.addActions!.openDropdown();
    editor.addActions!.findItems()[0].click();
    editor.submitButton.click();

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          operation: 'and',
          tokenGroups: [{ operation: 'or', tokens: [tokenJohn, tokenJane, tokenJack] }, tokenJohn],
          tokens: [],
        },
      })
    );
  });

  test('adds new property from standalone, modifies it, and removes from group', () => {
    const onChange = jest.fn();
    render({
      query: {
        operation: 'or',
        tokenGroups: [tokenJohn, tokenJane, tokenJack],
        tokens: [],
      },
      onChange,
    });

    // Open token Jane
    const editor = openEditor(1, { expandToViewport: false });

    // Add token John to the group and clear its value
    editor.addActions!.openDropdown();
    editor.addActions!.findItems()[0].click();
    editor.valueAutosuggest(2)!.findClearButton()!.click();

    // Cannot remove captured token but can remove from group
    expect(editor.removeActionsRemove(2).find('[role="menuitem"]')!.getElement()).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    editor.removeActionsRemoveFromGroup(2, false).click();

    editor.submitButton.click();

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          operation: 'or',
          tokenGroups: [tokenJohn, tokenJane, tokenJack],
          tokens: [],
        },
      })
    );
  });

  test('adds new property from standalone, modifies it, removes from group, and adds it back', () => {
    const onChange = jest.fn();
    render({
      query: {
        operation: 'or',
        tokenGroups: [tokenJohn, tokenJane, tokenJack],
        tokens: [],
      },
      onChange,
    });

    // Open token Jane
    const editor = openEditor(1, { expandToViewport: false });

    // Add token John to the group and clear its value
    editor.addActions!.openDropdown();
    editor.addActions!.findItems()[0].click();
    editor.valueAutosuggest(2)!.findClearButton()!.click();

    // Cannot remove captured token but can remove from group
    expect(editor.removeActionsRemove(2).find('[role="menuitem"]')!.getElement()).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    editor.removeActionsRemoveFromGroup(2, false).click();

    // Add token John to the group again
    editor.addActions!.openDropdown();
    editor.addActions!.findItems()[0].click();

    editor.submitButton.click();

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          operation: 'or',
          tokenGroups: [{ operation: 'and', tokens: [tokenJane, tokenJohn] }, tokenJack],
          tokens: [],
        },
      })
    );
  });

  test.each(['and', 'or'] as const)(
    'defines group operation as the opposite of query operation when a group is created, query operation=%s',
    operation => {
      const expectedGroupOperation = operation === 'and' ? 'or' : 'and';

      const onChange = jest.fn();
      render({
        query: { operation, tokenGroups: [tokenJohn], tokens: [] },
        onChange,
      });
      const editor = openEditor(0, { expandToViewport: false });

      editor.addActions!.findMainAction()!.click();
      editor.submitButton.click();

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: {
            operation,
            tokenGroups: [{ operation: expectedGroupOperation, tokens: [tokenJohn, { operator: ':', value: null }] }],
            tokens: [],
          },
        })
      );
    }
  );

  test('standalone property menu items have indices as IDs', () => {
    const onChange = jest.fn();
    render({
      query: {
        operation: 'and',
        tokenGroups: [tokenJohn, tokenJane, tokenJack],
        tokens: [],
      },
      onChange,
    });
    const editor = openEditor(0, { expandToViewport: false });

    editor.addActions!.openDropdown();
    expect(editor.addActions!.findItemById('0')!.getElement().textContent).toBe('Add filter string = Jane to group');
    expect(editor.addActions!.findItemById('0')!.find('[role="menuitem"]')!.getElement()).toHaveAttribute(
      'aria-label',
      'Add filter string equals Jane to group'
    );
    expect(editor.addActions!.findItemById('1')!.getElement().textContent).toBe('Add filter string = Jack to group');
    expect(editor.addActions!.findItemById('1')!.find('[role="menuitem"]')!.getElement()).toHaveAttribute(
      'aria-label',
      'Add filter string equals Jack to group'
    );
  });
});
