export const INITIAL_PLANS = [
  { id: 'p1', name: 'Home Basic', speed: '25 Mbps', price: 30 },
  { id: 'p2', name: 'Home Turbo', speed: '50 Mbps', price: 45 },
  { id: 'p3', name: 'Fiber Pro', speed: '100 Mbps', price: 70 },
  { id: 'p4', name: 'Business Ultra', speed: '500 Mbps', price: 150 },
];

export const INITIAL_CUSTOMERS = [
  {
    id: 'CUST-1001',
    fullName: 'Jane Doe',
    email: 'jane.doe@example.com',
    phone: '+1 (555) 234-5678',
    address: '123 Maple St, Suite 4B',
    city: 'Newark',
    state: 'NJ',
    zipCode: '07102',
    planId: 'p2',
    ipAddress: '192.168.10.45',
    status: 'Active', // Active, Suspended, Onboarding
    onboardedDate: '2026-06-15',
  },
  {
    id: 'CUST-1002',
    fullName: 'Robert Smith',
    email: 'rsmith@techcorp.io',
    phone: '+1 (555) 876-5432',
    address: '742 Evergreen Terrace',
    city: 'Jersey City',
    state: 'NJ',
    zipCode: '07302',
    planId: 'p3',
    ipAddress: '192.168.10.88',
    status: 'Suspended',
    onboardedDate: '2026-05-10',
  },
  {
    id: 'CUST-1003',
    fullName: 'Michael Brown',
    email: 'mbrown99@gmail.com',
    phone: '+1 (555) 345-6789',
    address: '88 Oak Ridge Rd',
    city: 'Paterson',
    state: 'NJ',
    zipCode: '07501',
    planId: 'p1',
    ipAddress: 'Pending Allocation',
    status: 'Onboarding',
    onboardedDate: '2026-08-18',
  },
];

export const INITIAL_INVOICES = [
  {
    id: 'INV-2026-001',
    customerId: 'CUST-1001',
    customerName: 'Jane Doe',
    amount: 45.0,
    dueDate: '2026-09-01',
    status: 'Paid',
    generatedDate: '2026-08-01',
  },
  {
    id: 'INV-2026-002',
    customerId: 'CUST-1002',
    customerName: 'Robert Smith',
    amount: 140.0,
    dueDate: '2026-08-01',
    status: 'Overdue',
    generatedDate: '2026-07-01',
  },
];
