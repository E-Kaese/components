// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';
import { findUpUntil } from '../internal/utils/dom';
import { KeyCode } from '../internal/keycode';
import { useStableEventHandler } from '../internal/hooks/use-stable-event-handler';

const KEYBOARD_PAGE_SIZE = 50;

interface GridFocusProps {
  rows: number;
  getWrapper: () => null | HTMLElement;
  getContainer: () => null | HTMLElement;
  onRowAction?: (rowIndex: number) => void;
  onCellAction?: (rowIndex: number, colIndex: number) => void;
  onScrollToIndex: (rowIndex: number, colIndex: number) => void;
}

export function useGridFocus({
  rows,
  getWrapper,
  getContainer,
  onRowAction,
  onCellAction,
  onScrollToIndex,
}: GridFocusProps) {
  const [model, setModel] = useState(() => {
    const wrapper = getWrapper();
    const container = getContainer();
    if (!wrapper || !container) {
      return null;
    }
    return new GridFocusModel(container, wrapper, onScrollToIndex, onRowAction, onCellAction);
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
    const wrapper = getWrapper();
    const container = getContainer();
    if (!wrapper || !container) {
      return;
    }
    setModel(new GridFocusModel(container, wrapper, onScrollToIndex, stableOnRowAction, stableOnCellAction));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model, stableOnRowAction, stableOnCellAction]);

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
  private wrapper: HTMLElement;
  private onScrollToIndex: (rowIndex: number, colIndex: number) => void;
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
    wrapper: HTMLElement,
    onScrollToIndex: (rowIndex: number, colIndex: number) => void,
    onRowAction?: (rowIndex: number) => void,
    onCellAction?: (rowIndex: number, columnIndex: number) => void
  ) {
    this.container = container;
    this.wrapper = wrapper;
    this.onScrollToIndex = onScrollToIndex;
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

    if (target.tagName === 'TR') {
      const rowIndex = parseInt(target.dataset.rowindex ?? '', 10);
      if (!isNaN(rowIndex) && rowIndex !== this.focusedRow) {
        this.focusedRow = rowIndex;
        this.setFocusedElement(target);
      }
      return;
    }
    if (target.tagName === 'TD') {
      let updated = false;
      const trParent = findUpUntil(target, node => node.tagName === 'TR');
      const rowIndex = trParent && parseInt(trParent.dataset.rowindex ?? '', 10);
      const colIndex = parseInt(target.dataset.colindex ?? '', 10);
      if (rowIndex !== null && !isNaN(rowIndex) && rowIndex !== this.focusedRow) {
        this.focusedRow = rowIndex;
        updated = true;
      }
      if (!isNaN(colIndex) && colIndex !== this.focusedColumn) {
        this.focusedColumn = colIndex;
        updated = true;
      }
      if (updated) {
        this.setFocusedElement(target);
      }
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
  private onBlur = () => {
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
      const cellIndex = this.focusedColumn ?? 0;
      const cellEl = nextRow.querySelector(`[data-colindex="${cellIndex}"]`) as null | HTMLElement;

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

    const nextFocused = (this.focusedColumn ?? 0) + direction;
    const nextCell = focusedRow.querySelector(`[data-colindex="${nextFocused}"]`) as null | HTMLElement;
    if (nextCell) {
      this.focusedColumn = cellIndex;
      this.setFocusedElement(nextCell);
      nextCell.focus();
    }

    const isFirst = nextCell === rowCells[0];
    const isLast = nextCell === rowCells[rowCells.length - 1];
    if (isFirst) {
      this.wrapper.scrollTo({ left: this.wrapper.scrollLeft - 300 });
    } else if (isLast) {
      this.wrapper.scrollTo({ left: this.wrapper.scrollLeft + 300 });
    }
  }

  private moveToExtreme(direction: -1 | 1) {
    if (this.focusedRow === null) {
      return;
    }

    // Move to start/end of the row.
    if (this.focusedColumn !== null) {
      this.wrapper.scrollTo({ left: direction === -1 ? 0 : this.wrapper.scrollWidth });

      setTimeout(() => {
        const focusedRow = this.container.querySelector(`[data-rowindex="${this.focusedRow}"]`) as null | HTMLElement;
        if (!focusedRow) {
          return;
        }
        const cellElements = focusedRow.querySelectorAll('td');
        const nextCellElement = cellElements[direction === -1 ? 0 : cellElements.length - 1];
        if (nextCellElement) {
          const columnIndex = parseInt(nextCellElement.dataset.colindex ?? '', 10);
          if (!isNaN(columnIndex)) {
            this.focusedColumn = columnIndex;
            this.setFocusedElement(nextCellElement);
            nextCellElement.focus();
          }
        }
      }, 100);
    }

    // Move to start/end of the table.
    else {
      this.wrapper.scrollTo({ top: direction === -1 ? 0 : this.wrapper.scrollHeight });

      setTimeout(() => {
        const rowElements = this.container.querySelectorAll('tr[data-rowindex]') as NodeListOf<HTMLElement>;
        const nextRowElement = rowElements[direction === -1 ? 0 : rowElements.length - 1];
        if (nextRowElement) {
          const rowIndex = parseInt(nextRowElement.dataset.rowindex ?? '', 10);
          if (!isNaN(rowIndex)) {
            this.focusedRow = rowIndex;
            this.setFocusedElement(nextRowElement);
            nextRowElement.focus();
          }
        }
      }, 100);
    }
  }

  private moveToPage(direction: -1 | 1) {
    if (this.focusedRow === null || this.focusedColumn !== null) {
      return;
    }

    // Move one page up/down the table.
    else {
      this.onScrollToIndex(
        direction === -1 ? this.focusedRow - KEYBOARD_PAGE_SIZE : this.focusedRow + KEYBOARD_PAGE_SIZE,
        0
      );

      // set timeout - set next page row as focused
    }
  }

  private onKeyDown = (event: KeyboardEvent) => {
    const UP = 38;
    const DOWN = 40;
    const LEFT = 37;
    const RIGHT = 39;
    const HOME = 36;
    const END = 35;
    const PAGE_UP = 33;
    const PAGE_DOWN = 34;

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
      case HOME:
        this.moveToExtreme(-1);
        break;
      case END:
        this.moveToExtreme(1);
        break;
      case PAGE_UP:
        this.moveToPage(-1);
        break;
      case PAGE_DOWN:
        this.moveToPage(+1);
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
