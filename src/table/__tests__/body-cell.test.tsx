// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import * as React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { TableBodyCell } from '../../../lib/components/table/body-cell';
import { TableProps } from '../interfaces';

const testItem = {
  test: 'testData',
};

const column: TableProps.ColumnDefinition<typeof testItem> = {
  id: 'test',
  header: 'Test',
  editConfig: {
    ariaLabel: 'test input',
    editIconAriaLabel: 'error',
    editingCell: (item, { setValue, currentValue }: TableProps.CellContext<any>) => {
      return <input type="text" value={currentValue ?? item.test} onChange={e => setValue(e.target.value)} />;
    },
  },
  cell: item => item.test,
};

const onEditEnd = jest.fn();
const onEditStart = jest.fn();

const TestComponent = ({ isEditing = false }) => {
  return (
    <table>
      <tbody>
        <tr>
          <TableBodyCell<typeof testItem>
            column={column}
            item={testItem}
            isEditing={isEditing}
            onEditStart={onEditStart}
            onEditEnd={onEditEnd}
            ariaLabels={{
              activateEditLabel: (column, item) => `Edit ${column.id}, ${item.test}`,
              cancelEditLabel: (column, item) => `Cancel editing ${column.id}, ${item.test}`,
              submitEditLabel: (column, item) => `Submit editing ${column.id}, ${item.test}`,
            }}
            isEditable={true}
            isPrevSelected={false}
            isNextSelected={false}
            isFirstRow={true}
            isLastRow={true}
            isSelected={false}
            wrapLines={false}
          />
        </tr>
      </tbody>
    </table>
  );
};

const TestComponent2 = ({ column }: any) => {
  return (
    <table>
      <tbody>
        <tr>
          <TableBodyCell<typeof testItem>
            column={column}
            item={testItem}
            isEditing={true}
            onEditStart={onEditStart}
            onEditEnd={onEditEnd}
            ariaLabels={{
              activateEditLabel: () => 'activate edit',
              cancelEditLabel: () => 'cancel edit',
              submitEditLabel: () => 'submit edit',
            }}
            isEditable={true}
            isPrevSelected={false}
            isNextSelected={false}
            isFirstRow={true}
            isLastRow={true}
            isSelected={false}
            wrapLines={false}
          />
        </tr>
      </tbody>
    </table>
  );
};

describe('TableBodyCell', () => {
  it('should render', () => {
    const { container } = render(<TestComponent />);
    expect(container.querySelector('td')).toBeInTheDocument();
  });

  it('should call onEditStart', () => {
    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit test, testData' }));
    expect(onEditStart).toHaveBeenCalled();
  });

  it('should call onEditEnd', () => {
    render(<TestComponent isEditing={true} />);
    fireEvent.click(screen.getByRole('button', { name: 'Submit editing test, testData' }));
    expect(onEditEnd).toHaveBeenCalled();
  });

  it('should call onEditEnd with value when submitting', () => {
    const { container } = render(<TestComponent isEditing={true} />);
    fireEvent.change(container.querySelector('input')!, { target: { value: 'test2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit editing test, testData' }));
    expect(onEditEnd).toHaveBeenCalled();
  });

  it('should call onEditEnd with value when cancelling', () => {
    const { container } = render(<TestComponent isEditing={true} />);
    fireEvent.change(container.querySelector('input')!, { target: { value: 'test2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Cancel editing test, testData' }));
    expect(onEditEnd).toHaveBeenCalled();
  });

  it('should render with default state at edit start', () => {
    const col: typeof column = {
      ...column,
      editConfig: {
        ...column.editConfig,
        editingCell: (item, { setValue, currentValue }) => {
          // testing default values
          expect(setValue).toBeInstanceOf(Function);
          expect(currentValue).toBeUndefined();
          return <input type="text" value={currentValue ?? item.test} onChange={e => setValue(e.target.value)} />;
        },
      },
    };
    render(<TestComponent2 column={col} />);
  });
});
