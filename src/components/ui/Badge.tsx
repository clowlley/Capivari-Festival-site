import React from 'react';
import styles from './Badge.module.css';

interface BadgeProps {
  children: React.ReactNode;
  type?: 'info' | 'success' | 'warning' | 'danger' | 'neutral';
}

export const Badge: React.FC<BadgeProps> = ({ children, type = 'neutral' }) => {
  return (
    <span className={`${styles.badge} ${styles[type]}`}>{children}</span>
  );
};