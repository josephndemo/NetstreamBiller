import React from 'react';
import { useApp } from '../context/AppContext';
import { DollarSign } from 'lucide-react';

export const Billing = () => {
  const { invoices, recordPayment } = useApp();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Billing & Receivables</h2>
        <p className="text-slate-500 text-sm">Manage invoices and track payments</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="p-4">Invoice ID</th>
              <th className="p-4">Subscriber</th>
              <th className="p-4">Due Date</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Payment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-slate-50">
                <td className="p-4 font-mono text-xs text-slate-600">{inv.id}</td>
                <td className="p-4 font-semibold text-slate-800">{inv.customerName}</td>
                <td className="p-4 text-slate-600">{inv.dueDate}</td>
                <td className="p-4 font-semibold text-slate-800">${inv.amount.toFixed(2)}</td>
                <td className="p-4">
                  <span
                    className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                      inv.status === 'Paid'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {inv.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  {inv.status !== 'Paid' && (
                    <button
                      onClick={() => recordPayment(inv.id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                    >
                      <DollarSign className="w-3.5 h-3.5" /> Mark Paid
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
