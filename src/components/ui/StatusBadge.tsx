import React from 'react';
import { Badge } from './Badge';
import styles from './StatusBadge.module.css';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const s = status.toLowerCase();
  
  let type: 'success' | 'warning' | 'danger' | 'info' = 'info';

  if (s === 'pago' || s === 'concluida' || s === 'concluída') {
    type = 'success';
  } else if (s === 'pendente' || s === 'draft') {
    type = 'warning';
  } else if (s === 'atrasado' || s === 'atrasada' || s === 'cancelado') {
    type = 'danger';
  }

  return (
    <div className={styles.container}>
      <Badge type={type}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className={styles.dot} />
          {status}
        </div>
      </Badge>
    </div>
  );
};