// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export function createFrame({
  frameStart,
  frameSize,
  overscan,
  size,
}: {
  frameStart: number;
  frameSize: number;
  overscan: number;
  size: number;
}): number[] {
  const frame: number[] = [];
  for (let i = Math.max(0, frameStart - overscan); i < frameStart + frameSize && i < size; i++) {
    frame.push(i);
  }
  return frame;
}
