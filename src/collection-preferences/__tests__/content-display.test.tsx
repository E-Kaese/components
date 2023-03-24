// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { renderCollectionPreferences } from './shared';
import { CollectionPreferencesProps } from '../../../lib/components';
import ContentDisplayPreferenceWrapper from '../../../lib/components/test-utils/dom/collection-preferences/content-display-preference';
import dragHandleStyles from '../../../lib/components/internal/drag-handle/styles.css.js';

describe('Content display', () => {
  it('correctly displays title', () => {
    const wrapper = renderContentDisplay({});
    const titleElement = wrapper.findTitle().getElement();
    expect(titleElement).toHaveTextContent('Content display title');
    expect(titleElement.tagName).toBe('H3');
  });

  it('correctly displays label', () => {
    const wrapper = renderContentDisplay({});
    const labelElement = wrapper.findLabel().getElement();
    expect(labelElement).toHaveTextContent('Content display label');
  });

  it('displays list of options with correct semantics', () => {
    const wrapper = renderContentDisplay({});
    const items = wrapper.findOptions();
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const element = item.getElement();
      expect(element.tagName).toBe('LI');
      expect(element.parentElement!.tagName).toBe('UL');
      expectLabel(wrapper, element, `Item ${i + 1}`);
      const dragHandle = item.find(`.${dragHandleStyles.handle}`)!.getElement();
      expectLabel(wrapper, dragHandle, 'Drag handle');
    }
  });
});

const contentDisplayPreference: CollectionPreferencesProps.ContentDisplayPreference = {
  title: 'Content display title',
  label: 'Content display label',
  options: [
    { id: 'id1', label: 'Item 1', editable: false },
    { id: 'id2', label: 'Item 2' },
    { id: 'id3', label: 'Item 3' },
    { id: 'id4', label: 'Item 4' },
  ],
  dragHandleAriaLabel: 'Drag handle',
};

function renderContentDisplay(props: Partial<CollectionPreferencesProps> = {}) {
  const collectionPreferencesWrapper = renderCollectionPreferences({ contentDisplayPreference, ...props });
  collectionPreferencesWrapper.findTriggerButton().click();
  return collectionPreferencesWrapper.findModal()!.findContentDisplayPreference()!;
}

function expectLabel(wrapper: ContentDisplayPreferenceWrapper, element: HTMLElement, label: string) {
  const labelAttribute = element.getAttribute('aria-label');
  if (labelAttribute === label) {
    return;
  }
  const labelledBy = element.getAttribute('aria-labelledby');
  expect(labelledBy).toBeTruthy();
  const labelElement = wrapper.find(`#${labelledBy}`);
  expect(labelElement!.getElement()).toHaveTextContent(label);
}
