// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { BaseComponentProps } from '../../base-component';

export interface ListViewProps extends BaseComponentProps {
  /**
   * Adds `aria-label` to the component.
   */
  ariaLabel?: string;

  /**
   * Array of items to be rendered
   */
  items: any[];

  /**
   * @param item
   * @param index
   *
   * @example
   * ```
   * renderItem={(item, index) => {
   *   const { title, description } = item;
   *   return (
   *     <ExploreItem
   *       key={title}
   *       title={title}
   *       description={description}
   *     />
   *   );
   * }}
   * ```
   */
  renderItem: (item: any, index: number) => JSX.Element;

  /**
   * Adapts the HTML tag or ARIA role to provide semantic meaning to content
   * "navigation": for a list containing a collection of navigational elements (usually links) for navigating the document or related documents.
   * "menu": for a list of common actions or functions that the user can invoke
   */
  role?: 'navigation' | 'menu' | 'orderedList' | 'unorderedList' | 'list';

  /**
   * Heading element of the list view container. Use the [header component](/components/header/).
   */
  header?: React.ReactNode;

  /**
   * Footer of the list view.
   */
  footer?: React.ReactNode;

  /**
   * Specifies the number of columns in each grid row.
   * When `minColumnWidth` is not set, only up to 4 columns are supported.
   */
  columns?: number | undefined;

  /**
   * Use together with `columns` to specify the desired minimum width for each column in pixels.
   *
   * The number of columns is determined by the value of this property, the available space,
   * and the maximum number of columns as defined by the `columns` property.
   */
  minColumnWidth?: number | undefined;
}
