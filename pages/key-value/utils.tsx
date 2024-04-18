// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import Box from '~components/box';
import Button from '~components/button';
import { KeyValueProps } from '~components/key-value';
import Link from '~components/link';
import Popover from '~components/popover';
import ProgressBar from '~components/progress-bar';
import StatusIndicator from '~components/status-indicator';

export function generate(element: React.ReactElement, amount?: number) {
  return [...Array(amount || 3)].map(value =>
    React.cloneElement(element, {
      key: value,
    })
  );
}

export const pairs1: KeyValueProps.Pair[] = [
  {
    label: 'Label for key',
    value: 'Value',
  },
  {
    label: 'Label for key',
    value: <StatusIndicator>Value for positive status with long label to check for wrapping behavior</StatusIndicator>,
  },
];

export const pairs2: KeyValueProps.Pair[] = [
  {
    value: <ProgressBar variant="key-value" label="Status" value={37} description="Update in progress" />,
  },
  {
    label: 'Label for key',
  },
  {
    label: 'Label for key',
    value: (
      <Link href="https://whatever/" external={true}>
        Value with external link
      </Link>
    ),
  },
];

export const pairs3: KeyValueProps.Pair[] = [
  {
    label: 'ARN',
    value: (
      <div style={{ wordBreak: 'break-all' }}>
        <Box margin={{ right: 'xxs' }} display="inline-block">
          <Popover
            size="small"
            position="top"
            dismissButton={false}
            triggerType="custom"
            content={<StatusIndicator type="success">ARN copied</StatusIndicator>}
          >
            <Button variant="inline-icon" iconName="copy" ariaLabel="Copy ARN" />
          </Popover>
        </Box>
        arn:aws:cloudfront::bbb.cloudfront.net/SLCCSMWOHOFUY0
      </div>
    ),
  },
  {
    label: 'Label for key',
    value: 'Very long value that wraps onto the second line because it does not fit in one line',
  },
];

interface ValueWithLabelProps {
  label?: React.ReactNode;
  children?: React.ReactNode;
}
export const ValueWithLabel = ({ label, children }: ValueWithLabelProps) => (
  <div>
    <Box variant="awsui-key-label">{label}</Box>
    <div>{children || '–'}</div>
  </div>
);

// export const groups = [
//   {
//     title: 'Column title 1',
//     pairs: pairs1,
//   },
//   {
//     title: 'Column title 2',
//     pairs: pairs2,
//   },
//   {
//     title: 'Column title 3',
//     pairs: pairs3,
//   },
// ];
