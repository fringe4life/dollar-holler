import type { ClientWithInvoicesResponse, InvoiceWithRelationsResponse } from '$lib/validators'

// Dummy invoice data
export const dummyInvoices: InvoiceWithRelationsResponse[] = [
  {
    id: '1',
    invoiceNumber: 'INV-001',
    dueDate: '2024-02-15',
    invoiceStatus: 'sent',
    clientId: 'client-1',
    issueDate: '2024-01-15',
    subject: null,
    discount: null,
    notes: null,
    terms: null,
    userId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    client: {
      id: 'client-1',
      name: 'Acme Corporation',
      email: 'billing@acme.com',
      street: '123 Business St',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      clientStatus: 'active',
      userId: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    lineItems: [
      {
        id: '1',
        description: 'Web Development Services',
        quantity: 40,
        amount: 500000, // $5,000.00 in cents
        invoiceId: '1',
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  },
  {
    id: '2',
    invoiceNumber: 'INV-002',
    dueDate: '2024-02-20',
    invoiceStatus: 'paid',
    clientId: 'client-2',
    issueDate: '2024-01-20',
    subject: null,
    discount: null,
    notes: null,
    terms: null,
    userId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    client: {
      id: 'client-2',
      name: 'Tech Solutions Inc',
      email: 'accounts@techsolutions.com',
      street: '456 Innovation Ave',
      city: 'San Francisco',
      state: 'CA',
      zip: '94105',
      clientStatus: 'active',
      userId: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    lineItems: [
      {
        id: '2',
        description: 'Consulting Services',
        quantity: 20,
        amount: 300000, // $3,000.00 in cents
        invoiceId: '2',
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  },
  {
    id: '3',
    invoiceNumber: 'INV-003',
    dueDate: '2024-01-30',
    invoiceStatus: 'sent', // "late" is computed based on due date
    clientId: 'client-3',
    issueDate: '2024-01-01',
    subject: null,
    discount: null,
    notes: null,
    terms: null,
    userId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    client: {
      id: 'client-3',
      name: 'Global Enterprises',
      email: 'finance@global.com',
      street: '789 Corporate Blvd',
      city: 'Chicago',
      state: 'IL',
      zip: '60601',
      clientStatus: 'active',
      userId: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    lineItems: [
      {
        id: '3',
        description: 'Project Management',
        quantity: 30,
        amount: 300000, // $3,000.00 in cents
        invoiceId: '3',
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  },
  {
    id: '4',
    invoiceNumber: 'INV-004',
    dueDate: '2024-02-25',
    invoiceStatus: 'draft',
    clientId: 'client-4',
    issueDate: '2024-01-25',
    subject: null,
    discount: null,
    notes: null,
    terms: null,
    userId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    client: {
      id: 'client-4',
      name: 'Startup Ventures',
      email: 'admin@startupventures.com',
      street: '321 Startup St',
      city: 'Austin',
      state: 'TX',
      zip: '73301',
      clientStatus: 'active',
      userId: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    lineItems: [
      {
        id: '4',
        description: 'Design Services',
        quantity: 15,
        amount: 180000, // $1,800.00 in cents
        invoiceId: '4',
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  }
]

// Dummy client data
export const dummyClients: ClientWithInvoicesResponse[] = [
  {
    id: 'client-1',
    name: 'Acme Corporation',
    email: 'billing@acme.com',
    street: '123 Business St',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    clientStatus: 'active',
    userId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    invoices: [
      {
        id: '1',
        invoiceNumber: 'INV-001',
        dueDate: '2024-02-15',
        invoiceStatus: 'sent',
        clientId: 'client-1',
        issueDate: '2024-01-15',
        subject: null,
        discount: null,
        notes: null,
        terms: null,
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        lineItems: [
          {
            id: '1',
            description: 'Web Development Services',
            quantity: 40,
            amount: 500000,
            invoiceId: '1',
            userId: 'user-1',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]
      }
    ]
  },
  {
    id: 'client-2',
    name: 'Tech Solutions Inc',
    email: 'accounts@techsolutions.com',
    street: '456 Innovation Ave',
    city: 'San Francisco',
    state: 'CA',
    zip: '94105',
    clientStatus: 'active',
    userId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    invoices: [
      {
        id: '2',
        invoiceNumber: 'INV-002',
        dueDate: '2024-02-20',
        invoiceStatus: 'paid',
        clientId: 'client-2',
        issueDate: '2024-01-20',
        subject: null,
        discount: null,
        notes: null,
        terms: null,
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        lineItems: [
          {
            id: '2',
            description: 'Consulting Services',
            quantity: 20,
            amount: 300000,
            invoiceId: '2',
            userId: 'user-1',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]
      }
    ]
  },
  {
    id: 'client-3',
    name: 'Global Enterprises',
    email: 'finance@global.com',
    street: '789 Corporate Blvd',
    city: 'Chicago',
    state: 'IL',
    zip: '60601',
    clientStatus: 'active',
    userId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    invoices: [
      {
        id: '3',
        invoiceNumber: 'INV-003',
        dueDate: '2024-01-30',
        invoiceStatus: 'sent',
        clientId: 'client-3',
        issueDate: '2024-01-01',
        subject: null,
        discount: null,
        notes: null,
        terms: null,
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        lineItems: [
          {
            id: '3',
            description: 'Project Management',
            quantity: 30,
            amount: 300000,
            invoiceId: '3',
            userId: 'user-1',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]
      }
    ]
  },
  {
    id: 'client-4',
    name: 'Startup Ventures',
    email: 'admin@startupventures.com',
    street: '321 Startup St',
    city: 'Austin',
    state: 'TX',
    zip: '73301',
    clientStatus: 'active',
    userId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    invoices: [
      {
        id: '4',
        invoiceNumber: 'INV-004',
        dueDate: '2024-02-25',
        invoiceStatus: 'draft',
        clientId: 'client-4',
        issueDate: '2024-01-25',
        subject: null,
        discount: null,
        notes: null,
        terms: null,
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        lineItems: [
          {
            id: '4',
            description: 'Design Services',
            quantity: 15,
            amount: 180000,
            invoiceId: '4',
            userId: 'user-1',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]
      }
    ]
  }
]
