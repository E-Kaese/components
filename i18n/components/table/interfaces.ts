// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TableI18n {
  ariaLabels: {
    allItemsSelectionLabel: string;
    itemSelectionLabel: ({ itemName }: { itemName: string }) => string;
  };
}
