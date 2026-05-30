import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '@/components/layout/Header';
import UserSidebar from '@/components/layout/UserSidebar';
import PageWrapper from '@/components/layout/PageWrapper';
import styles from '@/pages/admin/AdminDashboard.module.css';

const UserDashboard: React.FC = () => {
  return (
    <div className={styles.dashboardLayout}>
      <UserSidebar />
      <Header />
      <div className={styles.mainContent}>
        <PageWrapper>
          <Outlet />
        </PageWrapper>
      </div>
    </div>
  );
};

export default UserDashboard;
