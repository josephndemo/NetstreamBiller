import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldAlert, ShieldCheck, Search, Filter } from 'lucide-react';

export const Customers = () => {
  const { customers, plans, toggleCustomerStatus } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.ipAddress || '').includes(search);
    const matchesFilter = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Subscriber Management</h2>
          <p className="text-slate-500 text-sm">Control account statuses, IPs, and plan details</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by name, email, or IP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 text-sm rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
            <option value="Onboarding">Onboarding</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="p-4">Subscriber</th>
              <th className="p-4">Plan & Speed</th>
              <th className="p-4">Assigned IP</th>
              <th className="p-4">Address</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm">
            {filteredCustomers.map((customer) => {
              const plan = plans.find((p) => p.id === customer.planId);
              return (
                <tr key={customer.id} className="hover:bg-slate-50">
                  <td className="p-4">
                    <p className="font-semibold text-slate-800">{customer.fullName}</p>
                    <p className="text-xs text-slate-500">{customer.email}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-slate-800">{plan?.name}</p>
                    <p className="text-xs text-slate-500">{plan?.speed}</p>
                  </td>
                  <td className="p-4 font-mono text-xs text-slate-600">{customer.ipAddress}</td>
                  <td className="p-4 text-slate-600">
                    {customer.address}, {customer.city}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                        customer.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700'
                          : customer.status === 'Suspended'
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {customer.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {customer.status !== 'Onboarding' && (
                      <button
                        onClick={() => toggleCustomerStatus(customer.id)}
                        className={`inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                          customer.status === 'Active'
                            ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                            : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {customer.status === 'Active' ? (
                          <>
                            <ShieldAlert className="w-3.5 h-3.5" /> Suspend
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5" /> Activate
                          </>
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
