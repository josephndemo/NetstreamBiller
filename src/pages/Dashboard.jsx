import React from 'react';
import { Users, UserCheck, UserX, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Dashboard = () => {
  const { customers, invoices, setActiveTab } = useApp();

  const totalCustomers = customers.length;
  const activeCount = customers.filter((c) => c.status === 'Active').length;
  const suspendedCount = customers.filter((c) => c.status === 'Suspended').length;
  const onboardingCount = customers.filter((c) => c.status === 'Onboarding').length;
  const pendingRevenue = invoices
    .filter((inv) => inv.status === 'Overdue')
    .reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Operations Dashboard</h2>
        <p className="text-slate-500 text-sm">Real-time subscriber status & billing overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Total Subscribers</span>
            <Users className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-3xl font-bold text-slate-800 mt-2">{totalCustomers}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Active Lines</span>
            <UserCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-bold text-slate-800 mt-2">{activeCount}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Suspended</span>
            <UserX className="w-5 h-5 text-rose-600" />
          </div>
          <p className="text-3xl font-bold text-slate-800 mt-2">{suspendedCount}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Pending Onboarding</span>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-bold text-slate-800 mt-2">{onboardingCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800">Recent Onboarding Queue</h3>
            <button
              onClick={() => setActiveTab('reports')}
              className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-medium"
            >
              View Report <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {customers
              .filter((c) => c.status === 'Onboarding')
              .map((c) => (
                <div key={c.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm text-slate-800">{c.fullName}</p>
                    <p className="text-xs text-slate-500">{c.address}, {c.city}</p>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 rounded-full">
                    Action Required
                  </span>
                </div>
              ))}
            {onboardingCount === 0 && (
              <p className="text-sm text-slate-500 py-4 text-center">No pending onboardings</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800">Overdue Balances</h3>
            <span className="text-xs bg-red-100 text-red-700 font-semibold px-2 py-1 rounded">
              Total Overdue: ${pendingRevenue}
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {invoices
              .filter((inv) => inv.status === 'Overdue')
              .map((inv) => (
                <div key={inv.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm text-slate-800">{inv.customerName}</p>
                    <p className="text-xs text-slate-500">Due: {inv.dueDate}</p>
                  </div>
                  <p className="font-semibold text-sm text-slate-800">${inv.amount}</p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};