// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import { getBaseProps } from '../../base-component';
import { applyDisplayName } from '../../utils/apply-display-name';
import { ListViewProps } from './interfaces';
import InternalContainer from '../../../container/internal';
import InternalColumnLayout from '../../../column-layout/internal';
import styles from './styles.css.js';

const ListView = ({
  ariaLabel,
  columns,
  footer,
  header,
  items,
  minColumnWidth,
  renderItem,
  role = 'list',
  ...props
}: ListViewProps) => {
  const baseProps = getBaseProps(props);

  let itemRole: 'listitem' | 'menuitem' | undefined;
  if (role === 'list') {
    itemRole = 'listitem';
  }
  if (role === 'menu') {
    itemRole = 'menuitem';
  }

  const Tag = role === 'orderedList' ? 'ol' : role === 'unorderedList' ? 'ul' : 'div';
  const needsRole = Tag !== 'ol' && Tag !== 'ul' && !!role;
  const ItemTag = Tag === 'ol' || Tag === 'ul' ? 'li' : 'div';

  return (
    <InternalContainer className={styles.list} header={header} footer={footer} {...baseProps}>
      <Tag className={styles.list} {...(needsRole ? { role } : {})} aria-label={ariaLabel}>
        <InternalColumnLayout columns={columns || 4} minColumnWidth={minColumnWidth} borders="horizontal">
          {items.map((item, index) => {
            return (
              <ItemTag className={styles['list-item']} key={index} role={itemRole ? 'presentation' : undefined}>
                {renderItem(item, index)}
              </ItemTag>
            );
          })}
        </InternalColumnLayout>
      </Tag>
    </InternalContainer>
  );
};

applyDisplayName(ListView, 'ListView');
export default ListView;
