import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import api from '@/utils/api'
import type { Person, PaginatedMeta } from '@/types/api'

export const usePersonStore = defineStore('person', () => {
  const items = ref<Person[]>([])
  const meta = ref<PaginatedMeta | null>(null)
  const loading = ref(false)
  const error = ref('')
  const search = ref('')

  async function fetchList(params?: { search?: string; unit_id?: number; page?: number }) {
    loading.value = true
    error.value = ''
    try {
      const queryParams: Record<string, any> = { page: params?.page || 1 }
      if (params?.search) queryParams.search = params.search
      if (params?.unit_id) queryParams.unit_id = params.unit_id

      const { data } = await api.get('/persons', { params: queryParams })
      items.value = data.data ?? []
      meta.value = data.meta ?? null
    } catch (e: any) {
      error.value = 'خطا در دریافت لیست پرسنل'
      items.value = []
    } finally {
      loading.value = false
    }
  }

  return { items, meta, loading, error, search, fetchList }
})
