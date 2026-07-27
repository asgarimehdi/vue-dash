<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useTodoStore } from '@/stores/todo'
import { useHardwareStore } from '@/stores/hardware'
import { useTicketStore } from '@/stores/TicketStore'
import { formatJalali, isoToJalali, jalaliToIso, isJalaliDate } from '@/utils/helpers'
import JalaliDatePicker from '@/components/JalaliDatePicker.vue'
import type { Todo } from '@/types/api'
import { Calendar } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import faLocale from '@fullcalendar/core/locales/fa'

const todoStore = useTodoStore()
const ticketStore = useTicketStore()

const calendarEl = ref<HTMLDivElement | null>(null)
let calendar: Calendar | null = null

// Modal state
const showModal = ref(false)
const editingId = ref<number | null>(null)
const modalMode = ref<'create' | 'edit'>('create')
const saving = ref(false)
const formError = ref('')
const formTitle = ref('')
const formStartDate = ref('')
const formStartTime = ref('')
const formEndDate = ref('')
const formEndTime = ref('')

// Event colors
const eventColors = {
  todoPending: '#3b82f6',   // blue
  todoDone: '#10b981',      // green
  ticketUrgent: '#ef4444',  // red
  ticketNormal: '#f59e0b',  // amber
  ticketLow: '#6b7280',     // gray
}

async function loadEvents(startStr?: string, endStr?: string) {
  await todoStore.fetchList()
  try {
    await ticketStore.fetchAll()
  } catch {
    // Ticket store might not exist, do nothing
  }
  return buildEvents()
}

function buildEvents(): any[] {
  const events: any[] = []

  // Todo events
  for (const todo of todoStore.items) {
    events.push({
      id: `todo-${todo.id}`,
      title: todo.title,
      start: todo.start_at,
      end: todo.end_at || todo.start_at,
      color: todo.is_completed ? eventColors.todoDone : eventColors.todoPending,
      allDay: false,
      extendedProps: {
        type: 'todo',
        is_completed: todo.is_completed,
      },
    })
  }

  // Ticket events (if available)
  if (ticketStore.tickets) {
    for (const ticket of ticketStore.tickets) {
      const priorityColors: Record<string, string> = {
        urgent: eventColors.ticketUrgent,
        normal: eventColors.ticketNormal,
        low: eventColors.ticketLow,
      }
      events.push({
        id: `ticket-${ticket.id}`,
        title: `🎫 ${ticket.subject}`,
        start: ticket.created_at,
        color: priorityColors[ticket.priority] || eventColors.ticketNormal,
        allDay: false,
        extendedProps: {
          type: 'ticket',
          ticket_code: ticket.ticket_code,
          status: ticket.status_name || ticket.status,
        },
      })
    }
  }

  return events
}

function initCalendar() {
  if (!calendarEl.value || calendar) return

  calendar = new Calendar(calendarEl.value, {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
    initialView: 'dayGridMonth',
    locale: faLocale,
    direction: 'rtl',
    firstDay: 6,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
    },
    buttonText: {
      today: 'امروز',
      month: 'ماهانه',
      week: 'هفتگی',
      day: 'روزانه',
      list: 'لیست',
    },
    allDayText: 'تمام روز',
    moreLinkText: 'بیشتر',
    noEventsText: 'رویدادی برای نمایش وجود ندارد',
    views: {
      dayGridMonth: {
        titleFormat: { year: 'numeric', month: 'long' },
      },
      timeGridWeek: {
        titleFormat: { year: 'numeric', month: 'long', day: 'numeric' },
      },
      timeGridDay: {
        titleFormat: { year: 'numeric', month: 'long', day: 'numeric' },
      },
    },
    selectable: true,
    editable: true,
    dayMaxEvents: true,
    eventContent: (arg) => {
      const type = arg.event.extendedProps.type || 'todo'
      if (type === 'ticket') {
        const status = arg.event.extendedProps.status || ''
        return {
          html: `<div class="flex items-center gap-1 truncate"><span class="text-sm">🎫</span><span class="fc-event-title text-xs truncate">${arg.event.title.replace('🎫 ', '')} ${status ? `<span class="badge badge-xs badge-ghost">${status}</span>` : ''}</span></div>`,
        }
      }
      const todoId = arg.event.id.replace('todo-', '')
      const isDone = arg.event.extendedProps.is_completed
      const checkIcon = isDone
        ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-3.5 h-3.5 text-green-500"><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" /></svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3.5 h-3.5 opacity-60 hover:text-green-500"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 14.25l2.25 2.25L15 9.75" /></svg>`
      return {
        html: `<div class="flex items-center gap-1 truncate">${checkIcon}<span class="fc-event-title text-xs truncate">${arg.timeText || ''} ${arg.event.title}</span></div>`,
      }
    },
    events: buildEvents(),
    datesSet: async (info) => {
      await todoStore.fetchList({
        // The API might support date range; for now we just fetch all
      })
      if (calendar) {
        calendar.removeAllEvents()
        for (const ev of buildEvents()) {
          calendar.addEvent(ev)
        }
      }
    },
    select: (info) => {
      openCreateModal(info.startStr, info.endStr)
    },
    eventClick: (info) => {
      const type = info.event.extendedProps.type
      if (type === 'ticket') {
        // For now just show an alert
        alert(`تیکت: ${info.event.title}`)
      } else {
        const id = parseInt(info.event.id.replace('todo-', ''))
        editEvent(id)
      }
    },
    eventDrop: async (info) => {
      const type = info.event.extendedProps.type
      if (type === 'todo') {
        const id = parseInt(info.event.id.replace('todo-', ''))
        const start = info.event.startStr
        const end = info.event.endStr
        await todoStore.update(id, {
          start_at: start,
          end_at: end || start,
        })
        await refreshEvents()
      }
    },
  })

  calendar.render()
}

async function refreshEvents() {
  await todoStore.fetchList()
  if (calendar) {
    calendar.removeAllEvents()
    for (const ev of buildEvents()) {
      calendar.addEvent(ev)
    }
  }
}

function openCreateModal(start: string, end: string) {
  modalMode.value = 'create'
  editingId.value = null
  formTitle.value = ''

  // Convert ISO to Jalali for the date pickers
  formStartDate.value = isoToJalali(start)
  formStartTime.value = start.includes('T') ? start.split('T')[1].substring(0, 5) : '00:00'
  formEndDate.value = isoToJalali(end)
  formEndTime.value = end.includes('T') ? end.split('T')[1].substring(0, 5) : '00:00'

  showModal.value = true
}

function editEvent(id: number) {
  const todo = todoStore.items.find(t => t.id === id)
  if (!todo) return

  modalMode.value = 'edit'
  editingId.value = id
  formTitle.value = todo.title
  formStartDate.value = isoToJalali(todo.start_at)
  formStartTime.value = todo.start_at?.includes('T') ? todo.start_at.split('T')[1].substring(0, 5) : '00:00'
  formEndDate.value = isoToJalali(todo.end_at || todo.start_at)
  formEndTime.value = todo.end_at?.includes('T') ? todo.end_at.split('T')[1].substring(0, 5) : '00:00'

  showModal.value = true
}

async function saveTodo() {
  if (!formTitle.value.trim() || !formStartDate.value) return

  saving.value = true
  formError.value = ''

  try {
    const startAt = isJalaliDate(formStartDate.value)
      ? `${jalaliToIso(formStartDate.value)}T${formStartTime.value || '00:00'}:00`
      : formStartDate.value
    
    const endAt = formEndDate.value
      ? isJalaliDate(formEndDate.value)
        ? `${jalaliToIso(formEndDate.value)}T${formEndTime.value || '00:00'}:00`
        : formEndDate.value
      : startAt

    if (editingId.value) {
      await todoStore.update(editingId.value, {
        title: formTitle.value,
        start_at: startAt,
        end_at: endAt,
      })
    } else {
      await todoStore.create({
        title: formTitle.value,
        start_at: startAt,
        end_at: endAt,
        unit_id: null,
      })
    }

    showModal.value = false
    await refreshEvents()
  } catch (e: any) {
    formError.value = e?.response?.data?.message || e?.response?.data?.error || 'خطا در ذخیره‌سازی'
    console.error('Save error:', e?.response?.data || e)
  } finally {
    saving.value = false
  }
}

async function deleteTodo() {
  if (!editingId.value) return
  if (!confirm('آیا از حذف این وظیفه اطمینان دارید؟')) return
  await todoStore.remove(editingId.value)
  showModal.value = false
  await refreshEvents()
}

onMounted(async () => {
  await todoStore.fetchList()
  initCalendar()
})

onBeforeUnmount(() => {
  if (calendar) {
    calendar.destroy()
    calendar = null
  }
})
</script>

<template>
  <div dir="rtl">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-bold">تقویم سازمانی</h2>
    </div>

    <!-- Legend -->
    <div class="flex flex-wrap gap-3 mb-4 px-2">
      <div class="flex items-center gap-1.5">
        <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: eventColors.todoPending }"></div>
        <span class="text-xs">وظیفه در انتظار</span>
      </div>
      <div class="flex items-center gap-1.5">
        <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: eventColors.todoDone }"></div>
        <span class="text-xs">وظیفه انجام شده</span>
      </div>
      <div class="flex items-center gap-1.5">
        <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: eventColors.ticketUrgent }"></div>
        <span class="text-xs">تیکت فوری</span>
      </div>
      <div class="flex items-center gap-1.5">
        <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: eventColors.ticketNormal }"></div>
        <span class="text-xs">تیکت عادی</span>
      </div>
      <div class="flex items-center gap-1.5">
        <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: eventColors.ticketLow }"></div>
        <span class="text-xs">تیکت کم‌اهمیت</span>
      </div>
    </div>

    <!-- Calendar -->
    <div class="card bg-base-100 shadow border border-base-300">
      <div class="card-body p-3">
        <div ref="calendarEl" class="min-h-[600px]" id="calendar"></div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="modal modal-open" @click.self="showModal = false">
      <div class="modal-box max-w-md">
        <h3 class="font-bold text-lg mb-4">
          {{ modalMode === 'create' ? 'تسک جدید' : 'ویرایش تسک' }}
        </h3>
        <form @submit.prevent="saveTodo" class="space-y-4">
          <div class="form-control">
            <label class="label"><span class="label-text">عنوان فعالیت *</span></label>
            <input v-model="formTitle" required class="input input-bordered" placeholder="مثلاً: جلسه فنی" />
          </div>

          <div class="grid grid-cols-1 gap-3">
            <div class="form-control">
              <label class="label"><span class="label-text">تاریخ و ساعت شروع</span></label>
              <div class="grid grid-cols-2 gap-2">
                <JalaliDatePicker v-model="formStartDate" />
                <input v-model="formStartTime" type="time" class="input input-bordered" />
              </div>
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text">تاریخ و ساعت پایان</span></label>
              <div class="grid grid-cols-2 gap-2">
                <JalaliDatePicker v-model="formEndDate" />
                <input v-model="formEndTime" type="time" class="input input-bordered" />
              </div>
            </div>
          </div>

          <div v-if="formError" class="alert alert-error text-sm">{{ formError }}</div>

          <div class="modal-action">
            <button v-if="editingId" type="button" @click="deleteTodo" class="btn btn-error">
              حذف
            </button>
            <button type="submit" :disabled="saving" class="btn btn-primary">
              <span v-if="saving" class="loading loading-spinner loading-sm"></span>
              {{ saving ? 'در حال ذخیره...' : modalMode === 'create' ? 'ذخیره' : 'بروزرسانی' }}
            </button>
            <button type="button" @click="showModal = false" class="btn btn-ghost">انصراف</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* FullCalendar RTL overrides */
:deep(.fc) {
  direction: rtl;
  text-align: right;
}
:deep(.fc .fc-toolbar-title) {
  font-size: 1.25rem;
  font-weight: bold;
}
:deep(.fc .fc-button-primary) {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}
:deep(.fc .fc-button-primary:hover) {
  background-color: var(--color-primary-focus);
}
:deep(.fc .fc-button-primary:not(:disabled).fc-button-active) {
  background-color: var(--color-primary-focus);
}
:deep(.fc .fc-daygrid-event) {
  border-radius: 4px;
  padding: 1px 4px;
  font-size: 0.75rem;
}
:deep(.fc .fc-timegrid-event) {
  border-radius: 4px;
  font-size: 0.75rem;
}
:deep(.fc .fc-day-today) {
  background-color: color-mix(in srgb, var(--color-primary) 8%, transparent);
}
:deep(.fc .fc-event) {
  cursor: pointer;
}
:deep(.fc .fc-more-link) {
  font-size: 0.7rem;
}
:deep(.fc .fc-col-header-cell-cushion) {
  font-weight: 500;
  padding: 4px;
}
:deep(.fc-theme-standard td, .fc-theme-standard th) {
  border-color: var(--color-base-300);
}
:deep(.fc .fc-popover) {
  z-index: 50;
}
</style>
