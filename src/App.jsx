import React, { lazy, Suspense } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';
import { AddCustomer } from './pages/AddCustomer';
import { Reports } from './pages/Reports';
import { Billing } from './pages/Billing';
import { SignIn } from './pages/SignIn';
import { AuthProvider, useAuth } from './context/AuthContext';

const UserManagement = lazy(() => import('./pages/UserManagement').then(({ UserManagement: Page }) => ({ default: Page })));

const MainContent = () => {
  const { activeTab } = useApp();

  return (
    <main className="p-8">
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'customers' && <Customers />}
      {activeTab === 'add-customer' && <AddCustomer />}
      {activeTab === 'reports' && <Reports />}
      {activeTab === 'billing' && <Billing />}
      {activeTab === 'users' && <Suspense fallback={<p className="text-sm text-slate-500">Loading user authorization…</p>}><UserManagement /></Suspense>}
    </main>
  );
};

const AuthenticatedApp = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-slate-950" />;
  if (!user) return <SignIn />;

  return (
    <AppProvider>
      <div className="flex min-h-screen bg-slate-50 font-sans">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <MainContent />
        </div>
      </div>
    </AppProvider>
  );
};

export default function App() {
  return <AuthProvider><AuthenticatedApp /></AuthProvider>;
}
