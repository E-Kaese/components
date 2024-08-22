// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React, { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

import { useContainerQuery } from '@cloudscape-design/component-toolkit';
import { getAnalyticsMetadataAttribute } from '@cloudscape-design/component-toolkit/internal/analytics-metadata';

import { InternalButton } from '../button/internal';
import { CustomTriggerProps, LinkItem } from '../button-dropdown/interfaces';
import InternalButtonDropdown from '../button-dropdown/internal';
import { useInternalI18n } from '../i18n/context';
import InternalIcon from '../icon/internal';
import { getBaseProps } from '../internal/base-component';
import { fireCancelableEvent } from '../internal/events';
import { useMergeRefs } from '../internal/hooks/use-merge-refs';
import { checkSafeUrl } from '../internal/utils/check-safe-url';
import { createWidgetizedComponent } from '../internal/widgets';
import {
  GeneratedAnalyticsMetadataBreadcrumbGroupClick,
  GeneratedAnalyticsMetadataBreadcrumbGroupComponent,
} from './analytics-metadata/interfaces';
import { BreadcrumbGroupProps, EllipsisDropdownProps, InternalBreadcrumbGroupProps } from './interfaces';
import { BreadcrumbItem } from './item/item';
import { getEventDetail } from './utils';

import analyticsSelectors from './analytics-metadata/styles.css.js';
import styles from './styles.css.js';

/**
 * Provided for backwards compatibility
 */
const DEFAULT_EXPAND_ARIA_LABEL = 'Show path';

const getDropdownTrigger = ({
  ariaLabel,
  triggerRef,
  disabled,
  testUtilsClass,
  isOpen,
  onClick,
}: CustomTriggerProps) => {
  return (
    <InternalButton
      ref={triggerRef}
      className={testUtilsClass}
      disabled={disabled}
      onClick={event => {
        event.preventDefault();
        onClick();
      }}
      ariaExpanded={isOpen}
      aria-haspopup={true}
      ariaLabel={ariaLabel}
      variant="breadcrumb-group"
      formAction="none"
    >
      ...
    </InternalButton>
  );
};

const EllipsisDropdown = ({
  ariaLabel,
  dropdownItems,
  onDropdownItemClick,
  onDropdownItemFollow,
}: EllipsisDropdownProps) => {
  const i18n = useInternalI18n('breadcrumb-group');

  return (
    <li className={styles.ellipsis}>
      <InternalButtonDropdown
        ariaLabel={i18n('expandAriaLabel', ariaLabel) ?? DEFAULT_EXPAND_ARIA_LABEL}
        items={dropdownItems}
        onItemClick={onDropdownItemClick}
        onItemFollow={onDropdownItemFollow}
        customTriggerBuilder={getDropdownTrigger}
        analyticsMetadataTransformer={metadata => {
          if (metadata.detail?.id) {
            delete metadata.detail.id;
          }
          if (metadata.detail?.position) {
            metadata.detail.position = `${parseInt(metadata.detail.position as string, 10) + 1}`;
          }
          return metadata;
        }}
      />
      <span className={styles.icon}>
        <InternalIcon name="angle-right" />
      </span>
    </li>
  );
};

const getDisplayOptionsWithItemsWidths = (
  itemsWidths: Array<number>,
  navWidth: number | null,
  minBreadcrumbWidth: number
) => {
  const shrinkFactors = itemsWidths.map(width => (width < minBreadcrumbWidth ? 0 : Math.round(width)));
  const minWidths = itemsWidths.map(width => (width < minBreadcrumbWidth ? 0 : minBreadcrumbWidth));
  const collapsedWidths = itemsWidths.map(width => Math.min(width, minBreadcrumbWidth));
  let collapsed = 0;
  if (navWidth && itemsWidths.length > 2) {
    collapsed = itemsWidths.length - 2;
    let remainingWidth = navWidth - collapsedWidths[0] - collapsedWidths[itemsWidths.length - 1] - 50;
    let j = 1;
    while (remainingWidth > 0 && j < itemsWidths.length - 1) {
      remainingWidth -= collapsedWidths[itemsWidths.length - 1 - j];
      j++;
      if (remainingWidth > 0) {
        collapsed--;
      }
    }
  }
  return {
    shrinkFactors,
    minWidths,
    collapsed,
  };
};

export function BreadcrumbGroupImplementation<T extends BreadcrumbGroupProps.Item = BreadcrumbGroupProps.Item>({
  items = [],
  ariaLabel,
  expandAriaLabel,
  onClick,
  onFollow,
  __internalRootRef,
  __injectAnalyticsComponentMetadata,
  minBreadcrumbWidth = 120,
  ...props
}: InternalBreadcrumbGroupProps<T>) {
  for (const item of items) {
    checkSafeUrl('BreadcrumbGroup', item.href);
  }
  const baseProps = getBaseProps(props);
  const [navWidth, navRef] = useContainerQuery<number>(rect => rect.contentBoxWidth);
  const mergedRef = useMergeRefs(navRef, __internalRootRef);

  const itemsRefNew = useRef<Record<string, HTMLLIElement>>({});

  const setBreadcrumb = (index: string, node: null | HTMLLIElement) => {
    if (node) {
      itemsRefNew.current[index] = node;
    } else {
      delete itemsRefNew.current[index];
    }
  };

  const [itemsWidths, setItemsWidths] = useState<Array<number>>([]);

  useEffect(() => {
    if (itemsRefNew.current) {
      const localItemsWidths = [];
      for (const node of Object.entries(itemsRefNew.current)) {
        localItemsWidths.push(node[1].getBoundingClientRect().width);
      }
      if (JSON.stringify(itemsWidths) !== JSON.stringify(localItemsWidths)) {
        setItemsWidths(localItemsWidths);
      }
    }
  }, [itemsWidths]);

  const { shrinkFactors, minWidths, collapsed } = getDisplayOptionsWithItemsWidths(
    itemsWidths,
    navWidth,
    minBreadcrumbWidth
  );
  const displayDropdown = collapsed > 0;

  let breadcrumbItems = items.map((item, index) => {
    const isLast = index === items.length - 1;

    const clickAnalyticsMetadata: GeneratedAnalyticsMetadataBreadcrumbGroupClick = {
      action: 'click',
      detail: {
        position: `${index + 1}`,
        label: `.${analyticsSelectors['breadcrumb-item']}`,
        href: item.href || '',
      },
    };
    return (
      <li
        className={styles.item}
        key={index}
        {...(isLast ? {} : getAnalyticsMetadataAttribute(clickAnalyticsMetadata))}
        style={{ flexShrink: shrinkFactors[index], minWidth: `${minWidths[index]}px` }}
      >
        <BreadcrumbItem
          item={item}
          onClick={onClick}
          onFollow={onFollow}
          isCompressed={true}
          isLast={isLast}
          isDisplayed={index === 0 || index > collapsed}
        />
      </li>
    );
  });

  const hiddenBreadcrumbItems = items.map((item, index) => {
    const isLast = index === items.length - 1;
    return (
      <li className={styles.item} key={index} ref={node => setBreadcrumb(`${index}`, node)}>
        <BreadcrumbItem
          item={item}
          onClick={onClick}
          onFollow={onFollow}
          isCompressed={false}
          isLast={isLast}
          isDisplayed={true}
        />
      </li>
    );
  });

  const getEventItem = (e: CustomEvent<{ id: string }>) => {
    const { id } = e.detail;
    return items[parseInt(id)];
  };

  // Add ellipsis
  if (collapsed > 0) {
    const dropdownItems: Array<LinkItem> = items
      .slice(1, 1 + collapsed)
      .map((item: BreadcrumbGroupProps.Item, index: number) => ({
        id: (index + 1).toString(), // the first item doesn't get inside dropdown
        text: item.text,
        href: item.href || '#',
      }));

    breadcrumbItems = [
      breadcrumbItems[0],
      <EllipsisDropdown
        key={'ellipsis'}
        ariaLabel={expandAriaLabel}
        dropdownItems={dropdownItems}
        onDropdownItemClick={e => fireCancelableEvent(onClick, getEventDetail(getEventItem(e)), e)}
        onDropdownItemFollow={e => fireCancelableEvent(onFollow, getEventDetail(getEventItem(e)), e)}
      />,
      ...breadcrumbItems.slice(1 + collapsed),
    ];
  }

  const componentAnalyticsMetadata: GeneratedAnalyticsMetadataBreadcrumbGroupComponent = {
    name: 'awsui.BreadcrumbGroup',
    label: { root: 'self' },
  };

  return (
    <nav
      {...baseProps}
      className={clsx(
        styles['breadcrumb-group'],
        displayDropdown && styles.mobile,
        items.length <= 2 && styles['mobile-short'],
        baseProps.className
      )}
      aria-label={ariaLabel || undefined}
      ref={mergedRef}
      {...(__injectAnalyticsComponentMetadata
        ? {
            ...getAnalyticsMetadataAttribute({
              component: componentAnalyticsMetadata,
            }),
          }
        : {})}
    >
      <ol className={styles['breadcrumb-group-list']}>{breadcrumbItems}</ol>
      <ol className={styles['breadcrumb-group-list']} style={{ flexWrap: 'wrap', position: 'absolute', left: 900000 }}>
        {hiddenBreadcrumbItems}
      </ol>
    </nav>
  );
}

export const createWidgetizedBreadcrumbGroup = createWidgetizedComponent(BreadcrumbGroupImplementation);
