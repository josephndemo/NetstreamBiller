import React, { createContext, useContext, useState } from 'react';
import { INITIAL_CUSTOMERS, INITIAL_PLANS, INITIAL_INVOICES } from '../data/mockData';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [plans] = useState(INITIAL_PLANS);
  const [invoices, setInvoices] = useState(INITIAL_INVOICES);
  const [activeTab, setActiveTab] = useState('dashboard');

  const addCustomer = (customerData) => {
    const nextCustomerNumber = customers.reduce((highestId, customer) => {
      const customerNumber = Number.parseInt(customer.id.replace('CUST-', ''), 10);
      return Number.isNaN(customerNumber) ? highestId : Math.max(highestId, customerNumber);
    }, 1000) + 1;

    const newCustomer = {
      id: `CUST-${nextCustomerNumber}`,
      ...customerData,
      status: 'Onboarding',
      ipAddress: 'Pending Allocation',
      onboardedDate: new Date().toISOString().split('T')[0],
    };
    setCustomers((currentCustomers) => [newCustomer, ...currentCustomers]);
    return newCustomer;
  };

  const toggleCustomerStatus = (customerId) => {
    setCustomers((currentCustomers) =>
      currentCustomers.map((cust) => {
        if (cust.id === customerId) {
          const nextStatus = cust.status === 'Active' ? 'Suspended' : 'Active';
          return { ...cust, status: nextStatus };
        }
        return cust;
      })
    );
  };

  const completeOnboarding = (customerId, assignedIp) => {
    setCustomers((currentCustomers) =>
      currentCustomers.map((cust) =>
        cust.id === customerId
          ? { ...cust, status: 'Active', ipAddress: assignedIp || '192.168.1.' + Math.floor(Math.random() * 200) }
          : cust
      )
    );
  };

  const recordPayment = (invoiceId) => {
    setInvoices((currentInvoices) =>
      currentInvoices.map((inv) => (inv.id === invoiceId ? { ...inv, status: 'Paid' } : inv))
    );
  };

  return (
    <AppContext.Provider
      value={{
        customers,
        plans,
        invoices,
        activeTab,
        setActiveTab,
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
