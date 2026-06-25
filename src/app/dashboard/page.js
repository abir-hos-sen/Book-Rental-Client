'use client';

import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import TenantDashboard from '../../components/dashboards/TenantDashboard';
import OwnerDashboard from '../../components/dashboards/OwnerDashboard';
import AdminDashboard from '../../components/dashboards/AdminDashboard';
import { Loader } from 'lucide-react';
import styles from './dashboard.module.css';

export default function DashboardRouterPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader size={48} className={styles.spinner} />
        <h2>Authenticating User...</h2>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className={`${styles.dashboardWrapper} container`}>
      <div className={styles.dashboardHeader}>
        <h1>Control Console</h1>
        <p>Manage your account settings, transactions, property listings, and moderation logs.</p>
      </div>

      {user.role === 'Admin' && <AdminDashboard />}
      {user.role === 'Owner' && <OwnerDashboard />}
      {(user.role === 'Tenant' || user.role === 'User') && <TenantDashboard />}
    </div>
  );
}
