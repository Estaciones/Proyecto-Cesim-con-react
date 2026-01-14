import React from 'react';
import styles from './Table.module.css';

export default function Table({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No hay datos disponibles',
  striped = false,
  hoverable = true,
  compact = false,
  className = '',
  onRowClick,
  ...props
}) {
  const getRowKey = (row, index) => row.id || row._id || index;

  if (loading) {
    return (
      <div className={`${styles.loadingContainer} ${className}`} {...props}>
        <div className={styles.spinner}></div>
        <p className={styles.loadingText}>Cargando datos...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`${styles.emptyContainer} ${className}`} {...props}>
        <svg className={styles.emptyIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className={styles.emptyText}>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`${styles.tableContainer} ${className}`} {...props}>
      <table className={`${styles.table} ${compact ? styles.compact : ''}`}>
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th
                key={column.key || column.dataIndex || index}
                className={`${styles.th} ${column.className || ''}`}
                style={column.width ? { width: column.width } : undefined}
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={getRowKey(row, rowIndex)}
              className={`${styles.tr} ${striped && rowIndex % 2 === 0 ? styles.striped : ''} ${hoverable ? styles.hoverable : ''} ${onRowClick ? styles.clickable : ''}`}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map((column, colIndex) => {
                const cellKey = column.key || column.dataIndex || colIndex;
                const cellValue = column.render 
                  ? column.render(row[column.dataIndex], row, rowIndex)
                  : row[column.dataIndex];
                
                return (
                  <td
                    key={cellKey}
                    className={`${styles.td} ${column.cellClassName || ''}`}
                  >
                    {cellValue}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}