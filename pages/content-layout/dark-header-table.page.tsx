// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React, { useState } from 'react';
import Alert from '~components/alert';
import Button from '~components/button';
import AppLayout from '~components/app-layout';
// import AppLayout from '../../lib/components-copy/app-layout';
import ContentLayout from '~components/content-layout';
import Table from '~components/table';

import { Breadcrumbs } from '../app-layout/utils/content-blocks';
import ScreenshotArea from '../utils/screenshot-area';
import appLayoutLabels from '../app-layout/utils/labels';
import Header from '~components/header';

export default function () {
  const [alertVisible, setVisible] = useState(true);

  return (
    <ScreenshotArea gutters={false}>
      <AppLayout
        contentType="table"
        ariaLabels={appLayoutLabels}
        breadcrumbs={<Breadcrumbs />}
        navigationOpen={false}
        content={
          <ContentLayout
            header={
              alertVisible && (
                <Alert
                  statusIconAriaLabel="Info"
                  dismissible={true}
                  dismissAriaLabel="Close alert"
                  onDismiss={() => setVisible(false)}
                  action={<Button>Do something</Button>}
                >
                  Demo alert
                </Alert>
              )
            }
          >
            <Table
              variant="full-page"
              header={<Header>My resources</Header>}
              stickyHeader={true}
              columnDefinitions={[
                { header: 'Column 1', cell: row => row.column1 },
                { header: 'Column 2', cell: row => row.column2 },
                { header: 'Column 3', cell: row => row.column3 },
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
          </ContentLayout>
        }
      />
    </ScreenshotArea>
  );
}
