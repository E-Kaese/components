// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import { getBaseProps } from '../../base-component';
import { applyDisplayName } from '../../utils/apply-display-name';
import { ListViewProps } from './interfaces';
import InternalContainer from '../../../container/internal';
import styles from './styles.css.js';

const ListView = ({ header, footer, items, ...props }: ListViewProps) => {
  const baseProps = getBaseProps(props);

  return (
    <InternalContainer header={header} footer={footer} {...baseProps}>
      <div className={styles['list-grid']}>
        {items?.map((listItem, id) => (
          <div className={styles['list-item']} key={id}>
            {listItem}
          </div>
        ))}
      </div>
    </InternalContainer>
  );
};

applyDisplayName(ListView, 'ListView');
export default ListView;
