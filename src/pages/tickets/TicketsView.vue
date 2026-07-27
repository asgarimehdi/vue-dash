<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTicketStore } from '@/stores/TicketStore'
import { useUnitStore } from '@/stores/units'
import { formatJalali } from '@/utils/helpers'
import type { TicketStatus, TicketPriority } from '@/types/api'

const router = useRouter()
const store = useTicketStore()
const unitStore = useUnitStore()

const filterStatus = ref<string>('')
const filterPriority = ref<string>('')
const filterAssignedToMe = ref(false)

const statusConfig: Record<string, { label: string; icon: string; color: string }> = {
  created:    { label: 'جدید',        icon: '🆕', color: 'badge-warning' },
  forwarded:  { label: 'ارجاع شده',   icon: '📨', color: 'badge-info' },
  accepted:   { label: 'در حال پیگیری', icon: '🔄', color: 'badge-primary' },
  completed:  { label: 'پایان یافته',  icon: '✅', color: 'badge-success' },
  rejected:   { label: 'رد شده',      icon: '❌', color: 'badge-error' },
}

const priorityConfig: Record<string, { label: string; color: string }> = {
  urgent: { label: 'فوری', color: 'text-error' },
  normal: { label: 'معمولی', color: 'text-info' },
  low:    { label: 'کم', color: 'text-base-content/50' },
}

onMounted(async () => {
  await Promise.all([
    store.fetchAll(),
    unitStore.fetchAllUnits(),
  ])
})

async function applyFilter() {
  const params: any = { page: 1 }
  if (filterStatus.value) params.status = filterStatus.value
  if (filterPriority.value) params.priority = filterPriority.value
  if (filterAssignedToMe.value) params.assigned_to_me = true
  await store.fetchAll(params)
}

function goToDetail(id: number) {
  router.push(`/tickets/${id}`)
}

function getStatusColor(status: string): string {
  return statusConfig[status]?.color || 'badge-ghost'
}

function getStatusLabel(status: string): string {
  return statusConfig[status]?.label || status
}

const totalPages = computed(() => store.meta?.last_page || 1)
const currentPage = computed(() => store.meta?.current_page || 1)

async function goToPage(page: number) {
  await store.fetchAll({ page })
}
</script>

<template>
  <div dir="rtl">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
      <h2 class="text-2xl font-bold">تیکت‌ها 🎫</h2>
      <RouterLink to="/tickets/new" class="btn btn-primary">
        + تیکت جدید
      </RouterLink>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-2 mb-4">
      <select v-model="filterStatus" @change="applyFilter" class="select select-bordered select-sm">
        <option value="">همه وضعیت‌ها</option>
        <option v-for="(cfg, key) in statusConfig" :key="key" :value="key">{{ cfg.icon }} {{ cfg.label }}</option>
      </select>

      <select v-model="filterPriority" @change="applyFilter" class="select select-bordered select-sm">
        <option value="">همه اولویت‌ها</option>
        <option v-for="(cfg, key) in priorityConfig" :key="key" :value="key">{{ cfg.label }}</option>
      </select>

      <label class="flex items-center gap-1.5 text-sm cursor-pointer">
        <input v-model="filterAssignedToMe" type="checkbox" @change="applyFilter" class="checkbox checkbox-sm" />
        فقط تیکت‌های من
      </label>
    </div>

    <!-- Loading -->
    <div v-if="store.loading" class="flex justify-center py-20">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <!-- Empty -->
    <div v-else-if="store.tickets.length === 0" class="text-center py-20 opacity-50">
      تیکتی یافت نشد
    </div>

    <div v-else>
      <!-- Desktop Table -->
      <div class="hidden md:block overflow-x-auto bg-base-100 rounded-box border border-base-300">
        <table class="table table-pin-rows">
          <thead>
            <tr>
              <th>#</th>
              <th>موضوع</th>
              <th>اولویت</th>
              <th>وضعیت</th>
              <th>واحد</th>
              <th>تاریخ</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="ticket in store.tickets"
              :key="ticket.id"
              class="cursor-pointer hover:bg-base-200"
              @click="goToDetail(ticket.id)"
            >
              <td class="text-xs font-mono opacity-50">{{ ticket.ticket_code }}</td>
              <td class="font-medium">{{ ticket.subject }}</td>
              <td>
                <span :class="priorityConfig[ticket.priority]?.color || ''" class="text-sm">
                  {{ priorityConfig[ticket.priority]?.label }}
                </span>
              </td>
              <td>
                <span :class="['badge badge-sm', getStatusColor(ticket.status)]">
                  {{ getStatusLabel(ticket.status) }}
                </span>
              </td>
              <td class="text-sm opacity-70">{{ ticket.unit?.name || '-' }}</td>
              <td class="text-xs opacity-50">{{ formatJalali(ticket.created_at) }}</td>
              <td>
                <span class="text-xs opacity-40">👈</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Cards -->
      <div class="md:hidden space-y-3">
        <div
          v-for="ticket in store.tickets"
          :key="ticket.id"
          class="card bg-base-100 border border-base-300 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          @click="goToDetail(ticket.id)"
        >
          <div class="card-body p-4">
            <div class="flex items-start justify-between gap-2">
              <div class="flex-1 min-w-0">
                <p class="font-medium truncate">{{ ticket.subject }}</p>
                <p class="text-xs font-mono opacity-40 mt-0.5">{{ ticket.ticket_code }}</p>
              </div>
              <span :class="['badge badge-sm shrink-0', getStatusColor(ticket.status)]">
                {{ getStatusLabel(ticket.status) }}
              </span>
            </div>
            <div class="flex gap-2 mt-2 text-xs">
              <span :class="priorityConfig[ticket.priority]?.color">
                {{ priorityConfig[ticket.priority]?.label }}
              </span>
              <span class="opacity-40">•</span>
              <span class="opacity-60">{{ ticket.unit?.name || '-' }}</span>
              <span class="opacity-40">•</span>
              <span class="opacity-40">{{ formatJalali(ticket.created_at) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex justify-center mt-6">
      <div class="join">
        <button
          v-for="p in totalPages"
          :key="p"
          @click="goToPage(p)"
          :class="['join-item btn btn-sm', p === currentPage ? 'btn-primary' : 'btn-ghost']"
        >
          {{ p }}
        </button>
      </div>
    </div>
  </div>
</template>
