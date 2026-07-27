import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/login/LoginView.vue'),
      meta: { guest: true },
    },
    {
      path: '/',
      name: 'hardware',
      component: () => import('@/pages/hardware/HardwareView.vue'),
      meta: { requiresAuth: true, title: 'مدیریت سخت‌افزار' },
    },
    {
      path: '/ai-chat',
      name: 'ai-chat',
      component: () => import('@/pages/ai/AiChatView.vue'),
      meta: { requiresAuth: true, title: 'چت هوش مصنوعی' },
    },
    {
      path: '/todos',
      name: 'todos',
      component: () => import('@/pages/todo/TodoView.vue'),
      meta: { requiresAuth: true, title: 'وظایف' },
    },
    {
      path: '/calendar',
      name: 'calendar',
      component: () => import('@/pages/calendar/CalendarView.vue'),
      meta: { requiresAuth: true, title: 'تقویم' },
    },
    {
      path: '/units',
      name: 'units',
      component: () => import('@/pages/units/UnitsView.vue'),
      meta: { requiresAuth: true, title: 'مراکز' },
    },
    {
      path: '/tickets',
      name: 'tickets',
      component: () => import('@/pages/tickets/TicketsView.vue'),
      meta: { requiresAuth: true, title: 'تیکت‌ها' },
    },
    {
      path: '/tickets/new',
      name: 'tickets-new',
      component: () => import('@/pages/tickets/TicketNewView.vue'),
      meta: { requiresAuth: true, title: 'تیکت جدید' },
    },
    {
      path: '/tickets/:id',
      name: 'ticket-detail',
      component: () => import('@/pages/tickets/TicketDetailView.vue'),
      meta: { requiresAuth: true, title: 'جزئیات تیکت' },
    },
  ],
})

router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next({ name: 'login' })
  } else if (to.meta.guest && auth.isAuthenticated) {
    next({ name: 'hardware' })
  } else {
    next()
  }
})

export default router
