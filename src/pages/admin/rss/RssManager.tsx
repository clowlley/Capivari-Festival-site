import React from 'react';
import styles from './RssManager.module.css';
import { FiRss } from 'react-icons/fi';

const RssManager: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <FiRss size={24} />
        <h1>Gerenciador de Feed RSS</h1>
      </div>
      <div className={styles.card}>
        <p>O módulo de RSS está em desenvolvimento.</p>
        <span className={styles.status}>Status: Estático / Esboço</span>
      </div>
    </div>
  );
};

export default RssManager;