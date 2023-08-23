// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React, { ReactElement } from 'react';
import BreadcrumbGroup, { BreadcrumbGroupProps } from '~components/breadcrumb-group';

export default function Breadcrumbs({ ...props }: BreadcrumbGroupProps): ReactElement {
  return (
    <div className="orion-context-breadcrumbs">
      <BreadcrumbGroup {...props} />
    </div>
  );
}
