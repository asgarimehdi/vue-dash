import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/utils/api'
import type { Todo, TodoFormData } from '@/types/api'

export const useTodoStore = defineStore('todo', () => {
  const items = ref<Todo[]>([])
  const loading = ref(false)

  async function fetchList(params?: { date?: string; month?: number; year?: number; is_completed?: boolean }) {
    loading.value = true
    try {
      const { data } = await api.get('/todos', { params })
      items.value = Array.isArray(data) ? data : data.data ?? []
    } catch (e: any) {
      items.value = []
      console.error('Error fetching todos:', e?.response?.data || e.message)
    } finally {
      loading.value = false
    }
  }

  async function create(payload: TodoFormData): Promise<Todo> {
    const { data } = await api.post('/todos', payload)
    return data.data ?? data
  }

  async function update(id: number, payload: Partial<TodoFormData>): Promise<Todo> {
    const { data } = await api.put(`/todos/${id}`, payload)
    return data.data ?? data
  }

  async function remove(id: number) {
    await api.delete(`/todos/${id}`)
  }

  async function toggleComplete(id: number): Promise<Todo> {
    const { data } = await api.post(`/todos/${id}/toggle-complete`)
    return data.data ?? data
  }

  return { items, loading, fetchList, create, update, remove, toggleComplete }
})
