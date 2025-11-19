import { transformNullToUndefined } from '$lib/utils/typeHelpers'
import type { LineItemSelect, NewLineItem } from '$lib/validators'
import { lineItemSelectWithDatesSchema } from '$lib/validators'
import { ArkErrors } from 'arktype'
import { toast } from 'svelte-sonner'

class LineItemsStore {
  // Use $state for reactive class fields
  lineItems = $state<LineItemSelect[]>([])
  loading = $state(false)
  error = $state<string | null>(null)

  // Use $derived for computed values
  isLoaded = $derived(this.lineItems.length > 0 || this.error !== null)

  // Load line items for a specific invoice
  async loadLineItemsByInvoiceId(invoiceId: string): Promise<LineItemSelect[]> {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/line-items`)
      if (!response.ok) {
        throw new Error('Failed to load line items')
      }
      const rawData = await response.json()

      // Validate response with ArkType
      const validationResult = lineItemSelectWithDatesSchema.array()(rawData)
      if (validationResult instanceof ArkErrors) {
        console.error('Invalid line item data received:', validationResult.summary)
        throw new Error('Invalid line item data received from server')
      }

      return validationResult
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load line items'
      console.error('Error loading line items:', err)
      toast.error(errorMessage)
      return []
    }
  }

  // Load all line items (for admin purposes)
  async loadAllLineItems() {
    this.loading = true
    this.error = null

    try {
      const response = await fetch('/api/line-items')
      if (!response.ok) {
        throw new Error('Failed to load line items')
      }
      const rawData = await response.json()

      // Validate response with ArkType
      const validationResult = lineItemSelectWithDatesSchema.array()(rawData)
      if (validationResult instanceof ArkErrors) {
        console.error('Invalid line item data received:', validationResult.summary)
        throw new Error('Invalid line item data received from server')
      }

      // Update the reactive state
      this.lineItems.length = 0
      this.lineItems.push(...validationResult)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load line items'
      this.error = errorMessage
      console.error('Error loading line items:', err)
      toast.error(errorMessage)
    } finally {
      this.loading = false
    }
  }

  // Create line items for an invoice
  async createLineItems(invoiceId: string, items: NewLineItem[]): Promise<LineItemSelect[]> {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/line-items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(items.map(item => transformNullToUndefined(item))),
      })

      if (!response.ok) {
        throw new Error('Failed to create line items')
      }

      const rawData = await response.json()

      // Validate response with ArkType
      const validationResult = lineItemSelectWithDatesSchema.array()(rawData)
      if (validationResult instanceof ArkErrors) {
        console.error('Invalid line item data received:', validationResult.summary)
        throw new Error('Invalid line item data received from server')
      }

      toast.success('Line items created successfully')
      return validationResult
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create line items'
      console.error('Error creating line items:', err)
      toast.error(errorMessage)
      return []
    }
  }

  // Update line items for an invoice (replace all)
  async updateLineItems(invoiceId: string, items: NewLineItem[]): Promise<LineItemSelect[]> {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/line-items`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(items.map(item => transformNullToUndefined(item))),
      })

      if (!response.ok) {
        throw new Error('Failed to update line items')
      }

      const rawData = await response.json()

      // Validate response with ArkType
      const validationResult = lineItemSelectWithDatesSchema.array()(rawData)
      if (validationResult instanceof ArkErrors) {
        console.error('Invalid line item data received:', validationResult.summary)
        throw new Error('Invalid line item data received from server')
      }

      toast.success('Line items updated successfully')
      return validationResult
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update line items'
      console.error('Error updating line items:', err)
      toast.error(errorMessage)
      return []
    }
  }

  // Delete a line item
  async deleteLineItem(lineItemId: string) {
    try {
      const response = await fetch(`/api/line-items/${lineItemId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete line item')
      }

      // Remove from local state
      const index = this.lineItems.findIndex(item => item.id === lineItemId)
      if (index !== -1) {
        this.lineItems.splice(index, 1)
      }

      toast.success('Line item deleted successfully')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete line item'
      console.error('Error deleting line item:', err)
      toast.error(errorMessage)
    }
  }

  // Reset store
  resetLineItems() {
    this.lineItems.length = 0
    this.loading = false
    this.error = null
  }
}

// Create and export a singleton instance
export const lineItemsStore = new LineItemsStore()

// Export convenience methods for backward compatibility
export const {
  lineItems,
  loading,
  error,
  isLoaded,
  loadLineItemsByInvoiceId,
  loadAllLineItems,
  createLineItems,
  updateLineItems,
  deleteLineItem,
  resetLineItems,
} = lineItemsStore
