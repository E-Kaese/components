// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';
import { findUpUntil } from '../internal/utils/dom';

interface GridFocusProps {
  getContainer: () => null | HTMLElement;
  onRowAction?: (rowIndex: number) => void;
  onCellAction?: (rowIndex: number, colIndex: number) => void;
}

export function useGridFocus({ getContainer }: GridFocusProps) {
  const [model, setModel] = useState(() => {
    const container = getContainer();
    if (!container) {
      return null;
    }
    return new GridFocusModel(container);
  });

  // TODO: add cleanup
  useEffect(() => {
    if (model) {
      return;
    }
    const container = getContainer();
    if (!container) {
      return;
    }
    setModel(new GridFocusModel(container));
  }, [model, getContainer]);
}

/**
 Allow focus when focus is within table but not within any cell.
 Listen for arrow keys, space, enter, tab, home, end w/ no modifiers

 // Example: https://codepen.io/pen?&prefill_data_id=ef6c7c57-6f7d-434b-bf0e-108c0f52187d
*/

export class GridFocusModel {
  // Props
  private container: HTMLElement;
  private columns = 0;
  private rows = 0;

  // State
  private focusedRow: null | number = null;
  private focusedColumn: null | number = null;
  private focusedElement: null | HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;

    this.init();
  }

  public resetState() {
    this.focusedRow = null;
    this.focusedColumn = null;
  }

  public setColumns(columns: number) {
    this.columns = columns;
    if (this.focusedColumn !== null) {
      this.focusedColumn = this.focusedColumn < columns ? this.focusedColumn : null;
    }
  }

  public setRows(rows: number) {
    this.rows = rows;
    if (this.focusedRow !== null) {
      this.focusedRow = this.focusedRow < rows ? this.focusedRow : null;
    }
  }

  public destroy() {
    this.container.removeEventListener('focusin', this.onFocus);
    this.container.removeEventListener('blur', this.onBlur);
    this.setFocusedElement(null);
  }

  private init() {
    this.container.addEventListener('focusin', this.onFocus);
    this.container.addEventListener('blur', this.onBlur);
  }

  private setFocusedElement(element: null | HTMLElement) {
    if (this.focusedElement) {
      this.focusedElement.removeEventListener('keydown', this.onKeyDown);
    }
    this.focusedElement = element;
    if (element) {
      element.addEventListener('keydown', this.onKeyDown);
    }
  }

  private onFocus = (event: FocusEvent) => {
    const target = event.target as HTMLElement;
    if (target.tagName === 'TD' || target.tagName === 'TR') {
      return;
    }

    const parent = findUpUntil(target, node => node.tagName === 'TR');
    if (!parent) {
      return;
    }
    const rowIndex = parseInt(parent.dataset.rowindex ?? '', 10);
    if (!isNaN(rowIndex)) {
      console.log('FOCUS ROW', rowIndex);

      this.focusedRow = rowIndex;
      this.setFocusedElement(parent);
      parent.focus();
    }
  };

  // TODO: keep focus position??
  private onBlur = (event: FocusEvent) => {
    this.focusedRow = null;
    this.focusedColumn = null;
  };

  private moveByRow(direction: -1 | 1) {
    if (this.focusedRow === null) {
      return;
    }
    const nextRow = this.container.querySelector(
      `[data-rowindex="${this.focusedRow + direction}"]`
    ) as null | HTMLElement;
    if (nextRow) {
      console.log('MOVE_BY_ROW', direction);

      this.focusedRow = this.focusedRow + direction;
      this.setFocusedElement(nextRow);
      nextRow.focus();
    } else {
      // TODO: try avoiding imperative scroll.
      const wrapper = document.querySelector('[data-testid="table-wrapper"]');
      if (wrapper) {
        wrapper.scrollTo({ top: wrapper.scrollTop + direction * 25 });
      }
    }
  }

  private onKeyDown = (event: KeyboardEvent) => {
    const ENTER = 13;
    const UP = 38;
    const DOWN = 40;
    const LEFT = 37;
    const RIGHT = 39;
    const HOME = 36;
    const END = 35;
    const CTRL_HOME = -HOME;
    const CTRL_END = -END;

    const ctrlKey = event.ctrlKey ? 1 : 0;
    const altKey = event.altKey ? 1 : 0;
    const shiftKey = event.shiftKey ? 1 : 0;
    const metaKey = event.metaKey ? 1 : 0;
    const numModifiersPressed = ctrlKey + altKey + shiftKey + metaKey;

    let key = event.keyCode;

    if (numModifiersPressed === 1 && event.ctrlKey) {
      key = -key; // Treat as negative key value when ctrl pressed
    } else if (numModifiersPressed) {
      return;
    }

    switch (key) {
      case DOWN:
        this.moveByRow(1);
        break;
      case UP:
        this.moveByRow(-1);
        break;
      case LEFT:
        // if (isEditableFocused()) {
        //   return; // Leave key for editable area
        // }
        // if (isRowFocused()) {
        //   changeExpanded(false) || moveByRow(-1, true);
        // } else {
        //   moveByCol(-1);
        // }
        break;
      case RIGHT:
        // if (isEditableFocused()) {
        //   return; // Leave key for editable area
        // }

        // // If row: try to expand
        // // If col or can't expand, move column to right
        // if (!isRowFocused() || !changeExpanded(true)) {
        //   moveByCol(1);
        // }
        break;
      case CTRL_HOME:
        // moveToExtremeRow(-1);
        break;
      case HOME:
        // if (isEditableFocused()) {
        //   return; // Leave key for editable area
        // }
        // moveToExtreme(-1);
        break;
      case CTRL_END:
        // moveToExtremeRow(1);
        break;
      case END:
        // if (isEditableFocused()) {
        //   return; // Leave key for editable area
        // }
        // moveToExtreme(1);
        break;
      case ENTER:
        // doPrimaryAction();
        break;
      default:
        return;
    }

    // Important: don't use key for anything else, such as scrolling
    event.preventDefault();
  };
}
