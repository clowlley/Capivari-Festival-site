import React from 'react';
import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  isLoading, 
  children, 
  className, 
  disabled,
  ...props 
}) => {
  return (
    <button 
      className={`${styles.button} ${styles[variant]} ${className || ''}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? 'Carregando...' : children}
    </button>
  );
};