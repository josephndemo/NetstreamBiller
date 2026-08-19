import React from 'react';
import { LayoutDashboard, Users, UserPlus, CreditCard, FileText, ShieldCheck, Wifi } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export const Sidebar = () => {
  const { activeTab, setActiveTab } = useApp();
  const { isAdmin } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'customers', label: 'All Customers', icon: Users },
    { id: 'add-customer', label: 'New Registration', icon: UserPlus },
    { id: 'billing', label: 'Billing & Invoices', icon: CreditCard },
    { id: 'reports', label: 'Onboarding Reports', icon: FileText },
    ...(isAdmin ? [{ id: 'users', label: 'User Authorization', icon: ShieldCheck }] : []),
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col">
      <div className="p-6 flex items-center space-x-3 border-b border-slate-800">
        <div className="p-2 bg-indigo-600 rounded-lg">
          <Wifi className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight">NetStream</h1>
          <p className="text-xs text-slate-400">ISP Billing & Management</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        ISP Billing System v1.0.0
      </div>
    </aside>
  );
};
