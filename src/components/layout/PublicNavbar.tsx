import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Menu, X } from 'lucide-react';
import styles from './PublicLayout.module.css';

const PublicNavbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path: string) =>
    path === '/' ? pathname === '/' : pathname === path || pathname.startsWith(path + '/');

  const close = () => setMenuOpen(false);

  return (
    <nav className={styles.navbar}>
      <Link to="/" className={styles.brand}>
        <span className={styles.brandIcon}>
          <span className={styles.brandIconLeaf} />
        </span>
        <span className={styles.brandText}>Capivari Festival</span>
      </Link>

      <ul className={`${styles.links} ${menuOpen ? styles.linksOpen : ''}`}>
        <li><Link to="/" onClick={close} className={isActive('/') ? styles.active : ''}>Home</Link></li>
        <li><Link to="/eventos" onClick={close} className={isActive('/eventos') ? styles.active : ''}>Eventos</Link></li>
        <li><Link to="/artistas" onClick={close} className={isActive('/artistas') ? styles.active : ''}>Artistas</Link></li>
        <li><Link to="/projetos" onClick={close} className={isActive('/projetos') ? styles.active : ''}>Projetos</Link></li>
        <li><Link to="/produtos" onClick={close} className={isActive('/produtos') ? styles.active : ''}>Produtos</Link></li>
        <li><Link to="/galeria" onClick={close} className={isActive('/galeria') ? styles.active : ''}>Galeria</Link></li>
        <li><Link to="/sobre" onClick={close} className={isActive('/sobre') ? styles.active : ''}>Sobre</Link></li>
        <li><Link to="/contato" onClick={close} className={isActive('/contato') ? styles.active : ''}>Contato</Link></li>
      </ul>

      <div className={styles.userArea}>
        {user ? (
          <span className={styles.userRow}>
            <Link to={user.role === 'admin' ? '/admin' : '/painel'} className={styles.navCta} onClick={close}>
              {user.name}
            </Link>
            <button className={styles.logoutBtn} onClick={() => { logout(); close(); }}>Sair</button>
          </span>
        ) : (
          <Link to="/login" className={styles.navCta} onClick={close}>Entrar</Link>
        )}
      </div>

      <button className={styles.hamburger} onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
        {menuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>
    </nav>
  );
};

export default PublicNavbar;
