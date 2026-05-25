import React from 'react';
import styles from './Table.module.css';

interface TableProps {
  headers: string[];
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ headers, children, className }) => {
  return (
    <div className={`${styles.tableContainer} ${className || ''}`}>
      <table className={styles.table}>
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
};

export const TableRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <tr>{children}</tr>
);
export const TableCell: React.FC<{ children: React.ReactNode; label?: string }> = ({ children, label }) => (
  <td data-label={label}>{children}</td>
);