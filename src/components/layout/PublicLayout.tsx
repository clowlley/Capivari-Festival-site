import React from 'react';
import { Link } from 'react-router-dom';
import styles from './PublicLayout.module.css';
import PublicNavbar from './PublicNavbar';

const Footer: React.FC = () => (
  <footer className={styles.footer}>
    <div className={styles.footerTop}>
      <div className={styles.footerBrand}>
        <div className={styles.footerLogo}>
          <span className={styles.footerLogoMark}>
            <span className={styles.footerLogoTriangle} />
          </span>
          <span className={styles.footerLogoText}>Capivari Digital</span>
        </div>
        <p className={styles.footerTagline}>
          Portal oficial de eventos, projetos e gestão da região de Capivari.
          Conectando comunidade e desenvolvimento local.
        </p>
        <div className={styles.footerSocials}>
          <a href="#" className={styles.socialBtn} aria-label="Instagram">IG</a>
          <a href="#" className={styles.socialBtn} aria-label="Facebook">FB</a>
          <a href="#" className={styles.socialBtn} aria-label="YouTube">YT</a>
          <a href="#" className={styles.socialBtn} aria-label="WhatsApp">WA</a>
        </div>
      </div>

      <div className={styles.footerCol}>
        <h4 className={styles.footerColTitle}>Navegação</h4>
        <ul className={styles.footerLinks}>
          <li><Link to="/eventos">Eventos</Link></li>
          <li><Link to="/projetos">Projetos</Link></li>
          <li><Link to="/galeria">Galeria</Link></li>
        </ul>
      </div>

      {/* Serviços — desativado por enquanto
      <div className={styles.footerCol}>
        <h4 className={styles.footerColTitle}>Serviços</h4>
        <ul className={styles.footerLinks}>
          <li><Link to="/cadastrar-evento">Divulgar evento</Link></li>
          <li><Link to="/cadastrar-projeto">Cadastrar projeto</Link></li>
          <li><Link to="/parceiros">Seja parceiro</Link></li>
        </ul>
      </div>
      */}

      <div className={styles.footerCol}>
        <h4 className={styles.footerColTitle}>Sobre</h4>
        <ul className={styles.footerLinks}>
          <li><Link to="/sobre">Sobre o portal</Link></li>
          <li><Link to="/contato">Contato</Link></li>
          <li><Link to="/privacidade">Privacidade</Link></li>
          <li><Link to="/termos">Termos de uso</Link></li>
        </ul>
      </div>
    </div>

    <div className={styles.footerBottom}>
      <p className={styles.footerCopy}>
        © 2026 Todos os direitos reservados a Caique Villela e Capivari Festival.
      </p>
      <div className={styles.footerBottomLinks}>
        <Link to="/privacidade">Privacidade</Link>
        <Link to="/termos">Termos</Link>
        <Link to="/acessibilidade">Acessibilidade</Link>
      </div>
    </div>
  </footer>
);

interface PublicLayoutProps {
  children: React.ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => (
  <>
    <PublicNavbar />
    <main style={{ paddingTop: '64px', minHeight: '100vh', background: '#0d0c0a' }}>
      {children}
    </main>
    <Footer />
  </>
);

export default PublicLayout;
