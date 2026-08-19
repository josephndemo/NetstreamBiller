import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle, Clock, Server } from 'lucide-react';

export const Reports = () => {
  const { customers, completeOnboarding } = useApp();
  const [selectedCust, setSelectedCust] = useState(null);
  const [ipInput, setIpInput] = useState('');

  const onboardingCustomers = customers.filter((c) => c.status === 'Onboarding');

  const handleActivate = (e) => {
    e.preventDefault();
    if (selectedCust) {
      completeOnboarding(selectedCust.id, ipInput);
      setSelectedCust(null);
      setIpInput('');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Onboarded Customers Report</h2>
        <p className="text-slate-500 text-sm">Track pending installations and provision connection lines</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" /> Pending Provisioning Pipeline
          </h3>
          <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2.5 py-1 rounded-full">
            {onboardingCustomers.length} Awaiting Activation
          </span>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="p-4">Customer ID</th>
              <th className="p-4">Name & Address</th>
              <th className="p-4">Registration Date</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm">
            {onboardingCustomers.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="p-4 font-mono text-xs text-slate-600">{c.id}</td>
                <td className="p-4">
                  <p className="font-semibold text-slate-800">{c.fullName}</p>
                  <p className="text-xs text-slate-500">{c.address}, {c.city}</p>
                </td>
                <td className="p-4 text-slate-600">{c.onboardedDate}</td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 rounded-full">
                    <Clock className="w-3 h-3" /> Onboarding
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => setSelectedCust(c)}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    <Server className="w-3.5 h-3.5" /> Provision IP
                  </button>
                </td>
              </tr>
            ))}
            {onboardingCustomers.length === 0 && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-500 text-sm">
                  All onboarded subscribers have been activated and provisioned.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Provisioning Modal */}
      {selectedCust && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Provision Connection</h3>
            <p className="text-xs text-slate-500">
              Assign an IP address to complete activation for <strong className="text-slate-800">{selectedCust.fullName}</strong>.
            </p>

            <form onSubmit={handleActivate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Static IP Assignment</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. 192.168.10.101"
                  value={ipInput}
                  onChange={(e) => setIpInput(e.target.value)}
                  className="w-full p-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCust(null)}
                  className="px-4 py-2 text-xs font-medium border rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-1"
                >
                  <CheckCircle className="w-4 h-4" /> Complete & Activate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};