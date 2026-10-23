import React from 'react';
import { clsx } from 'clsx';

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T extends object> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  className?: string;
  emptyMessage?: string;
}

export function DataTable<T extends object>({
  columns,
  data,
  keyField,
  className,
  emptyMessage = 'No data available',
}: DataTableProps<T>) {
  return (
    <div
      className={clsx(
        'overflow-x-auto rounded-[12px] border-2 border-[#171717] bg-white',
        className
      )}
      style={{ boxShadow: '4px 4px 0px #171717' }}
    >
      <table className="data-table w-full">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key as string} className={col.className}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-10 text-[#696969] font-medium">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map(row => (
              <tr key={String(row[keyField])}>
                {columns.map(col => (
                  <td key={col.key as string} className={clsx('border-b border-[#e5d8c7]', col.className)}>
                    {col.render
                      ? col.render(row)
                      : String((row as Record<string, unknown>)[col.key as string] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
