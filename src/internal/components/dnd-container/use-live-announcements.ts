// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { useRef } from 'react';
import { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';

import { ReorderAnnouncements, ReorderOptions } from './interfaces';

export default function useLiveAnnouncements<Option>({
  isDragging,
  liveAnnouncementDndStarted,
  liveAnnouncementDndItemReordered,
  liveAnnouncementDndItemCommitted,
  liveAnnouncementDndDiscarded,
  sortedOptions,
  getId,
}: ReorderOptions<Option> & ReorderAnnouncements & { isDragging: boolean }) {
  const isFirstAnnouncement = useRef(true);
  if (!isDragging) {
    isFirstAnnouncement.current = true;
  }

  return {
    onDragStart({ active }: DragStartEvent) {
      if (active && liveAnnouncementDndStarted) {
        const index = sortedOptions.findIndex(option => getId(option) === active.id);
        return liveAnnouncementDndStarted(index + 1, sortedOptions.length);
      }
    },
    onDragOver({ active, over }: DragOverEvent) {
      if (liveAnnouncementDndItemReordered) {
        // Don't announce on the first dragOver because it's redundant with onDragStart.
        if (isFirstAnnouncement.current) {
          isFirstAnnouncement.current = false;
          if (!over || over.id === active.id) {
            return;
          }
        }
        const initialIndex = sortedOptions.findIndex(option => getId(option) === active.id);
        const currentIdex = over ? sortedOptions.findIndex(option => getId(option) === over.id) : initialIndex;
        return liveAnnouncementDndItemReordered(initialIndex + 1, currentIdex + 1, sortedOptions.length);
      }
    },
    onDragEnd({ active, over }: DragEndEvent) {
      if (liveAnnouncementDndItemCommitted) {
        const initialIndex = sortedOptions.findIndex(option => getId(option) === active.id);
        const finalIndex = over ? sortedOptions.findIndex(option => getId(option) === over.id) : initialIndex;
        return liveAnnouncementDndItemCommitted(initialIndex + 1, finalIndex + 1, sortedOptions.length);
      }
    },
    onDragCancel() {
      return liveAnnouncementDndDiscarded;
    },
  };
}
