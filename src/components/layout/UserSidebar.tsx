import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';
import { FiUser, FiUsers } from 'react-icons/fi';
import logo from '@/assets/capivarilogo.png';

const UserSidebar: React.FC = () => {
  const menuItems = [
    { path: '/painel/perfil', icon: FiUser, label: 'Perfil' },
    { path: '/comunidade', icon: FiUsers, label: 'Comunidade' },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <NavLink to="/painel/perfil">
          <img src={logo} alt="Capivari Logo" className={styles.logoImage} />
        </NavLink>
      </div>
      <nav className={styles.nav}>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
            }
          >
            <item.icon className={styles.icon} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default UserSidebar;
