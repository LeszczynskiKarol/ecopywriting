// src/components/ui/table.tsx
import React from 'react';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className = '' }) => (
  <div className="overflow-x-auto">
    <table className={`min-w-full divide-y divide-gray-200 dark:divide-gray-700 ${className}`}>
      {children}
    </table>
  </div>
);

export const TableHeader: React.FC<TableProps> = ({ children, className = '' }) => (
  <thead className={`bg-gray-50 dark:bg-gray-700 ${className}`}>
    {children}
  </thead>
);

export const TableBody: React.FC<TableProps> = ({ children, className = '' }) => (
  <tbody className={`bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700 ${className}`}>
    {children}
  </tbody>
);

export const TableRow: React.FC<TableProps> = ({ children, className = '' }) => (
  <tr className={className}>
    {children}
  </tr>
);

export const TableHead: React.FC<TableProps> = ({ children, className = '' }) => (
  <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}>
    {children}
  </th>
);

export const TableCell: React.FC<TableProps> = ({ children, className = '' }) => (
  <td className={`px-6 py-4 whitespace-nowrap ${className}`}>
    {children}
  </td>
);