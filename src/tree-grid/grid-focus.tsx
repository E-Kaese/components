// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';
import { findUpUntil } from '../internal/utils/dom';
import { KeyCode } from '../internal/keycode';
import { useStableEventHandler } from '../internal/hooks/use-stable-event-handler';

interface GridFocusProps {
  rows: number;
  getContainer: () => null | HTMLElement;
  onRowAction?: (rowIndex: number) => void;
  onCellAction?: (rowIndex: number, colIndex: number) => void;
}

export function useGridFocus({ rows, getContainer, onRowAction, onCellAction }: GridFocusProps) {
  const [model, setModel] = useState(() => {
    const container = getContainer();
    if (!container) {
      return null;
    }
    return new GridFocusModel(container, onRowAction, onCellAction);
  });

  useEffect(() => {
    if (model) {
      model.setRows(rows);
    }
  }, [model, rows]);

  const stableOnRowAction = useStableEventHandler(onRowAction ?? (() => {}));
  const stableOnCellAction = useStableEventHandler(onCellAction ?? (() => {}));

  // TODO: add cleanup
  useEffect(() => {
    if (model) {
      return;
    }
    const container = getContainer();
    if (!container) {
      return;
    }
    setModel(new GridFocusModel(container, stableOnRowAction, stableOnCellAction));
  }, [model, getContainer, stableOnRowAction, stableOnCellAction]);

  return { focusFirstRow: () => model?.focusFirstRow() };
}

/**
 Allow focus when focus is within table but not within any cell.
 Listen for arrow keys, space, enter, tab, home, end w/ no modifiers

 // Example: https://codepen.io/pen?&prefill_data_id=ef6c7c57-6f7d-434b-bf0e-108c0f52187d
*/

export class GridFocusModel {
  // Props
  private container: HTMLElement;
  private onRowAction?: (rowIndex: number) => void;
  private onCellAction?: (rowIndex: number, columnIndex: number) => void;
  private columns = 0;
  private rows = 0;

  // State
  private focusedRow: null | number = null;
  private focusedColumn: null | number = null;
  private focusedElement: null | HTMLElement = null;

  constructor(
    container: HTMLElement,
    onRowAction?: (rowIndex: number) => void,
    onCellAction?: (rowIndex: number, columnIndex: number) => void
  ) {
    this.container = container;
    this.onRowAction = onRowAction;
    this.onCellAction = onCellAction;

    this.init();
  }

  public resetState() {
    this.focusedRow = null;
    this.focusedColumn = null;
  }

  public setColumns(columns: number) {
    this.columns = columns;

    // TODO: unmount
  }

  public focusFirstRow() {
    const nextRow = this.container.querySelector(`[data-rowindex="0"]`) as null | HTMLElement;
    if (nextRow) {
      this.focusedRow = 0;
      this.setFocusedElement(nextRow);
      nextRow.focus();
    }
  }

  public setRows(rows: number) {
    this.rows = rows;

    if (this.focusedElement && !document.contains(this.focusedElement) && this.focusedRow) {
      const focusedRow = Math.min(this.focusedRow, rows - 1);
      const nextRow = this.container.querySelector(`[data-rowindex="${focusedRow}"]`) as null | HTMLElement;
      if (nextRow) {
        this.focusedRow = focusedRow;
        this.setFocusedElement(nextRow);
        nextRow.focus();
      } else {
        this.focusedElement = null;
        this.focusedColumn = null;
        this.focusedRow = null;
      }
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

    const tdParent = findUpUntil(target, node => node.tagName === 'TD');
    const trParent = findUpUntil(target, node => node.tagName === 'TR');

    if (!trParent) {
      return;
    }

    // Allow focus inside row/column;
    if (tdParent === this.focusedElement || trParent === this.focusedElement) {
      return;
    }

    const rowIndex = parseInt(trParent.dataset.rowindex ?? '', 10);
    if (!isNaN(rowIndex)) {
      this.focusedRow = rowIndex;
      this.setFocusedElement(trParent);
      setTimeout(() => {
        trParent.focus();
      }, 0);
    }
  };

  // TODO: keep focus position??
  private onBlur = (event: FocusEvent) => {
    this.focusedRow = null;
    this.focusedColumn = null;
  };

  private moveByRow(direction: -1 | 0 | 1) {
    if (this.focusedRow === null) {
      return;
    }
    const nextRow = this.container.querySelector(
      `[data-rowindex="${this.focusedRow + direction}"]`
    ) as null | HTMLElement;

    if (nextRow && this.focusedColumn !== null) {
      const rowCells = nextRow.querySelectorAll('td');
      const cellIndex = Math.max(0, Math.min(rowCells.length - 1, this.focusedColumn));
      const cellEl = rowCells[cellIndex];

      if (cellEl) {
        this.focusedRow = this.focusedRow + direction;
        this.focusedColumn = cellIndex;
        this.setFocusedElement(cellEl);
        cellEl.focus();
      }
    } else if (nextRow) {
      this.focusedRow = this.focusedRow + direction;
      setTimeout(() => {
        this.setFocusedElement(nextRow);
      }, 0);
      nextRow.focus();
    } else {
      // TODO: try avoiding imperative scroll.
      const wrapper = document.querySelector('[data-testid="table-wrapper"]');
      if (wrapper) {
        wrapper.scrollTo({ top: wrapper.scrollTop + direction * 300 });
      }
    }
  }

  private moveByCol(direction: -1 | 0 | 1) {
    if (this.focusedRow === null) {
      return;
    }
    const focusedRow = this.container.querySelector(`[data-rowindex="${this.focusedRow}"]`) as null | HTMLElement;
    if (!focusedRow) {
      return;
    }
    const rowCells = focusedRow.querySelectorAll('td');
    const cellIndex = Math.max(-1, Math.min(rowCells.length - 1, (this.focusedColumn ?? 0) + direction));

    if (cellIndex === -1) {
      this.focusedColumn = null;
      this.moveByRow(0);

      return;
    }

    const cellEl = rowCells[cellIndex];
    if (cellEl) {
      this.focusedColumn = cellIndex;
      this.setFocusedElement(cellEl);
      cellEl.focus();
    } else {
      // TODO: try avoiding imperative scroll.
      const wrapper = document.querySelector('[data-testid="table-wrapper"]');
      if (wrapper) {
        wrapper.scrollTo({ left: wrapper.scrollTop + direction * 300 });
      }
    }
  }

  private onKeyDown = (event: KeyboardEvent) => {
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
        if (this.focusedColumn === null) {
          this.moveByCol(0);
        } else {
          this.moveByCol(-1);
        }
        break;
      case RIGHT:
        if (this.focusedColumn === null) {
          this.moveByCol(0);
        } else {
          this.moveByCol(1);
        }
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
      case KeyCode.space:
      case KeyCode.enter:
        if (this.focusedRow !== null && this.focusedColumn !== null) {
          this.onCellAction?.(this.focusedRow, this.focusedColumn);
        } else if (this.focusedRow !== null) {
          this.onRowAction?.(this.focusedRow);
        }
        break;
      default:
        return;
    }

    // Important: don't use key for anything else, such as scrolling
    event.preventDefault();
  };
}
