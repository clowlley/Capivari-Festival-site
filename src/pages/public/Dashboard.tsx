import React from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import PageWrapper from '@/components/layout/PageWrapper';
import styles from './Dashboard.module.css';

const Dashboard: React.FC = () => {
  return (
    <div className={styles.dashboardLayout}>
      <Sidebar />
      <div className={styles.mainContent}>
        <Header />
        <PageWrapper>
          <h1 className={styles.welcomeTitle}>Bem-vindo ao Painel Administrativo!</h1>
          <p className={styles.dashboardText}>Aqui você pode gerenciar todos os aspectos do seu site Capivari.</p>
          {/* Adicionar aqui widgets ou resumos futuros */}
        </PageWrapper>
      </div>
    </div>
  );
};

export default Dashboard;