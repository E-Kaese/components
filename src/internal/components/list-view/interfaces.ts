// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { BaseComponentProps } from '../../base-component';

export interface ListViewProps extends BaseComponentProps {
  items: Array<React.ReactNode>;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}
