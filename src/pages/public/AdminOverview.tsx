import React from 'react';
import styles from './AdminOverview.module.css';

const AdminOverview: React.FC = () => {
  return (
    <div className={styles.container}>
      <h2>Visão Geral Administrativa</h2>
      <p>Este é o conteúdo da visão geral do painel administrativo.</p>
    </div>
  );
};

export default AdminOverview;