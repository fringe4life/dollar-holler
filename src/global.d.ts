export interface Invoice {
  client: Client
  createdAt: string
  dueDate: string
  id: string
  invoiceNumber: string
  invoiceStatus: InvoiceStatus
  issueDate: string
  lineItems?: LineItem[]
  notes?: string
  subject?: string
  terms?: string
  discount?: number
}

export interface Settings {
  myName: string
  email: string
  street: string
  city: string
  state: string
  zip: string
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid'

export interface LineItem {
  amount: number
  description: string
  id: string
  quantity: number
}

export interface Client {
  clientStatus?: ClientStatus
  city: string
  email: string
  id: string
  name: string
  state: string
  street: string
  zip: string
  invoices?: Invoice[]
}

export type ClientStatus = 'active' | 'archive' | 'draft'
