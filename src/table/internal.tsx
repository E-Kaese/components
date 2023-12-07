// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import clsx from 'clsx';
import React, { useCallback, useImperativeHandle, useRef } from 'react';
import { TableForwardRefType, TableProps } from './interfaces';
import { getVisualContextClassname } from '../internal/components/visual-context';
import InternalContainer, { InternalContainerProps } from '../container/internal';
import { getBaseProps } from '../internal/base-component';
import ToolsHeader from './tools-header';
import Thead, { TheadProps } from './thead';
import { TableBodyCell } from './body-cell';
import { supportsStickyPosition } from '../internal/utils/dom';
import { checkSortingState, getColumnKey, getItemKey, getVisibleColumnDefinitions, toContainerVariant } from './utils';
import { useRowEvents } from './use-row-events';
import { SelectionControl, focusMarkers, useSelectionFocusMove, useSelection } from './selection';
import { fireNonCancelableEvent } from '../internal/events';
import { isDevelopment } from '../internal/is-development';
import { ColumnWidthDefinition, ColumnWidthsProvider, DEFAULT_COLUMN_WIDTH } from './use-column-widths';
import { useScrollSync } from '../internal/hooks/use-scroll-sync';
import { ResizeTracker } from './resizer';
import styles from './styles.css.js';
import headerStyles from '../header/styles.css.js';
import { InternalBaseComponentProps } from '../internal/hooks/use-base-component';
import { useVisualRefresh } from '../internal/hooks/use-visual-mode';
import StickyHeader, { StickyHeaderRef } from './sticky-header';
import { useMergeRefs } from '../internal/hooks/use-merge-refs';
import useMouseDownTarget from '../internal/hooks/use-mouse-down-target';
import { useDynamicOverlap } from '../internal/hooks/use-dynamic-overlap';
import LiveRegion from '../internal/components/live-region';
import useTableFocusNavigation from './use-table-focus-navigation';
import { SomeRequired } from '../internal/types';
import { TableTdElement } from './body-cell/td-element';
import { useStickyColumns } from './sticky-columns';
import { StickyScrollbar } from './sticky-scrollbar';
import { checkColumnWidths } from './column-widths-utils';
import { useMobile } from '../internal/hooks/use-mobile';
import { useContainerQuery } from '@cloudscape-design/component-toolkit';
import { getTableRoleProps, getTableRowRoleProps, getTableWrapperRoleProps } from './table-role';
import { useCellEditing } from './use-cell-editing';
import { LinkDefaultVariantContext } from '../internal/context/link-default-variant-context';
import { CollectionLabelContext } from '../internal/context/collection-label-context';
import { useFunnelSubStep } from '../internal/analytics/hooks/use-funnel';
import { NoDataCell } from './node-data-cell';
import { usePerformanceMarks } from '../internal/hooks/use-performance-marks';
import InternalButton from '../button/internal';
import { ShowMoreCell } from './show-more-cell';

const SELECTION_COLUMN_WIDTH = 54;
const selectionColumnId = Symbol('selection-column-id');

type InternalTableProps<T> = SomeRequired<TableProps<T>, 'items' | 'selectedItems' | 'variant'> &
  InternalBaseComponentProps & {
    __funnelSubStepProps?: InternalContainerProps['__funnelSubStepProps'];
  };

export const InternalTableAsSubstep = React.forwardRef(
  <T,>(props: InternalTableProps<T>, ref: React.Ref<TableProps.Ref>) => {
    const { funnelSubStepProps } = useFunnelSubStep();

    const tableProps: InternalTableProps<T> = {
      ...props,
      __funnelSubStepProps: funnelSubStepProps,
    };

    return <InternalTable {...tableProps} ref={ref} />;
  }
) as TableForwardRefType;

const InternalTable = React.forwardRef(
  <T,>(
    {
      header,
      footer,
      empty,
      filter,
      pagination,
      preferences,
      items,
      columnDefinitions,
      trackBy,
      loading,
      loadingText,
      selectionType,
      selectedItems,
      isItemDisabled,
      ariaLabels,
      onSelectionChange,
      onSortingChange,
      sortingColumn,
      sortingDescending,
      sortingDisabled,
      visibleColumns,
      stickyHeader,
      stickyHeaderVerticalOffset,
      onRowClick,
      onRowContextMenu,
      wrapLines,
      stripedRows,
      stripedLevels,
      contentDensity,
      submitEdit,
      onEditCancel,
      resizableColumns,
      onColumnWidthsChange,
      variant,
      __internalRootRef,
      totalItemsCount,
      firstIndex,
      renderAriaLive,
      stickyColumns,
      columnDisplay,
      __funnelSubStepProps,
      getItemExpandable,
      getItemChildren,
      getItemExpanded,
      onExpandableItemToggle,
      getGroupIncomplete,
      onGroupShowMore,
      expandIconType,
      ...rest
    }: InternalTableProps<T>,
    ref: React.Ref<TableProps.Ref>
  ) => {
    const baseProps = getBaseProps(rest);
    stickyHeader = stickyHeader && supportsStickyPosition();
    const isMobile = useMobile();

    let allItems = items;
    const itemToLevel = new Map<T, number>();
    const itemToStatus = new Map<T, { parent: T }>();

    if (getItemChildren) {
      const visibleItems = new Array<T>();

      const traverse = (item: T, level = 1) => {
        itemToLevel.set(item, level);
        visibleItems.push(item);
        if (!getItemExpanded || getItemExpanded(item)) {
          const children = getItemChildren(item);
          children.forEach(child => traverse(child, level + 1));

          if (getGroupIncomplete && getGroupIncomplete(item)) {
            itemToStatus.set(children[children.length - 1], { parent: item });
          }
        }
      };

      items.forEach(item => traverse(item));

      allItems = visibleItems;
    }

    const getItemLevel = getItemChildren ? (item: T) => itemToLevel.get(item) ?? 1 : undefined;

    const [containerWidth, wrapperMeasureRef] = useContainerQuery<number>(rect => rect.contentBoxWidth);
    const wrapperRefObject = useRef(null);

    const [tableWidth, tableMeasureRef] = useContainerQuery<number>(rect => rect.contentBoxWidth);
    const tableRefObject = useRef(null);

    const secondaryWrapperRef = React.useRef<HTMLDivElement>(null);
    const theadRef = useRef<HTMLTableRowElement>(null);
    const stickyHeaderRef = React.useRef<StickyHeaderRef>(null);
    const scrollbarRef = React.useRef<HTMLDivElement>(null);
    const { cancelEdit, ...cellEditing } = useCellEditing({ onCancel: onEditCancel, onSubmit: submitEdit });

    usePerformanceMarks(
      'table',
      true,
      tableRefObject,
      () => {
        const headerText =
          toolsHeaderWrapper.current?.querySelector<HTMLElement>(`.${headerStyles['heading-text']}`)?.innerText ??
          toolsHeaderWrapper.current?.innerText;

        return {
          loading: loading ?? false,
          header: headerText,
        };
      },
      [loading]
    );

    useImperativeHandle(
      ref,
      () => ({
        scrollToTop: stickyHeaderRef.current?.scrollToTop || (() => undefined),
        cancelEdit,
      }),
      [cancelEdit]
    );

    const handleScroll = useScrollSync([wrapperRefObject, scrollbarRef, secondaryWrapperRef]);

    const { moveFocusDown, moveFocusUp, moveFocus } = useSelectionFocusMove(selectionType, allItems.length);
    const { onRowClickHandler, onRowContextMenuHandler } = useRowEvents({ onRowClick, onRowContextMenu });

    const visibleColumnDefinitions = getVisibleColumnDefinitions({
      columnDefinitions,
      columnDisplay,
      visibleColumns,
    });

    const { isItemSelected, getSelectAllProps, getItemSelectionProps, updateShiftToggle } = useSelection({
      items: allItems,
      trackBy,
      selectedItems,
      selectionType,
      isItemDisabled,
      onSelectionChange,
      ariaLabels,
      loading,
    });

    if (isDevelopment) {
      if (resizableColumns) {
        checkColumnWidths(columnDefinitions);
      }
      if (sortingColumn?.sortingComparator) {
        checkSortingState(columnDefinitions, sortingColumn.sortingComparator);
      }
    }

    const isVisualRefresh = useVisualRefresh();
    const computedVariant = isVisualRefresh
      ? variant
      : ['embedded', 'full-page'].indexOf(variant) > -1
      ? 'container'
      : variant;
    const hasHeader = !!(header || filter || pagination || preferences);
    const hasSelection = !!selectionType;
    const hasFooterPagination = isMobile && variant === 'full-page' && !!pagination;
    const hasFooter = !!footer || hasFooterPagination;

    const headerIdRef = useRef<string | undefined>(undefined);
    const isLabelledByHeader = !ariaLabels?.tableLabel && !!header;
    const setHeaderRef = useCallback((id: string) => {
      headerIdRef.current = id;
    }, []);

    const visibleColumnWidthsWithSelection: ColumnWidthDefinition[] = [];
    const visibleColumnIdsWithSelection: PropertyKey[] = [];
    if (hasSelection) {
      visibleColumnWidthsWithSelection.push({ id: selectionColumnId, width: SELECTION_COLUMN_WIDTH });
      visibleColumnIdsWithSelection.push(selectionColumnId);
    }
    for (let columnIndex = 0; columnIndex < visibleColumnDefinitions.length; columnIndex++) {
      const columnId = getColumnKey(visibleColumnDefinitions[columnIndex], columnIndex);
      visibleColumnWidthsWithSelection.push({ ...visibleColumnDefinitions[columnIndex], id: columnId });
      visibleColumnIdsWithSelection.push(columnId);
    }

    const stickyState = useStickyColumns({
      visibleColumns: visibleColumnIdsWithSelection,
      stickyColumnsFirst: (stickyColumns?.first ?? 0) + (stickyColumns?.first && hasSelection ? 1 : 0),
      stickyColumnsLast: stickyColumns?.last || 0,
    });

    const hasStickyColumns = !!((stickyColumns?.first ?? 0) + (stickyColumns?.last ?? 0) > 0);
    const hasEditableCells = !!columnDefinitions.find(col => col.editConfig);
    const tableRole = hasEditableCells ? 'grid-default' : 'table';

    const theadProps: TheadProps = {
      containerWidth,
      selectionType,
      getSelectAllProps,
      columnDefinitions: visibleColumnDefinitions,
      variant: computedVariant,
      wrapLines,
      resizableColumns,
      sortingColumn,
      sortingDisabled,
      sortingDescending,
      onSortingChange,
      onFocusMove: moveFocus,
      onResizeFinish(newWidth) {
        const widthsDetail = columnDefinitions.map(
          (column, index) => newWidth[getColumnKey(column, index)] || (column.width as number) || DEFAULT_COLUMN_WIDTH
        );
        const widthsChanged = widthsDetail.some((width, index) => columnDefinitions[index].width !== width);
        if (widthsChanged) {
          fireNonCancelableEvent(onColumnWidthsChange, { widths: widthsDetail });
        }
      },
      singleSelectionHeaderAriaLabel: ariaLabels?.selectionGroupLabel,
      resizerRoleDescription: ariaLabels?.resizerRoleDescription,
      stripedRows,
      stickyState,
      selectionColumnId,
      tableRole,
      getItemLevel,
    };

    const wrapperRef = useMergeRefs(wrapperRefObject, stickyState.refs.wrapper);
    const tableRef = useMergeRefs(tableMeasureRef, tableRefObject, stickyState.refs.table);

    const wrapperProps = getTableWrapperRoleProps({
      tableRole,
      isScrollable: !!(tableWidth && containerWidth && tableWidth > containerWidth),
      ariaLabel: ariaLabels?.tableLabel,
    });

    const getMouseDownTarget = useMouseDownTarget();

    const hasDynamicHeight = computedVariant === 'full-page';
    const overlapElement = useDynamicOverlap({ disabled: !hasDynamicHeight });
    const toolsHeaderWrapper = useRef<HTMLDivElement>(null);
    useTableFocusNavigation(selectionType, tableRefObject, visibleColumnDefinitions, items?.length);
    // If is mobile, we take into consideration the AppLayout's mobile bar and we subtract the tools wrapper height so only the table header is sticky
    const toolsHeaderHeight =
      (toolsHeaderWrapper?.current as HTMLDivElement | null)?.getBoundingClientRect().height ?? 0;

    let totalColumnsCount = selectionType ? visibleColumnDefinitions.length + 1 : visibleColumnDefinitions.length;
    totalColumnsCount = getItemLevel ? totalColumnsCount + 1 : totalColumnsCount;

    const rootShowMore = getGroupIncomplete ? getGroupIncomplete(null) : false;

    const getCollapsedIconName = () => {
      switch (expandIconType) {
        case 'tree':
          return 'treeview-expand';
        case 'angle':
          return 'angle-right';
        case 'caret':
          return 'caret-right-filled';

        default:
          return 'treeview-expand';
      }
    };

    const getExpandedIconName = () => {
      switch (expandIconType) {
        case 'tree':
          return 'treeview-collapse';
        case 'angle':
          return 'angle-down';
        case 'caret':
          return 'caret-down-filled';

        default:
          return 'treeview-collapse';
      }
    };

    const [rowLoading, setRowLoading] = React.useState<any>('');

    console.log(rowLoading);

    return (
      <LinkDefaultVariantContext.Provider value={{ defaultVariant: 'primary' }}>
        <ColumnWidthsProvider visibleColumns={visibleColumnWidthsWithSelection} resizableColumns={resizableColumns}>
          <InternalContainer
            {...baseProps}
            __internalRootRef={__internalRootRef}
            className={clsx(baseProps.className, styles.root)}
            __funnelSubStepProps={__funnelSubStepProps}
            header={
              <>
                {hasHeader && (
                  <div
                    ref={overlapElement}
                    className={clsx(hasDynamicHeight && [styles['dark-header'], 'awsui-context-content-header'])}
                  >
                    <div
                      ref={toolsHeaderWrapper}
                      className={clsx(styles['header-controls'], styles[`variant-${computedVariant}`])}
                    >
                      <CollectionLabelContext.Provider value={{ assignId: setHeaderRef }}>
                        <ToolsHeader
                          header={header}
                          filter={filter}
                          pagination={pagination}
                          preferences={preferences}
                        />
                      </CollectionLabelContext.Provider>
                    </div>
                  </div>
                )}
                {stickyHeader && (
                  <StickyHeader
                    ref={stickyHeaderRef}
                    variant={computedVariant}
                    theadProps={theadProps}
                    wrapperRef={wrapperRefObject}
                    theadRef={theadRef}
                    secondaryWrapperRef={secondaryWrapperRef}
                    tableRef={tableRefObject}
                    onScroll={handleScroll}
                    tableHasHeader={hasHeader}
                    contentDensity={contentDensity}
                    tableRole={tableRole}
                  />
                )}
              </>
            }
            disableHeaderPaddings={true}
            disableContentPaddings={true}
            variant={toContainerVariant(computedVariant)}
            __disableFooterPaddings={true}
            __disableFooterDivider={true}
            __disableStickyMobile={false}
            footer={
              hasFooter ? (
                <div className={clsx(styles['footer-wrapper'], styles[`variant-${computedVariant}`])}>
                  <div className={clsx(styles.footer, hasFooterPagination && styles['footer-with-pagination'])}>
                    {footer && <span>{footer}</span>}
                    {hasFooterPagination && <div className={styles['footer-pagination']}>{pagination}</div>}
                  </div>
                </div>
              ) : null
            }
            __stickyHeader={stickyHeader}
            __mobileStickyOffset={toolsHeaderHeight}
            __stickyOffset={stickyHeaderVerticalOffset}
            {...focusMarkers.root}
          >
            <div
              ref={wrapperRef}
              className={clsx(styles.wrapper, styles[`variant-${computedVariant}`], {
                [styles['has-footer']]: hasFooter,
                [styles['has-header']]: hasHeader,
              })}
              style={stickyState.style.wrapper}
              onScroll={handleScroll}
              {...wrapperProps}
            >
              <div className={styles['wrapper-content-measure']} ref={wrapperMeasureRef}></div>
              {!!renderAriaLive && !!firstIndex && (
                <LiveRegion>
                  <span>
                    {renderAriaLive({ totalItemsCount, firstIndex, lastIndex: firstIndex + items.length - 1 })}
                  </span>
                </LiveRegion>
              )}
              <table
                ref={tableRef}
                className={clsx(
                  styles.table,
                  resizableColumns && styles['table-layout-fixed'],
                  contentDensity === 'compact' && getVisualContextClassname('compact-table')
                )}
                {...getTableRoleProps({
                  tableRole,
                  totalItemsCount,
                  totalColumnsCount: totalColumnsCount,
                  ariaLabel: ariaLabels?.tableLabel,
                  ariaLabelledBy: isLabelledByHeader && headerIdRef.current ? headerIdRef.current : undefined,
                })}
              >
                <Thead
                  ref={theadRef}
                  hidden={stickyHeader}
                  onFocusedComponentChange={focusId => stickyHeaderRef.current?.setFocus(focusId)}
                  {...theadProps}
                />
                <tbody>
                  {loading || allItems.length === 0 ? (
                    <tr>
                      <NoDataCell
                        variant={variant}
                        containerWidth={containerWidth ?? 0}
                        totalColumnsCount={totalColumnsCount}
                        hasFooter={hasFooter}
                        loading={loading}
                        loadingText={loadingText}
                        empty={empty}
                        tableRef={tableRefObject}
                      />
                    </tr>
                  ) : (
                    allItems.map((item, rowIndex) => {
                      const firstVisible = rowIndex === 0;
                      const lastVisible = rowIndex === allItems.length - 1;
                      const isEven = rowIndex % 2 === 0;
                      const isSelected = !!selectionType && isItemSelected(item);
                      const isPrevSelected = !!selectionType && !firstVisible && isItemSelected(allItems[rowIndex - 1]);
                      const isNextSelected = !!selectionType && !lastVisible && isItemSelected(allItems[rowIndex + 1]);
                      const isExpanded = getItemExpanded
                        ? getItemExpanded(item)
                        : getItemLevel &&
                          allItems[rowIndex + 1] &&
                          getItemLevel(item) < getItemLevel(allItems[rowIndex + 1]);
                      const groupShowMore = itemToStatus.get(item);
                      return (
                        <>
                          <tr
                            key={getItemKey(trackBy, item, rowIndex)}
                            className={clsx(styles.row, isSelected && styles['row-selected'])}
                            onFocus={({ currentTarget }) => {
                              // When an element inside table row receives focus we want to adjust the scroll.
                              // However, that behaviour is unwanted when the focus is received as result of a click
                              // as it causes the click to never reach the target element.
                              if (!currentTarget.contains(getMouseDownTarget())) {
                                stickyHeaderRef.current?.scrollToRow(currentTarget);
                              }
                            }}
                            {...focusMarkers.item}
                            onClick={onRowClickHandler && onRowClickHandler.bind(null, rowIndex, item)}
                            onContextMenu={
                              onRowContextMenuHandler && onRowContextMenuHandler.bind(null, rowIndex, item)
                            }
                            {...getTableRowRoleProps({ tableRole, firstIndex, rowIndex })}
                          >
                            {selectionType !== undefined && (
                              <TableTdElement
                                className={clsx(styles['selection-control'])}
                                isVisualRefresh={isVisualRefresh}
                                isFirstRow={firstVisible}
                                isLastRow={lastVisible}
                                isSelected={isSelected}
                                isNextSelected={isNextSelected}
                                isPrevSelected={isPrevSelected}
                                wrapLines={false}
                                isEvenRow={isEven}
                                stripedRows={stripedRows}
                                stripedLevels={stripedLevels}
                                hasSelection={hasSelection}
                                hasFooter={hasFooter}
                                stickyState={stickyState}
                                columnId={selectionColumnId}
                                colIndex={0}
                                tableRole={tableRole}
                                isExpandCell={true}
                                level={getItemLevel ? getItemLevel(item) : 1}
                              >
                                <SelectionControl
                                  onFocusDown={moveFocusDown}
                                  onFocusUp={moveFocusUp}
                                  onShiftToggle={updateShiftToggle}
                                  {...getItemSelectionProps(item)}
                                />
                              </TableTdElement>
                            )}

                            {getItemLevel && (
                              <TableTdElement
                                className={clsx(styles['expand-cell'])}
                                isVisualRefresh={isVisualRefresh}
                                isFirstRow={firstVisible}
                                isLastRow={lastVisible}
                                isSelected={isSelected}
                                isNextSelected={isNextSelected}
                                isPrevSelected={isPrevSelected}
                                wrapLines={true}
                                isEvenRow={isEven}
                                stripedRows={stripedRows}
                                stripedLevels={stripedLevels}
                                hasSelection={hasSelection}
                                hasFooter={hasFooter}
                                stickyState={stickyState}
                                columnId="expand-column-id"
                                colIndex={-1}
                                tableRole={tableRole}
                                level={getItemLevel(item)}
                                isExpandCell={true}
                              >
                                {getItemExpandable?.(item) ? (
                                  <span style={{ marginLeft: '0px' }}>
                                    <InternalButton
                                      variant="icon"
                                      iconName={isExpanded ? getExpandedIconName() : getCollapsedIconName()}
                                      onClick={() => fireNonCancelableEvent(onExpandableItemToggle, { item })}
                                      ariaLabel="row expand"
                                    />
                                  </span>
                                ) : null}
                              </TableTdElement>
                            )}

                            {visibleColumnDefinitions.map((column, colIndex) => {
                              const isEditing = cellEditing.checkEditing({ rowIndex, colIndex });
                              const successfulEdit = cellEditing.checkLastSuccessfulEdit({ rowIndex, colIndex });
                              const isEditable = !!column.editConfig && !cellEditing.isLoading;
                              return (
                                <TableBodyCell
                                  key={getColumnKey(column, colIndex)}
                                  style={
                                    resizableColumns
                                      ? {}
                                      : {
                                          width: column.width,
                                          minWidth: column.minWidth,
                                          maxWidth: column.maxWidth,
                                        }
                                  }
                                  ariaLabels={ariaLabels}
                                  column={column}
                                  item={item}
                                  wrapLines={wrapLines}
                                  isEditable={isEditable}
                                  isEditing={isEditing}
                                  isRowHeader={column.isRowHeader}
                                  isFirstRow={firstVisible}
                                  isLastRow={lastVisible}
                                  isSelected={isSelected}
                                  isNextSelected={isNextSelected}
                                  isPrevSelected={isPrevSelected}
                                  successfulEdit={successfulEdit}
                                  onEditStart={() => cellEditing.startEdit({ rowIndex, colIndex })}
                                  onEditEnd={editCancelled =>
                                    cellEditing.completeEdit({ rowIndex, colIndex }, editCancelled)
                                  }
                                  submitEdit={cellEditing.submitEdit}
                                  hasFooter={hasFooter}
                                  stripedRows={stripedRows}
                                  stripedLevels={stripedLevels}
                                  isEvenRow={isEven}
                                  columnId={column.id ?? colIndex}
                                  colIndex={selectionType !== undefined ? colIndex + 1 : colIndex}
                                  stickyState={stickyState}
                                  isVisualRefresh={isVisualRefresh}
                                  tableRole={tableRole}
                                  level={getItemLevel ? getItemLevel(item) : 1}
                                  isExpandCell={colIndex === 0}
                                />
                              );
                            })}
                          </tr>

                          {groupShowMore && getItemLevel ? (
                            <tr key={getItemKey(trackBy, item, rowIndex) + '-loader'}>
                              <ShowMoreCell
                                variant={variant}
                                containerWidth={containerWidth ?? 0}
                                totalColumnsCount={totalColumnsCount}
                                hasFooter={hasFooter}
                                loading={loading}
                                loadingText={loadingText}
                                stripedRows={stripedRows}
                                stripedLevels={stripedLevels}
                                isEvenRow={isEven}
                                empty={
                                  <InternalButton
                                    variant="inline-link"
                                    loading={rowLoading === groupShowMore.parent}
                                    onClick={() => {
                                      setRowLoading(groupShowMore.parent);
                                      setTimeout(() => {
                                        fireNonCancelableEvent(onGroupShowMore, { item: groupShowMore.parent });
                                        setRowLoading('');
                                      }, 1000);
                                    }}
                                  >
                                    Show more
                                  </InternalButton>
                                }
                                tableRef={tableRefObject}
                                level={getItemLevel(item)}
                                hasSelection={selectionType !== undefined}
                              />
                            </tr>
                          ) : null}
                        </>
                      );
                    })
                  )}

                  {rootShowMore ? (
                    <tr key="root-loader">
                      <ShowMoreCell
                        variant={variant}
                        containerWidth={containerWidth ?? 0}
                        totalColumnsCount={totalColumnsCount}
                        hasFooter={hasFooter}
                        loading={loading}
                        loadingText={loadingText}
                        stripedRows={stripedRows}
                        stripedLevels={stripedLevels}
                        isEvenRow={false}
                        empty={
                          <InternalButton
                            variant="inline-link"
                            loading={rowLoading === `${rootShowMore}`}
                            onClick={() => {
                              setRowLoading(`${rootShowMore}`);
                              setTimeout(() => {
                                fireNonCancelableEvent(onGroupShowMore, { item: null });
                                setRowLoading('');
                              }, 1000);
                            }}
                          >
                            Show more
                          </InternalButton>
                        }
                        tableRef={tableRefObject}
                      />
                    </tr>
                  ) : null}
                </tbody>
              </table>
              {resizableColumns && <ResizeTracker />}
            </div>

            <StickyScrollbar
              ref={scrollbarRef}
              wrapperRef={wrapperRefObject}
              tableRef={tableRefObject}
              onScroll={handleScroll}
              hasStickyColumns={hasStickyColumns}
            />
          </InternalContainer>
        </ColumnWidthsProvider>
      </LinkDefaultVariantContext.Provider>
    );
  }
) as TableForwardRefType;

export default InternalTable;
