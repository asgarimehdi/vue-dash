<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const navItems = [
  { name: 'مدیریت سخت‌افزار', path: '/', icon: '🖥️' },
  { name: 'تقویم', path: '/calendar', icon: '📅' },
  { name: 'وظایف (Todo)', path: '/todos', icon: '✅' },
  { name: 'چت هوش مصنوعی', path: '/ai-chat', icon: '🤖' },
]

onMounted(async () => {
  if (auth.isAuthenticated) {
    await auth.fetchUser()
  }
})
</script>

<template>
  <!-- Login (no sidebar) -->
  <RouterView v-if="!auth.isAuthenticated" />

  <!-- Authenticated layout -->
  <div v-else class="drawer lg:drawer-open" dir="rtl">
    <input id="drawer-toggle" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content flex flex-col">
      <!-- Navbar -->
      <div class="navbar bg-base-100 border-b border-base-200 lg:hidden">
        <div class="flex-none">
          <label for="drawer-toggle" class="btn btn-square btn-ghost">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-6 h-6 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </label>
        </div>
        <div class="flex-1 text-lg font-bold">H-Dashboard</div>
        <div class="flex-none gap-2">
          <span class="text-sm">{{ auth.userName }}</span>
        </div>
      </div>
      <!-- Page content -->
      <div class="p-4 md:p-6">
        <RouterView />
      </div>
    </div>
    <!-- Sidebar -->
    <div class="drawer-side z-40">
      <label for="drawer-toggle" class="drawer-overlay"></label>
      <aside class="menu bg-base-200 text-base-content min-h-full w-72 p-4">
        <div class="mb-6 p-2">
          <h1 class="text-xl font-bold">H-Dashboard</h1>
          <p class="text-xs opacity-60">پنل مدیریت سخت‌افزار</p>
        </div>
        <ul class="space-y-1">
          <li v-for="item in navItems" :key="item.path">
            <RouterLink
              :to="item.path"
              class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
              active-class="bg-primary text-primary-content"
            >
              <span>{{ item.icon }}</span>
              <span>{{ item.name }}</span>
            </RouterLink>
          </li>
        </ul>
        <div class="mt-auto pt-4 border-t border-base-300">
          <div class="flex items-center justify-between px-2 py-2">
            <span class="text-sm truncate">{{ auth.userName }}</span>
            <button @click="auth.logout()" class="btn btn-ghost btn-xs text-error">خروج</button>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>
