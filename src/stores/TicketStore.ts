import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/utils/api'
import type { Ticket, TicketStatus, TicketPriority, PaginatedMeta } from '@/types/api'

export const useTicketStore = defineStore('ticket', () => {
  const tickets = ref<Ticket[]>([])
  const current = ref<Ticket | null>(null)
  const meta = ref<PaginatedMeta | null>(null)
  const loading = ref(false)

  async function fetchAll(params?: {
    status?: TicketStatus
    priority?: TicketPriority
    assigned_to_me?: boolean
    page?: number
    per_page?: number
  }) {
    loading.value = true
    try {
      const { data } = await api.get('/tickets', { params })
      tickets.value = data.data ?? []
      meta.value = data.meta ?? null
    } catch {
      tickets.value = []
      meta.value = null
    } finally {
      loading.value = false
    }
  }

  async function fetchOne(id: number): Promise<Ticket | null> {
    loading.value = true
    try {
      const { data } = await api.get(`/tickets/${id}`)
      current.value = data.data ?? null
      return current.value
    } catch {
      current.value = null
      return null
    } finally {
      loading.value = false
    }
  }

  async function create(payload: {
    subject: string
    content: string
    priority: TicketPriority
    unit_id: number
    deadline?: string
  }): Promise<Ticket | null> {
    try {
      const { data } = await api.post('/tickets', payload)
      return data.data ?? null
    } catch {
      return null
    }
  }

  async function update(id: number, payload: Partial<Ticket>): Promise<Ticket | null> {
    try {
      const { data } = await api.put(`/tickets/${id}`, payload)
      return data.data ?? null
    } catch {
      return null
    }
  }

  async function remove(id: number) {
    await api.delete(`/tickets/${id}`)
  }

  async function assign(ticketId: number, userId: number): Promise<Ticket | null> {
    const { data } = await api.post(`/tickets/${ticketId}/assign`, { user_id: userId })
    return data.data ?? null
  }

  async function accept(ticketId: number): Promise<Ticket | null> {
    const { data } = await api.post(`/tickets/${ticketId}/accept`)
    return data.data ?? null
  }

  async function complete(ticketId: number): Promise<Ticket | null> {
    const { data } = await api.post(`/tickets/${ticketId}/complete`)
    return data.data ?? null
  }

  return {
    tickets, current, meta, loading,
    fetchAll, fetchOne, create, update, remove,
    assign, accept, complete,
  }
})
