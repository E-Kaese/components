// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
// import AppLayout from '~components/app-layout';
import AppLayout from '../../lib/components-copy/app-layout';
import Table from '~components/table';

import { Breadcrumbs, Footer } from '../app-layout/utils/content-blocks';
import ScreenshotArea from '../utils/screenshot-area';
import appLayoutLabels from '../app-layout/utils/labels';
import Header from '~components/header';

export default function () {
  return (
    <ScreenshotArea gutters={false}>
      <AppLayout
        contentType="table"
        ariaLabels={appLayoutLabels}
        breadcrumbs={<Breadcrumbs />}
        navigationOpen={false}
        content={
          <Table
            variant="full-page"
            header={<Header>My resources</Header>}
            stickyHeader={true}
            resizableColumns={true}
            columnDefinitions={[
              { header: 'Column 1', cell: row => row.column1 },
              { header: 'Column 2', cell: row => row.column2, width: 800 },
              { header: 'Column 3', cell: row => row.column3, width: 800 },
            ]}
            items={[
              { column1: 'Row 1, Col 1', column2: 'Row 1, Col 2', column3: 'Row 1, Col 3' },
              { column1: 'Row 2, Col 1', column2: 'Row 2, Col 2', column3: 'Row 2, Col 3' },
              { column1: 'Row 3, Col 1', column2: 'Row 3, Col 2', column3: 'Row 3, Col 3' },
              { column1: 'Row 4, Col 1', column2: 'Row 4, Col 2', column3: 'Row 4, Col 3' },
              { column1: 'Row 4, Col 1', column2: 'Row 4, Col 2', column3: 'Row 4, Col 3' },
              { column1: 'Row 4, Col 1', column2: 'Row 4, Col 2', column3: 'Row 4, Col 3' },
              { column1: 'Row 4, Col 1', column2: 'Row 4, Col 2', column3: 'Row 4, Col 3' },
              { column1: 'Row 4, Col 1', column2: 'Row 4, Col 2', column3: 'Row 4, Col 3' },
              { column1: 'Row 4, Col 1', column2: 'Row 4, Col 2', column3: 'Row 4, Col 3' },
              { column1: 'Row 4, Col 1', column2: 'Row 4, Col 2', column3: 'Row 4, Col 3' },
              { column1: 'Row 4, Col 1', column2: 'Row 4, Col 2', column3: 'Row 4, Col 3' },
              { column1: 'Row 4, Col 1', column2: 'Row 4, Col 2', column3: 'Row 4, Col 3' },
              { column1: 'Row 4, Col 1', column2: 'Row 4, Col 2', column3: 'Row 4, Col 3' },
              { column1: 'Row 4, Col 1', column2: 'Row 4, Col 2', column3: 'Row 4, Col 3' },
              { column1: 'Row 4, Col 1', column2: 'Row 4, Col 2', column3: 'Row 4, Col 3' },
              { column1: 'Row 4, Col 1', column2: 'Row 4, Col 2', column3: 'Row 4, Col 3' },
              { column1: 'Row 4, Col 1', column2: 'Row 4, Col 2', column3: 'Row 4, Col 3' },
              { column1: 'Row 4, Col 1', column2: 'Row 4, Col 2', column3: 'Row 4, Col 3' },
              { column1: 'Row 4, Col 1', column2: 'Row 4, Col 2', column3: 'Row 4, Col 3' },
              { column1: 'Row 4, Col 1', column2: 'Row 4, Col 2', column3: 'Row 4, Col 3' },
              { column1: 'Row 4, Col 1', column2: 'Row 4, Col 2', column3: 'Row 4, Col 3' },
              { column1: 'Row 4, Col 1', column2: 'Row 4, Col 2', column3: 'Row 4, Col 3' },
              { column1: 'Row 4, Col 1', column2: 'Row 4, Col 2', column3: 'Row 4, Col 3' },
              { column1: 'Row 4, Col 1', column2: 'Row 4, Col 2', column3: 'Row 4, Col 3' },
            ]}
          />
        }
      />
      <Footer legacyConsoleNav={false} />
    </ScreenshotArea>
  );
}
