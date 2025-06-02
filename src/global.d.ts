import type { BadgeVariant } from '$lib/components/ui/badge'

interface Invoice {
  client: Client
  createdAt: string
  dueDate?: string
  invoiceStatus: BadgeVariant
  issueDate: string
  invoiceNumber: number
  id: string
  lineItems?: LineItem[]
  notes?: string
  subject?: string
  terms?: string
}

interface Client {
  city: string
  clientStatus?: ClientStatus
  email: string
  id: string
  name: string
  street: string
  state: string
  zip: string
}

interface LineItem {
  amount: number
  description: string
  id: string
  quantity: number
}

type ClientStatus = 'active' | 'archived'
