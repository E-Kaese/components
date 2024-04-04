// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import InternalStatusIndicator from '../../status-indicator/internal';
import styles from './styles.css.js';
import LiveRegion from '../../internal/components/live-region';
import { warnOnce } from '@cloudscape-design/component-toolkit/internal';
import { TableProps } from '../interfaces';
import InternalButton from '../../button/internal';
import { applyTrackBy } from '../utils';

interface ItemsLoaderProps<T> {
  item: null | T;
  loadingStatus: TableProps.LoadingStatus;
  renderLoaderPending?: (detail: TableProps.RenderLoaderDetail<T>) => TableProps.RenderLoaderPendingResult;
  renderLoaderLoading?: (detail: TableProps.RenderLoaderDetail<T>) => TableProps.RenderLoaderLoadingResult;
  renderLoaderError?: (detail: TableProps.RenderLoaderDetail<T>) => TableProps.RenderLoaderErrorResult;
  onLoadMoreItems: () => void;
  trackBy?: TableProps.TrackBy<T>;
}

export function ItemsLoader<T>({
  item,
  loadingStatus,
  renderLoaderPending,
  renderLoaderLoading,
  renderLoaderError,
  onLoadMoreItems,
  trackBy,
}: ItemsLoaderProps<T>) {
  let content: React.ReactNode = null;
  if (loadingStatus === 'pending' && renderLoaderPending) {
    const { buttonLabel, buttonAriaLabel } = renderLoaderPending({ item });
    content = (
      <InternalButton
        variant="inline-link"
        iconName="add-plus"
        ariaLabel={buttonAriaLabel}
        onClick={onLoadMoreItems}
        className={styles['items-loader-load-more']}
      >
        {buttonLabel}
      </InternalButton>
    );
  } else if (loadingStatus === 'loading' && renderLoaderLoading) {
    const { loadingText } = renderLoaderLoading({ item });
    content = (
      <LiveRegion visible={true}>
        <InternalStatusIndicator type="loading">{loadingText}</InternalStatusIndicator>
      </LiveRegion>
    );
  } else if (loadingStatus === 'error' && renderLoaderError) {
    const { cellContent } = renderLoaderError({ item });
    content = <LiveRegion visible={true}>{cellContent}</LiveRegion>;
  } else {
    warnOnce(
      'Table',
      'Must define `renderLoaderPending`, `renderLoaderLoading`, and `renderLoaderError` when using `loadingStatus`.'
    );
  }

  let parentTrackId = item && trackBy ? applyTrackBy(trackBy, item) : undefined;
  parentTrackId = typeof parentTrackId === 'string' ? parentTrackId : undefined;
  return (
    <div className={styles['items-loader']} data-root={item ? 'false' : 'true'} data-parentrow={parentTrackId}>
      {content}
    </div>
  );
}
