// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import globalVars from '../../internal/styles/global-vars';

export function getStickyOffsetVars(
  headerHeight: number,
  footerHeight: number,
  notificationsHeight: number,
  isMobile: boolean
) {
  const mobileToolbarHeight = isMobile ? 40 : 0;
  return {
    [globalVars.stickyVerticalTopOffset]: `${headerHeight + mobileToolbarHeight + notificationsHeight}px`,
    [globalVars.stickyVerticalBottomOffset]: `${footerHeight}px`,
  };
}
