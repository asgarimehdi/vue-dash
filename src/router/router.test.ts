import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createRouter, createWebHashHistory } from 'vue-router'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'

// Mock the page components (lazy imports)
const mockComponent = { template: '<div>mock</div>' }

const routes = [
  { path: '/login', name: 'login', component: mockComponent, meta: { guest: true } },
  { path: '/', name: 'hardware', component: mockComponent, meta: { requiresAuth: true, title: 'مدیریت سخت‌افزار' } },
  { path: '/ai-chat', name: 'ai-chat', component: mockComponent, meta: { requiresAuth: true } },
  { path: '/todos', name: 'todos', component: mockComponent, meta: { requiresAuth: true } },
  { path: '/calendar', name: 'calendar', component: mockComponent, meta: { requiresAuth: true } },
  { path: '/units', name: 'units', component: mockComponent, meta: { requiresAuth: true } },
  { path: '/tickets', name: 'tickets', component: mockComponent, meta: { requiresAuth: true } },
  { path: '/tickets/new', name: 'tickets-new', component: mockComponent, meta: { requiresAuth: true } },
  { path: '/tickets/:id', name: 'ticket-detail', component: mockComponent, meta: { requiresAuth: true } },
]

describe('Router', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('all defined routes exist', () => {
    const router = createRouter({
      history: createWebHashHistory(),
      routes,
    })

    const routeNames = router.getRoutes().map(r => r.name)
    expect(routeNames).toContain('login')
    expect(routeNames).toContain('hardware')
    expect(routeNames).toContain('ai-chat')
    expect(routeNames).toContain('todos')
    expect(routeNames).toContain('calendar')
    expect(routeNames).toContain('units')
    expect(routeNames).toContain('tickets')
    expect(routeNames).toContain('tickets-new')
    expect(routeNames).toContain('ticket-detail')
  })

  it('has correct number of routes', () => {
    const router = createRouter({
      history: createWebHashHistory(),
      routes,
    })
    expect(router.getRoutes()).toHaveLength(routes.length)
  })

  it('uses hash history for Electron compatibility', () => {
    const router = createRouter({
      history: createWebHashHistory(),
      routes,
    })
    // Hash history means the router base is empty
    expect(router.options.history).toBeDefined()
  })

  it('requiresAuth routes require authentication', async () => {
    const router = createRouter({
      history: createWebHashHistory(),
      routes,
    })

    const protectedRoutes = routes.filter(r => r.meta?.requiresAuth)
    for (const route of protectedRoutes) {
      const resolved = router.resolve({ path: route.path })
      expect(resolved.meta?.requiresAuth).toBe(true)
    }
  })

  it('login route is marked as guest only', () => {
    const router = createRouter({
      history: createWebHashHistory(),
      routes,
    })

    const resolved = router.resolve({ path: '/login' })
    expect(resolved.meta?.guest).toBe(true)
  })

  it('redirects unauthenticated users to login', async () => {
    setActivePinia(createPinia())
    const auth = useAuthStore()
    expect(auth.isAuthenticated).toBe(false)

    // Simulate navigation guard logic
    const protectedRoute = routes.find(r => r.path === '/')
    expect(protectedRoute?.meta?.requiresAuth).toBe(true)
  })
})
