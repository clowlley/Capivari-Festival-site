import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import styles from './Header.module.css';
import { FiLogOut, FiUser, FiHome } from 'react-icons/fi';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className={styles.header}>
      <div className={styles.userInfo}>
        <FiUser className={styles.userIcon} />
        <span>{user?.name || 'Administrador'}</span>
      </div>
      <div className={styles.headerActions}>
        <Link to="/" className={styles.homeLink} title="Ir para o site">
          <FiHome />
          <span>Home</span>
        </Link>
        <button
          onClick={logout}
          className={styles.logoutButton}
          title="Sair do sistema"
        >
          <FiLogOut />
          <span>Sair</span>
        </button>
      </div>
    </header>
  );
};

export default Header;