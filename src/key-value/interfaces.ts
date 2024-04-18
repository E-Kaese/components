// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { BaseComponentProps } from '../internal/base-component';
import React from 'react';

export namespace KeyValueProps {
  /**
   * A single key-value pair. Does not include any config for layout.
   * Recommended to wrap in the `KeyValueList` or `KeyValueGroup` components to ensure a parent <dl> element is included.
   * If you have an ungrouped list of key-value pairs, use the `KeyValueList` component to auto format the list into columns.
   * If you have key-value pairs already categorized in groups with or without titles, use the `KeyValueGroup` component, along with `ColumnLayout` to format the pair lists into columns.
   */
  export interface Pair {
    /**
     * The key label which is rendered in a <dt> element.
     * Do not set this property if you want to display a progress bar.
     * Use the `label` property of the progress bar component that you provide as a `value` for the pair.
     */
    label?: React.ReactNode;
    /**
     * Area next to the label for optional info link.
     */
    info?: React.ReactNode;
    /**
     * The value of the pair, which is rendered in a <dd> element. If left undefined, will render empty state "-".
     */
    value?: React.ReactNode;
    /**
     * A label to provide additional meaning to the empty state value.
     */
    emptyStateAriaLabel?: string;
  }

  /**
   * A single defintion list element.
   * Includes an optional title for the group.
   * Use if you have categorized groups of key-value pairs.
   * It is suggested to then wrap the `KeyValueGroup`s in a `ColumnLayout` component, to format the lists into columns.
   */
  export interface Group {
    /**
     * Optional title for the key value group. If a string is provided, it will be rendered as an h3 element.
     */
    title?: React.ReactNode;
    /**
     * * Each pair contains:
     * * `label`: (React.ReactNode) - (Optional) The key label.
     *            Do not set this property if you want to display a progress bar.
     *            Use the `label` property of the progress bar component that you provide as a `value` for the pair.
     * * `value`: (React.ReactNode) Value of the pair.
     */
    pairs: ReadonlyArray<KeyValueProps.Pair>;
  }

  /**
   * Auto formats a flat list of key-value pairs into a single <dl> element.
   * Will choose the most balanced column arrangement based on the number of pairs provided, as well as the available space.
   */
  export interface List extends BaseComponentProps {
    /**
     * Flat list of ungrouped key-value pairs.
     */
    pairs: ReadonlyArray<KeyValueProps.Pair>;
    /**
     * Whether to display dividers between columns. Defaults to true.
     */
    columnDividers?: boolean;
  }
}
