export type InvoiceStatus = 'draft' | 'sent' | 'paid'

interface Invoice {
  client: Client
  createdAt: string
  discount?: number
  dueDate: string
  id: string
  invoiceNumber: string
  invoiceStatus: InvoiceStatus
  issueDate: string
  lineItems?: LineItem[]
  notes?: string
  subject?: string
  terms?: string
}

interface LineItem {
  amount: number
  description: string
  id: string
  quantity: number
}

interface Client {
  clientStatus?: ClientStatus
  city?: string
  email?: string
  id: string
  name: string
  state?: string
  street?: string
  zip?: string
  invoice?: Invoice[]
}

interface Settings {
  myName: string
  email: string
  street: string
  city: string
  state: string
  zip: string
}
export type ClientStatus = 'active' | 'archive' | 'draft'
