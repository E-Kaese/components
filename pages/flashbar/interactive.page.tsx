// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import * as React from 'react';
import { useContext, useState } from 'react';
import { range } from 'lodash';
import { Box, Button, SpaceBetween, Flashbar, FlashbarProps, Toggle } from '~components';
import { generateItem, i18nStrings } from './common';
import ScreenshotArea from '../utils/screenshot-area';
import AppContext, { AppContextType } from '../app/app-context';

type DemoContext = React.Context<AppContextType<{ stackItems: boolean }>>;

export default function InteractiveFlashbar() {
  const { urlParams, setUrlParams } = useContext(AppContext as DemoContext);
  const dismiss = (index: string) => {
    setItems(items => items.filter(item => item.id !== index));
  };

  const add = (type: FlashbarProps.Type, hasHeader = false) => {
    const newItem = generateItem({ type, dismiss, hasHeader });
    setItems(items => [newItem, ...items]);
  };

  const addMultiple = (type: FlashbarProps.Type, hasHeader = false, amount: number) => {
    for (const i of range(amount)) {
      setTimeout(() => {
        add(type, hasHeader);
      }, i * 100);
    }
  };

  const addToBottom = (type: FlashbarProps.Type, hasHeader = false) => {
    const newItem = generateItem({ type, dismiss, hasHeader });
    setItems(items => [...items, newItem]);
  };

  const removeAndAddToBottom = (type: FlashbarProps.Type, hasHeader = false) => {
    const newItem = generateItem({ type, dismiss, hasHeader });
    setItems(items => [newItem, ...items.slice(1, items.length)]);
  };

  const initialItems = [
    generateItem({ type: 'success', dismiss, hasHeader: true, initial: true, id: '4' }),
    generateItem({ type: 'info', dismiss, hasHeader: true, initial: false, id: '3' }),
    generateItem({ type: 'error', dismiss, hasHeader: true, initial: false, id: '2' }),
    generateItem({ type: 'info', dismiss, hasHeader: false, initial: false, id: '1' }),
    generateItem({ type: 'info', dismiss, hasHeader: false, initial: false, id: '0' }),
  ];

  const [items, setItems] = useState(initialItems);

  return (
    <>
      <h1>Flashbar interactions test</h1>
      <SpaceBetween size="xs">
        <Toggle checked={urlParams.stackItems} onChange={({ detail }) => setUrlParams({ stackItems: detail.checked })}>
          <span data-id="stack-items">Stack items</span>
        </Toggle>
        <SpaceBetween direction="horizontal" size="xs">
          <Button data-id="add-info" onClick={() => add('info', true)}>
            Add Info Flash
          </Button>
          <Button onClick={() => add('success')}>Add Success Flash</Button>
          <Button data-id="add-error" onClick={() => add('error', true)}>
            Add Error Flash
          </Button>
          <Button data-id="add-multiple" onClick={() => addMultiple('error', true, 3)}>
            Add Multiple Error Flashes
          </Button>
          <Button onClick={() => add('warning')}>Add Warning Flash</Button>
          <Button data-id="add-error-to-bottom" onClick={() => addToBottom('error')}>
            Add To Bottom
          </Button>
          <Button onClick={() => removeAndAddToBottom('error')}>Add And Remove</Button>
        </SpaceBetween>
        <ScreenshotArea>
          <Box padding="xxl">
            <Flashbar items={items} stackItems={urlParams.stackItems} i18nStrings={i18nStrings} />
          </Box>
        </ScreenshotArea>
      </SpaceBetween>
    </>
  );
}
