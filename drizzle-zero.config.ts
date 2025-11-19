import { drizzleZeroConfig } from 'drizzle-zero'
import * as drizzleSchema from './src/lib/db/schema'

// Configure which tables and columns to include in Zero schema
export default drizzleZeroConfig(drizzleSchema, {
  tables: {
    // Exclude auth tables - Zero will handle these separately if needed
    user: false,
    session: false,
    account: false,
    verification: false,

    // Include our app tables
    clients: {
      id: true,
      userId: true,
      name: true,
      email: true,
      street: true,
      city: true,
      state: true,
      zip: true,
      clientStatus: true,
      createdAt: true,
      updatedAt: true,
    },
    invoices: {
      id: true,
      userId: true,
      invoiceNumber: true,
      clientId: true,
      subject: true,
      issueDate: true,
      dueDate: true,
      discount: true,
      notes: true,
      terms: true,
      invoiceStatus: true,
      createdAt: true,
      updatedAt: true,
    },
    lineItems: {
      id: true,
      userId: true,
      invoiceId: true,
      description: true,
      quantity: true,
      amount: true,
      createdAt: true,
      updatedAt: true,
    },
    settings: {
      id: true,
      userId: true,
      myName: true,
      email: true,
      street: true,
      city: true,
      state: true,
      zip: true,
      createdAt: true,
      updatedAt: true,
    },
  },
})
