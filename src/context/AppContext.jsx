import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [customers, setCustomers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [customerData, planData, invoiceData] = await Promise.all([
        apiRequest('/api/customers'),
        apiRequest('/api/plans'),
        apiRequest('/api/invoices'),
      ]);
      setCustomers(customerData.map((customer) => ({
        ...customer,
        fullName: customer.full_name,
        zipCode: customer.zip_code,
        planId: customer.plan_id,
        ipAddress: customer.ip_address,
        onboardedDate: customer.onboarded_date,
      })));
      setPlans(planData);
      setInvoices(invoiceData.map((invoice) => ({
        ...invoice,
        customerId: invoice.customer_id,
        customerName: invoice.customer_name,
        dueDate: invoice.due_date,
        generatedDate: invoice.generated_date,
      })));
    } catch (loadError) {
      setError(loadError.message || 'Unable to load billing data from the backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addCustomer = async (customerData) => {
    await apiRequest('/api/customers', {
      method: 'POST',
      body: JSON.stringify({
        full_name: customerData.fullName,
        email: customerData.email,
        phone: customerData.phone,
        address: customerData.address,
        city: customerData.city,
        state: customerData.state,
        zip_code: customerData.zipCode,
        plan_id: customerData.planId,
      }),
    });
    await loadData();
  };

  const toggleCustomerStatus = async (customerId) => {
    const customer = customers.find((currentCustomer) => currentCustomer.id === customerId);
    if (!customer) return;
    const nextStatus = customer.status === 'Active' ? 'Suspended' : 'Active';
    await apiRequest(`/api/customers/${customerId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: nextStatus }),
    });
    await loadData();
  };

  const completeOnboarding = async (customerId, assignedIp) => {
    await apiRequest(`/api/customers/${customerId}/provision`, {
      method: 'POST',
      body: JSON.stringify({ ip_address: assignedIp }),
    });
    await loadData();
  };

  const recordPayment = async (invoiceId) => {
    await apiRequest(`/api/invoices/${invoiceId}/payment`, { method: 'POST' });
    await loadData();
  };

  return (
    <AppContext.Provider
      value={{
        customers,
        plans,
        invoices,
        activeTab,
        setActiveTab,
        loading,
        error,
        loadData,
        addCustomer,
        toggleCustomerStatus,
        completeOnboarding,
        recordPayment,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
