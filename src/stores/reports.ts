import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/utils/api'
import type { UnitReport, TodoReport, TicketReport } from '@/types/api'

export const useReportStore = defineStore('reports', () => {
  const unitReport = ref<UnitReport | null>(null)
  const todoReport = ref<TodoReport | null>(null)
  const ticketReport = ref<TicketReport | null>(null)
  const loading = ref(false)
  const error = ref('')

  async function fetchUnitsReport() {
    loading.value = true
    error.value = ''
    try {
      const { data } = await api.get('/reports/units')
      unitReport.value = data
    } catch {
      error.value = 'خطا در دریافت آمار واحدها'
      unitReport.value = null
    } finally {
      loading.value = false
    }
  }

  async function fetchTodosReport() {
    loading.value = true
    error.value = ''
    try {
      const { data } = await api.get('/reports/todos')
      todoReport.value = data
    } catch {
      error.value = 'خطا در دریافت آمار وظایف'
      todoReport.value = null
    } finally {
      loading.value = false
    }
  }

  async function fetchTicketsReport() {
    loading.value = true
    error.value = ''
    try {
      const { data } = await api.get('/reports/tickets')
      ticketReport.value = data
    } catch {
      error.value = 'خطا در دریافت آمار تیکت‌ها'
      ticketReport.value = null
    } finally {
      loading.value = false
    }
  }

  async function fetchAll() {
    loading.value = true
    error.value = ''
    try {
      const [units, todos, tickets] = await Promise.all([
        api.get('/reports/units'),
        api.get('/reports/todos'),
        api.get('/reports/tickets'),
      ])
      unitReport.value = units.data
      todoReport.value = todos.data
      ticketReport.value = tickets.data
    } catch {
      error.value = 'خطا در دریافت گزارشات'
    } finally {
      loading.value = false
    }
  }

  return {
    unitReport, todoReport, ticketReport, loading, error,
    fetchUnitsReport, fetchTodosReport, fetchTicketsReport, fetchAll,
  }
})
