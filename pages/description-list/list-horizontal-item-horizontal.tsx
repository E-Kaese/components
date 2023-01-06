// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import Box from '~components/box';
import Button from '~components/button';
import Container from '~components/container';
import DescriptionList from '~components/description-list';
import Link from '~components/link';
import Popover from '~components/popover';
import ProgressBar from '~components/progress-bar';
import StatusIndicator from '~components/status-indicator';

export default function ListHorizontalItemHorizontal() {
  return (
    <Container>
      <Box variant="h3">
        List Direction: <i>Horizontal</i>
        <br />
        Item Direction: <i>Horizontal</i>
      </Box>

      <DescriptionList.List>
        <DescriptionList.ListItem direction="horizontal">
          <DescriptionList.Term>Distribution IDs</DescriptionList.Term>
          <DescriptionList.Details>E1WG1ZNPRXT0D44</DescriptionList.Details>
          <DescriptionList.Details>E1WG1ZNPRXJKFKD</DescriptionList.Details>
        </DescriptionList.ListItem>

        <DescriptionList.ListItem direction="horizontal">
          <DescriptionList.Term>Status</DescriptionList.Term>
          <DescriptionList.Details>
            <StatusIndicator>Available</StatusIndicator>
          </DescriptionList.Details>
        </DescriptionList.ListItem>

        <DescriptionList.ListItem direction="horizontal">
          <DescriptionList.Term>SSL Certificate</DescriptionList.Term>
          <DescriptionList.Details>
            <ProgressBar description="Update in progress" value={37} />
          </DescriptionList.Details>
        </DescriptionList.ListItem>

        <DescriptionList.ListItem direction="horizontal">
          <DescriptionList.Term>Domain names</DescriptionList.Term>
          <DescriptionList.Details>example1.com</DescriptionList.Details>
          <DescriptionList.Details>example2.com</DescriptionList.Details>
          <DescriptionList.Details>example3.com</DescriptionList.Details>
        </DescriptionList.ListItem>

        <DescriptionList.ListItem direction="horizontal">
          <DescriptionList.Term>Price class</DescriptionList.Term>
          <DescriptionList.Details>Use only US, Canada, Europe, and Asia</DescriptionList.Details>
        </DescriptionList.ListItem>

        <DescriptionList.ListItem direction="horizontal">
          <DescriptionList.Term>Custom SSL client support</DescriptionList.Term>
          <DescriptionList.Details>-</DescriptionList.Details>
        </DescriptionList.ListItem>

        <DescriptionList.ListItem direction="horizontal">
          <DescriptionList.Term>ARN</DescriptionList.Term>
          <DescriptionList.Details>
            <Popover
              content={<StatusIndicator type="success">ARN copied</StatusIndicator>}
              dismissButton={false}
              position="top"
              size="small"
              triggerType="custom"
            >
              <Button ariaLabel="Copy ARN" iconName="copy" variant="inline-icon" />
            </Popover>
            <span style={{ wordBreak: 'break-all' }}>arn:aws:cloudfront::111122223333:distribution/E1WG1ZNPRXT0D4</span>
          </DescriptionList.Details>
        </DescriptionList.ListItem>

        <DescriptionList.ListItem direction="horizontal">
          <DescriptionList.Term>CNAMEs</DescriptionList.Term>
          <DescriptionList.Details>
            <Link external={true} href="https://www.google.com">
              Value with external link
            </Link>
          </DescriptionList.Details>
        </DescriptionList.ListItem>

        <DescriptionList.ListItem direction="horizontal">
          <DescriptionList.Term>Logging</DescriptionList.Term>
          <DescriptionList.Details>Off</DescriptionList.Details>
        </DescriptionList.ListItem>
      </DescriptionList.List>
    </Container>
  );
}
