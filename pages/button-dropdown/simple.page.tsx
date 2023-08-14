// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import * as React from 'react';
import styles from './styles.scss';

import ButtonDropdown, { ButtonDropdownProps } from '~components/button-dropdown';
import ScreenshotArea from '../utils/screenshot-area';
import Button from '~components/button';
import Icon from '~components/icon';
import SpaceBetween from '~components/space-between';

const items: ButtonDropdownProps['items'] = [
  {
    id: 'id1',
    text: 'Option 1',
  },
  {
    id: 'id2',
    text: 'Link option with some longer text inside it',
    disabled: true,
    href: '#',
  },
  {
    id: 'id3',
    text: 'Option 3',
    href: '#',
    external: true,
    externalIconAriaLabel: '(opens in new tab)',
  },
  {
    id: 'id4',
    text: 'Option 4',
    disabled: true,
  },
  {
    id: 'id5',
    text: 'Option 5',
  },
  {
    id: 'id6',
    text: 'Option 6',
    disabled: true,
  },
];

const withNestedOptions: ButtonDropdownProps['items'] = [
  {
    text: 'Instances',
    items: [
      {
        id: '1',
        text: 'Destroy',
      },
      {
        id: '2',
        text: 'Restart',
      },
    ],
  },
  {
    id: 'id',
    text: 'SSH',
    disabled: true,
    items: [
      {
        id: '5',
        text: 'Destroy',
      },
      {
        id: '9',
        text: 'Restart',
      },
    ],
  },
];

const withExpandedGroups: ButtonDropdownProps['items'] = [
  {
    id: 'connect',
    text: 'Connect',
  },
  {
    id: 'password',
    text: 'Get password',
  },
  {
    id: 'states',
    text: 'Instance State',
    items: [
      {
        id: 'start',
        text: 'Start',
      },
      {
        id: 'stop',
        text: 'Stop',
        disabled: true,
      },
      {
        id: 'hibernate',
        text: 'Hibernate',
        disabled: true,
      },
      {
        id: 'reboot',
        text: 'Reboot',
        disabled: true,
      },
      {
        id: 'terminate',
        text: 'Terminate',
      },
      {
        id: 'external',
        text: 'Root Page',
        external: true,
        href: '/#/light/',
      },
    ],
  },
];

const withDisabledItems: ButtonDropdownProps['items'] = [
  {
    id: 'connect',
    text: 'Connect',
  },
  {
    id: 'troubleshoot',
    text: 'Monitoring and troubleshoot',
    disabled: true,
    items: [
      {
        id: 'screenshot',
        text: 'Get instance screenshot',
        disabled: true,
      },
      {
        id: 'serial',
        text: 'EC2 Serial console',
        disabled: true,
      },
    ],
  },
];

export default function ButtonDropdownPage() {
  return (
    <ScreenshotArea
      disableAnimations={true}
      style={{
        // extra space to include dropdown in the screenshot area
        paddingBottom: 100,
      }}
    >
      <article>
        <h1>Simple ButtonDropdown</h1>
        <div className={styles.container}>
          <ButtonDropdown id="ButtonDropdown1" items={items}>
            Two
          </ButtonDropdown>
          <ButtonDropdown id="ButtonDropdown2" items={items}>
            ButtonDropdowns
          </ButtonDropdown>
        </div>
        <div className={styles.container}>
          <ButtonDropdown id="ButtonDropdown3" items={withNestedOptions}>
            With nested options
          </ButtonDropdown>
        </div>
        <div className={styles.container}>
          <ButtonDropdown id="ButtonDropdown4" expandableGroups={true} items={withExpandedGroups}>
            With expandable groups
          </ButtonDropdown>
        </div>
        <div className={styles.container}>
          <ButtonDropdown id="ButtonDropdown5" items={items} disabled={true}>
            Disabled
          </ButtonDropdown>
        </div>
        <div className={styles.container}>
          <ButtonDropdown id="ButtonDropdown6" items={items} disabled={true} loading={true}>
            Disabled and loading
          </ButtonDropdown>
        </div>
        <div className={styles.container}>
          <ButtonDropdown id="ButtonDropdown7" variant="primary" items={items}>
            Primary dropdown
          </ButtonDropdown>
        </div>
        <div className={styles.container}>
          <ButtonDropdown id="ButtonDropdown8" expandableGroups={true} items={withDisabledItems}>
            With expandable groups and disabled items
          </ButtonDropdown>
        </div>

        <div className={styles['orion-styles']}>
          <h2>Marketing</h2>
          <SpaceBetween direction="horizontal" size="xxl">
            <SpaceBetween size="l">
              <span className={(styles.container, styles['custom-shadow-primary'])}>
                <ButtonDropdown id="ButtonDropdown9" variant="primary" items={items}>
                  Primary dropdown
                </ButtonDropdown>
              </span>
              <span className={(styles.container, styles['custom-shadow'])}>
                <ButtonDropdown id="ButtonDropdown10" items={withNestedOptions}>
                  With nested options
                </ButtonDropdown>
              </span>

              <span className={(styles.container, styles['custom-shadow'])}>
                <ButtonDropdown id="ButtonDropdown11" items={items} disabled={true}>
                  Disabled
                </ButtonDropdown>
              </span>
            </SpaceBetween>
            <SpaceBetween size="l">
              <span className={styles['custom-shadow-primary']}>
                <Button variant="primary">Primary button</Button>
              </span>
              <span className={styles['custom-shadow']}>
                <Button variant="normal">Secondary button</Button>
              </span>
              <span className={(styles['custom-shadow'], styles.disabled)}>
                <Button variant="normal" disabled={true}>
                  Disabled button
                </Button>
              </span>
              <span className={`orion-context-tertiary-button`}>
                <Button variant="normal">Tertiary button</Button>
              </span>
              <span className={styles['custom-shadow']}>
                <Button variant="normal">
                  Secondary button with icon{' '}
                  <span className={styles['button-icon-wrapper']}>
                    <Icon name="angle-right" />
                  </span>
                </Button>
              </span>
            </SpaceBetween>
          </SpaceBetween>
        </div>
      </article>
    </ScreenshotArea>
  );
}
