<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTicketStore } from '@/stores/TicketStore'
import { formatJalali } from '@/utils/helpers'
import type { Ticket } from '@/types/api'

const route = useRoute()
const router = useRouter()
const store = useTicketStore()

const ticket = ref<Ticket | null>(null)
const loading = ref(true)
const assigning = ref(false)
const actionError = ref('')
const assignUserId = ref('')

const statusConfig: Record<string, { label: string; icon: string; color: string }> = {
  created:    { label: 'جدید',        icon: '🆕', color: 'badge-warning' },
  forwarded:  { label: 'ارجاع شده',   icon: '📨', color: 'badge-info' },
  accepted:   { label: 'در حال پیگیری', icon: '🔄', color: 'badge-primary' },
  completed:  { label: 'پایان یافته',  icon: '✅', color: 'badge-success' },
  rejected:   { label: 'رد شده',      icon: '❌', color: 'badge-error' },
}

onMounted(async () => {
  const id = Number(route.params.id)
  ticket.value = await store.fetchOne(id)
  loading.value = false
})

async function handleAccept() {
  if (!ticket.value) return
  actionError.value = ''
  const result = await store.accept(ticket.value.id)
  if (result) ticket.value = result
  else actionError.value = 'خطا در قبول تیکت'
}

async function handleComplete() {
  if (!ticket.value) return
  actionError.value = ''
  const result = await store.complete(ticket.value.id)
  if (result) ticket.value = result
  else actionError.value = 'خطا در تکمیل تیکت'
}

async function handleAssign() {
  if (!ticket.value || !assignUserId.value) return
  assigning.value = true
  actionError.value = ''
  try {
    const result = await store.assign(ticket.value.id, Number(assignUserId.value))
    if (result) ticket.value = result
    else actionError.value = 'خطا در ارجاع تیکت'
    assignUserId.value = ''
  } finally {
    assigning.value = false
  }
}
</script>

<template>
  <div dir="rtl">
    <!-- Back -->
    <button @click="router.push('/tickets')" class="text-blue-600 hover:underline text-sm mb-4 inline-block">
      &larr; بازگشت به لیست تیکت‌ها
    </button>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-20">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <template v-else-if="ticket">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 class="text-2xl font-bold">{{ ticket.subject }}</h2>
          <span class="text-sm font-mono opacity-40">{{ ticket.ticket_code }}</span>
        </div>
        <span :class="['badge badge-lg', statusConfig[ticket.status]?.color || 'badge-ghost']">
          {{ statusConfig[ticket.status]?.icon }} {{ statusConfig[ticket.status]?.label }}
        </span>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main content -->
        <div class="lg:col-span-2 space-y-4">
          <!-- Content -->
          <div class="card bg-base-100 border border-base-300 shadow-sm">
            <div class="card-body">
              <p class="whitespace-pre-wrap text-sm leading-relaxed">{{ ticket.content }}</p>
            </div>
          </div>

          <!-- Activities -->
          <div v-if="ticket.activities?.length" class="card bg-base-100 border border-base-300 shadow-sm">
            <div class="card-body">
              <h3 class="font-medium text-sm opacity-60 mb-3">فعالیت‌ها</h3>
              <div class="space-y-3">
                <div v-for="act in ticket.activities" :key="act.id" class="flex items-start gap-2 text-sm">
                  <div class="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0"></div>
                  <div>
                    <p class="text-sm">{{ act.description }}</p>
                    <span class="text-xs opacity-40">{{ formatJalali(act.created_at) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-4">
          <!-- Info Card -->
          <div class="card bg-base-100 border border-base-300 shadow-sm">
            <div class="card-body p-4 text-sm">
              <div class="flex justify-between py-1.5 border-b border-base-200">
                <span class="opacity-50">اولویت</span>
                <span :class="ticket.priority === 'urgent' ? 'text-error font-medium' : ''">
                  {{ ticket.priority === 'urgent' ? 'فوری' : ticket.priority === 'normal' ? 'معمولی' : 'کم' }}
                </span>
              </div>
              <div class="flex justify-between py-1.5 border-b border-base-200">
                <span class="opacity-50">واحد</span>
                <span>{{ ticket.unit?.name || '-' }}</span>
              </div>
              <div class="flex justify-between py-1.5 border-b border-base-200">
                <span class="opacity-50">ایجادکننده</span>
                <span class="font-mono text-xs">{{ ticket.user?.n_code || '-' }}</span>
              </div>
              <div class="flex justify-between py-1.5 border-b border-base-200">
                <span class="opacity-50">مسئول</span>
                <span class="font-mono text-xs">{{ ticket.assignee?.n_code || 'تعیین نشده' }}</span>
              </div>
              <div class="flex justify-between py-1.5">
                <span class="opacity-50">ایجاد</span>
                <span>{{ formatJalali(ticket.created_at) }}</span>
              </div>
              <div v-if="ticket.waiting_duration" class="flex justify-between py-1.5">
                <span class="opacity-50">مدت انتظار</span>
                <span :class="['px-2 py-0.5 rounded text-xs', ticket.waiting_duration.class]">
                  {{ ticket.waiting_duration.text }}
                </span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="space-y-2">
            <div v-if="actionError" class="alert alert-error text-sm py-2">{{ actionError }}</div>
            <!-- Accept -->
            <button
              v-if="ticket.status === 'forwarded'"
              @click="handleAccept"
              class="btn btn-primary w-full"
            >
              📩 قبول تیکت
            </button>

            <!-- Complete -->
            <button
              v-if="ticket.status === 'accepted'"
              @click="handleComplete"
              class="btn btn-success w-full"
            >
              ✅ تکمیل تیکت
            </button>

            <!-- Assign -->
            <div v-if="ticket.status === 'created' || ticket.status === 'forwarded'" class="card bg-base-200 border border-base-300">
              <div class="card-body p-3">
                <h4 class="text-xs font-medium opacity-60 mb-2">ارجاع به:</h4>
                <div class="flex gap-2">
                  <input
                    v-model="assignUserId"
                    type="number"
                    class="input input-bordered input-sm flex-1"
                    placeholder="شناسه کاربر"
                  />
                  <button
                    @click="handleAssign"
                    :disabled="!assignUserId || assigning"
                    class="btn btn-info btn-sm"
                  >
                    {{ assigning ? '...' : 'ارجاع' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Not found -->
    <div v-else class="text-center py-20 opacity-50">
      تیکت مورد نظر یافت نشد
    </div>
  </div>
</template>
