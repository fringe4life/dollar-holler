import { createId } from '@paralleldrive/cuid2'
import type { Transaction } from '@rocicorp/zero'
import type { Schema } from '../../../zero-schema.gen'

export type Mutators = {
  clients: {
    upsert: (
      tx: Transaction<Schema>,
      data: {
        id?: string
        userId: string
        name: string
        email?: string | null
        street?: string | null
        city?: string | null
        state?: string | null
        zip?: string | null
        clientStatus?: 'active' | 'archive' | null
      }
    ) => Promise<void>
    delete: (tx: Transaction<Schema>, { id }: { id: string }) => Promise<void>
  }
  invoices: {
    upsert: (
      tx: Transaction<Schema>,
      data: {
        id?: string
        userId: string
        invoiceNumber: string
        clientId: string
        subject?: string | null
        issueDate: string
        dueDate: string
        discount?: number | null
        notes?: string | null
        terms?: string | null
        invoiceStatus?: 'draft' | 'sent' | 'paid' | null
      }
    ) => Promise<void>
    delete: (tx: Transaction<Schema>, { id }: { id: string }) => Promise<void>
  }
}

export function createMutators(): Mutators {
  return {
    clients: {
      upsert: async (tx, data) => {
        // Generate ID if not provided
        const id = data.id || createId()
        await tx.mutate.clients.upsert({ ...data, id })
      },
      delete: async (tx, { id }) => {
        await tx.mutate.clients.delete({ id })
      },
    },
    invoices: {
      upsert: async (tx, data) => {
        // Generate ID if not provided
        const id = data.id || createId()
        await tx.mutate.invoices.upsert({ ...data, id })
      },
      delete: async (tx, { id }) => {
        await tx.mutate.invoices.delete({ id })
      },
    },
  }
}
