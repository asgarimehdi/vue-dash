import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/utils/api'
import type { Ticket } from '@/types/api'

export const useTicketStore = defineStore('ticket', () => {
  const tickets = ref<Ticket[]>([])
  const loading = ref(false)

  async function fetchTickets(params?: { status?: string; priority?: string; page?: number }) {
    loading.value = true
    try {
      const { data } = await api.get('/tickets', { params })
      tickets.value = data.data ?? []
    } catch {
      tickets.value = []
    } finally {
      loading.value = false
    }
  }

  return { tickets, loading, fetchTickets }
})
