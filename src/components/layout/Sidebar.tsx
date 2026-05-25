import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';
import {
  FiHome, FiCalendar, FiDollarSign, FiImage,
  FiList, FiCheckSquare, FiBriefcase, FiRss, FiShoppingBag, FiMusic, FiSettings, FiMail, FiMonitor
} from 'react-icons/fi';
import logo from '@/assets/capivarilogo.png';

const Sidebar: React.FC = () => {
  const menuItems = [
    { path: '/admin/overview', icon: FiHome, label: 'Visão Geral' },
    { path: '/admin/events', icon: FiCalendar, label: 'Eventos' },
    { path: '/admin/financial', icon: FiDollarSign, label: 'Financeiro' },
    { path: '/admin/gallery', icon: FiImage, label: 'Galeria' },
    { path: '/admin/nlista', icon: FiList, label: 'NLista' },
    { path: '/admin/operational', icon: FiCheckSquare, label: 'Operacional' },
    { path: '/admin/products', icon: FiShoppingBag, label: 'Produtos' },
    { path: '/admin/artists', icon: FiMusic, label: 'Artistas' },
    { path: '/admin/projects', icon: FiBriefcase, label: 'Projetos' },
    { path: '/admin/rss', icon: FiRss, label: 'RSS' },
    { path: '/admin/contact', icon: FiMail, label: 'Contato' },
    { path: '/admin/displays', icon: FiMonitor, label: 'Telões' },
    { path: '/admin/settings', icon: FiSettings, label: 'Configurações' },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <NavLink to="/admin/overview">
          <img src={logo} alt="Capivari Logo" className={styles.logoImage} />
        </NavLink>
      </div>
      <nav className={styles.nav}>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin'}
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

export default Sidebar;