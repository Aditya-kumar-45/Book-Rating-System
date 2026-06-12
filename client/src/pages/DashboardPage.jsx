import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminPanel from './AdminPanel';
import ReaderView from './ReaderView';

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="container" style={{ paddingTop: '32px', paddingBottom: '60px' }}>
      <div className="animate-fade-in" style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>
          Welcome back,{' '}
          <span className="gradient-text">{user?.username || user?.name || 'Reader'}</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {isAdmin
            ? 'Manage your book collection and monitor ratings.'
            : 'Discover books and share your ratings with the community.'}
        </p>
      </div>

      {isAdmin ? <AdminPanel /> : <ReaderView />}
    </div>
  );
}
