// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import clsx from 'clsx';
import React, { useEffect, useRef, useState } from 'react';
import InternalIcon from '../icon/internal';
import { fireNonCancelableEvent } from '../internal/events';
import { getBaseProps } from '../internal/base-component';
import styles from './styles.css.js';
import { getPaginationState, range } from './utils';
import { InternalBaseComponentProps } from '../internal/hooks/use-base-component';
import { FramePaginationProps } from './interfaces';
import { useInternalI18n } from '../internal/i18n/context';
import InternalBox from '../box/internal';

const defaultAriaLabels: Required<FramePaginationProps.Labels> = {
  nextPageLabel: '',
  paginationLabel: '',
  previousPageLabel: '',
  pageLabel: pageNumber => `${pageNumber}`,
};

interface PageButtonProps {
  className?: string;
  ariaLabel: string;
  disabled?: boolean;
  pageIndex: number;
  isCurrent?: boolean;
  children?: React.ReactNode;
  onClick: (requestedIndex: number) => void;
}

function PageButton({
  className,
  ariaLabel,
  disabled,
  pageIndex,
  isCurrent = false,
  children,
  onClick,
}: PageButtonProps) {
  function handleClick(event: React.MouseEvent) {
    event.preventDefault();
    onClick(pageIndex);
  }
  return (
    <li className={styles['page-item']}>
      <button
        className={clsx(
          className,
          styles.button,
          disabled && styles['button-disabled'],
          isCurrent && styles['button-current']
        )}
        type="button"
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={handleClick}
        aria-current={isCurrent}
      >
        {children}
      </button>
    </li>
  );
}

function PageNumber({ pageIndex, ...rest }: PageButtonProps) {
  return (
    <PageButton className={styles['page-number']} pageIndex={pageIndex} {...rest}>
      {pageIndex}
    </PageButton>
  );
}

type InternalFramePaginationProps = FramePaginationProps & InternalBaseComponentProps;

export default function InternalFramePagination({
  openEnd,
  frameStart,
  frameSize,
  totalItems,
  ariaLabels,
  disabled,
  onChange,
  onNextPageClick,
  onPreviousPageClick,
  __internalRootRef = null,
  ...rest
}: InternalFramePaginationProps) {
  const baseProps = getBaseProps(rest);

  const i18n = useInternalI18n('frame-pagination');

  const nextPageLabel = i18n('ariaLabels.nextPageLabel', ariaLabels?.nextPageLabel) ?? defaultAriaLabels.nextPageLabel;
  const paginationLabel =
    i18n('ariaLabels.paginationLabel', ariaLabels?.paginationLabel) ?? defaultAriaLabels.paginationLabel;
  const previousPageLabel =
    i18n('ariaLabels.previousPageLabel', ariaLabels?.previousPageLabel) ?? defaultAriaLabels.previousPageLabel;
  const pageNumberLabelFn =
    i18n('ariaLabels.pageLabel', ariaLabels?.pageLabel, format => pageNumber => format({ pageNumber })) ??
    defaultAriaLabels.pageLabel;

  const paginationRef = useRef<HTMLDivElement>(null);
  const [frameOffset, setFrameOffset] = useState(0);

  const pagesCount = Math.ceil(totalItems / frameSize);

  const indexBefore = Math.floor(frameStart / frameSize);
  const indexAfter = indexBefore + 1;
  const indexClosest =
    frameStart - indexBefore * frameSize <= indexAfter * frameSize - frameStart ? indexBefore : indexAfter;

  function handlePrevPageClick() {
    fireNonCancelableEvent(onPreviousPageClick);
  }

  function handleNextPageClick() {
    fireNonCancelableEvent(onNextPageClick);
  }

  function handlePageClick(requestedPageIndex: number) {
    fireNonCancelableEvent(onChange, { frameStart: (requestedPageIndex - 1) * frameSize });
  }

  useEffect(() => {
    if (!paginationRef.current) {
      return;
    }
    const closestEl = paginationRef.current.querySelector(`button[aria-label="${indexClosest + 1}"]`)!;
    const closestElOffset = closestEl.getBoundingClientRect().x - paginationRef.current.getBoundingClientRect().x;
    const closestElWidth = closestEl.getBoundingClientRect().width;
    const diff = closestElWidth * ((frameStart - indexClosest * frameSize) / frameSize);

    setFrameOffset(closestElOffset - 2 + diff);
  }, [indexClosest, frameSize, frameStart, totalItems]);

  const currentPageIndex = indexClosest + 1;

  const { leftDots, leftIndex, rightIndex, rightDots } = getPaginationState(currentPageIndex, pagesCount, openEnd);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }} ref={__internalRootRef}>
      <div ref={paginationRef} style={{ position: 'relative' }}>
        <ul
          aria-label={paginationLabel}
          {...baseProps}
          className={clsx(baseProps.className, styles.root, disabled && styles['root-disabled'])}
        >
          <PageButton
            className={styles.arrow}
            pageIndex={currentPageIndex - 1}
            ariaLabel={previousPageLabel ?? defaultAriaLabels.nextPageLabel}
            disabled={disabled || frameStart === 0}
            onClick={handlePrevPageClick}
          >
            <InternalIcon name="angle-left" variant={disabled ? 'disabled' : 'normal'} />
          </PageButton>
          <PageNumber
            pageIndex={1}
            isCurrent={currentPageIndex === 1}
            disabled={disabled}
            ariaLabel={pageNumberLabelFn(1)}
            onClick={handlePageClick}
          />
          {leftDots && <li className={styles.dots}>...</li>}
          {range(leftIndex, rightIndex).map(pageIndex => (
            <PageNumber
              key={pageIndex}
              isCurrent={currentPageIndex === pageIndex}
              pageIndex={pageIndex}
              disabled={disabled}
              ariaLabel={pageNumberLabelFn(pageIndex)}
              onClick={handlePageClick}
            />
          ))}
          {rightDots && <li className={styles.dots}>...</li>}
          {!openEnd && pagesCount > 1 && (
            <PageNumber
              isCurrent={currentPageIndex === pagesCount}
              pageIndex={pagesCount}
              disabled={disabled}
              ariaLabel={pageNumberLabelFn(pagesCount)}
              onClick={handlePageClick}
            />
          )}
          <PageButton
            className={styles.arrow}
            pageIndex={currentPageIndex + 1}
            ariaLabel={nextPageLabel ?? defaultAriaLabels.nextPageLabel}
            disabled={disabled || (!openEnd && (pagesCount === 0 || frameStart + frameSize >= totalItems))}
            onClick={handleNextPageClick}
          >
            <InternalIcon name="angle-right" variant={disabled ? 'disabled' : 'normal'} />
          </PageButton>
        </ul>

        <div
          style={{
            position: 'absolute',
            left: frameOffset,
            top: 4,
            width: 24,
            height: 24,
            background: 'rgba(9, 114, 211, 0.33)',
            pointerEvents: 'none',
          }}
        />
      </div>

      <InternalBox fontSize="body-s">
        {frameStart} — {Math.min(totalItems, frameStart + frameSize)} of {totalItems}
      </InternalBox>
    </div>
  );
}
