import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import PageWrapper from '@/components/layout/PageWrapper';
import styles from './AdminDashboard.module.css';

const AdminDashboard: React.FC = () => {
  return (
    <div className={styles.dashboardLayout}>
      <Sidebar />
      <Header />
      <div className={styles.mainContent}>
        <PageWrapper>
          <Outlet />
        </PageWrapper>
      </div>
    </div>
  );
};

export default AdminDashboard;
