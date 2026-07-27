import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/utils/api'
import type { User, LoginRequest } from '@/types/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<User | null>(null)
  const loading = ref(false)

  const isAuthenticated = computed(() => !!token.value)
  const userName = computed(() => {
    const p = user.value?.person
    if (p) return `${p.f_name} ${p.l_name}`
    return user.value?.name ?? 'کاربر'
  })

  async function login(credentials: LoginRequest) {
    loading.value = true
    try {
      const { data } = await api.post('/login', credentials)
      token.value = data.token
      localStorage.setItem('token', data.token)
      await fetchUser()
    } finally {
      loading.value = false
    }
  }

  async function fetchUser() {
    if (!token.value) return
    try {
      const { data } = await api.get('/user')
      user.value = data
    } catch {
      logout()
    }
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  return { token, user, loading, isAuthenticated, userName, login, fetchUser, logout }
})
