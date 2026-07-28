<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useReportStore } from '@/stores/reports'

const store = useReportStore()
const activeTab = ref<'units' | 'tickets' | 'todos'>('units')

const tabConfig = {
  units: { label: 'واحدها', icon: '🏢' },
  tickets: { label: 'تیکت‌ها', icon: '🎫' },
  todos: { label: 'وظایف', icon: '✅' },
}

onMounted(() => store.fetchAll())

const statusLabels: Record<string, string> = {
  created: 'جدید',
  forwarded: 'ارجاع شده',
  accepted: 'در حال پیگیری',
  completed: 'تکمیل',
  rejected: 'رد شده',
}

const priorityLabels: Record<string, string> = {
  urgent: 'فوری',
  normal: 'معمولی',
  low: 'کم',
}

const statusColors: Record<string, string> = {
  created: 'bg-warning text-warning-content',
  forwarded: 'bg-info text-info-content',
  accepted: 'bg-primary text-primary-content',
  completed: 'bg-success text-success-content',
  rejected: 'bg-error text-error-content',
}

const totalTodos = computed(() => (store.todoReport?.completed ?? 0) + (store.todoReport?.pending ?? 0))
</script>

<template>
  <div dir="rtl">
    <h2 class="text-2xl font-bold mb-6">گزارشات 📊</h2>

    <!-- Tabs -->
    <div role="tablist" class="tabs tabs-box mb-6">
      <button
        v-for="(cfg, key) in tabConfig"
        :key="key"
        role="tab"
        :class="['tab', activeTab === key ? 'tab-active' : '']"
        @click="activeTab = key"
      >
        {{ cfg.icon }} {{ cfg.label }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="store.loading" class="flex justify-center py-20">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <!-- Error -->
    <div v-else-if="store.error" class="alert alert-error">{{ store.error }}</div>

    <!-- ===== Units Report ===== -->
    <div v-else-if="activeTab === 'units' && store.unitReport" class="space-y-6">
      <div class="stats shadow grid grid-cols-1 sm:grid-cols-3">
        <div class="stat">
          <div class="stat-title">کل واحدها</div>
          <div class="stat-value text-primary">{{ store.unitReport.total }}</div>
        </div>
        <div class="stat">
          <div class="stat-title">دارای محدوده</div>
          <div class="stat-value text-success">{{ store.unitReport.with_boundary }}</div>
        </div>
        <div class="stat">
          <div class="stat-title">بدون محدوده</div>
          <div class="stat-value text-error">{{ store.unitReport.without_boundary }}</div>
        </div>
      </div>

      <div class="card bg-base-100 border border-base-300 shadow-sm">
        <div class="card-body">
          <h3 class="card-title text-sm">بر اساس نوع واحد</h3>
          <div v-if="Object.keys(store.unitReport.by_type).length" class="space-y-3 mt-3">
            <div v-for="(count, type) in store.unitReport.by_type" :key="type" class="flex items-center gap-3">
              <span class="w-32 text-sm">{{ type }}</span>
              <div class="flex-1 bg-base-200 rounded-full h-4">
                <div
                  class="bg-primary h-4 rounded-full transition-all"
                  :style="{ width: `${(count / store.unitReport.total) * 100}%` }"
                ></div>
              </div>
              <span class="text-sm font-medium w-8">{{ count }}</span>
            </div>
          </div>
          <p v-else class="text-sm opacity-50 mt-2">داده‌ای موجود نیست</p>
        </div>
      </div>
    </div>

    <!-- ===== Tickets Report ===== -->
    <div v-else-if="activeTab === 'tickets' && store.ticketReport" class="space-y-6">
      <div class="stats shadow">
        <div class="stat">
          <div class="stat-title">کل تیکت‌ها</div>
          <div class="stat-value text-primary">{{ store.ticketReport.total }}</div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="card bg-base-100 border border-base-300 shadow-sm">
          <div class="card-body">
            <h3 class="card-title text-sm">بر اساس وضعیت</h3>
            <div class="space-y-2 mt-3">
              <div
                v-for="(count, status) in store.ticketReport.by_status"
                :key="status"
                class="flex items-center justify-between"
              >
                <span :class="['badge badge-sm', statusColors[status] || '']">
                  {{ statusLabels[status] || status }}
                </span>
                <span class="font-medium">{{ count }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="card bg-base-100 border border-base-300 shadow-sm">
          <div class="card-body">
            <h3 class="card-title text-sm">بر اساس اولویت</h3>
            <div class="space-y-2 mt-3">
              <div
                v-for="(count, priority) in store.ticketReport.by_priority"
                :key="priority"
                class="flex items-center justify-between"
              >
                <span>{{ priorityLabels[priority] || priority }}</span>
                <span class="font-medium">{{ count }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== Todos Report ===== -->
    <div v-else-if="activeTab === 'todos' && store.todoReport" class="space-y-6">
      <div class="stats shadow grid grid-cols-1 sm:grid-cols-3">
        <div class="stat">
          <div class="stat-title">مجموع</div>
          <div class="stat-value text-primary">{{ totalTodos }}</div>
        </div>
        <div class="stat">
          <div class="stat-title">تکمیل شده</div>
          <div class="stat-value text-success">{{ store.todoReport.completed }}</div>
        </div>
        <div class="stat">
          <div class="stat-title">در انتظار</div>
          <div class="stat-value text-warning">{{ store.todoReport.pending }}</div>
        </div>
      </div>

      <div v-if="store.todoReport.overdue > 0" class="alert alert-warning">
        ⚠️ {{ store.todoReport.overdue }} وظیفه گذشته از موعد مقرر!
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="card bg-base-100 border border-base-300 shadow-sm">
          <div class="card-body">
            <h3 class="card-title text-sm">بر اساس واحد</h3>
            <div v-if="Object.keys(store.todoReport.by_unit).length" class="space-y-2 mt-3">
              <div
                v-for="(count, unit) in store.todoReport.by_unit"
                :key="unit"
                class="flex items-center justify-between text-sm"
              >
                <span>{{ unit }}</span>
                <span class="font-medium">{{ count }}</span>
              </div>
            </div>
            <p v-else class="text-sm opacity-50">داده‌ای موجود نیست</p>
          </div>
        </div>

        <div class="card bg-base-100 border border-base-300 shadow-sm">
          <div class="card-body">
            <h3 class="card-title text-sm">وظایف بر اساس روز</h3>
            <div v-if="store.todoReport.by_day.length" class="overflow-y-auto max-h-64">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>تاریخ</th>
                    <th>تعداد</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="d in store.todoReport.by_day" :key="d.day">
                    <td class="text-xs">{{ d.day }}</td>
                    <td class="font-medium">{{ d.count }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p v-else class="text-sm opacity-50 mt-2">داده‌ای موجود نیست</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-20 opacity-50">
      داده‌ای برای نمایش وجود ندارد
    </div>
  </div>
</template>
