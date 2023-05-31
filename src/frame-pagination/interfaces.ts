// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { NonCancelableEventHandler } from '../internal/events';

export interface FramePaginationProps {
  frameSize: number;

  frameStart: number;

  totalItems: number;

  openEnd?: boolean;

  disabled?: boolean;

  ariaLabels?: FramePaginationProps.Labels;

  onChange?: NonCancelableEventHandler<FramePaginationProps.ChangeDetail>;

  onPreviousPageClick?: NonCancelableEventHandler<null>;

  onNextPageClick?: NonCancelableEventHandler<null>;
}

export namespace FramePaginationProps {
  export interface Labels {
    nextPageLabel?: string;
    paginationLabel?: string;
    previousPageLabel?: string;
    pageLabel?: (pageNumber: number) => string;
  }

  export interface ChangeDetail {
    frameStart: number;
  }
}
