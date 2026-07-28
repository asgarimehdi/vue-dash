<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useHardwareStore } from '@/stores/hardware'
import { maskIP, maskMAC, jalaliToIso, isJalaliDate } from '@/utils/helpers'
import JalaliDatePicker from '@/components/JalaliDatePicker.vue'
import type { HardwareFormData } from '@/types/api'

const props = defineProps<{
  editId: number | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved'): void
}>()

const store = useHardwareStore()
const saving = ref(false)
const error = ref('')

const form = reactive<HardwareFormData>({
  n_code: '',
  pc_name: '',
  type: 'pc',
  os: '',
  ip_valid: '',
  ip_local: '',
  mac: '',
  net_type: 'wired',
  switch: '',
  port: '',
  shutdown: false,
  vlan: '',
  motherboard: '',
  cpu: '',
  ram: '',
  hdd: '',
  comments: '',
  mark: false,
  clean_at: '',
})

// Load data if editing
onMounted(async () => {
  if (props.editId) {
    try {
      const item = await store.fetchOne(props.editId)
      form.n_code = item.n_code
      form.pc_name = item.pc_name
      form.type = item.type || 'pc'
      form.os = item.os
      form.ip_valid = item.ip_valid
      form.ip_local = item.ip_local
      form.mac = item.mac
      form.net_type = item.net_type || 'wired'
      form.switch = item.switch
      form.port = item.port
      form.shutdown = item.shutdown
      form.vlan = item.vlan
      form.motherboard = item.motherboard
      form.cpu = item.cpu
      form.ram = item.ram
      form.hdd = item.hdd
      form.comments = item.comments
      form.mark = item.mark
      form.clean_at = item.clean_at || ''
    } catch {
      error.value = 'خطا در بارگذاری اطلاعات'
    }
  }
})

function onBlurIP() {
  if (form.ip_valid) form.ip_valid = maskIP(form.ip_valid)
}

function onBlurLocal() {
  if (form.ip_local) form.ip_local = maskIP(form.ip_local)
}

function onBlurMAC() {
  if (form.mac) form.mac = maskMAC(form.mac)
}

async function handleSubmit() {
  saving.value = true
  error.value = ''

  // Convert Jalali date to ISO for API
  const payload = { ...form }
  if (payload.clean_at && isJalaliDate(payload.clean_at)) {
    payload.clean_at = jalaliToIso(payload.clean_at)
  }

  try {
    if (props.editId) {
      await store.update(props.editId, payload)
    } else {
      await store.create(payload)
    }
    emit('saved')
  } catch (e: any) {
    error.value = e.response?.data?.message || e.response?.data?.error || 'خطا در ذخیره‌سازی'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="modal modal-open" @click.self="emit('close')">
    <div class="modal-box max-w-3xl">
      <h3 class="font-bold text-lg mb-4">
        {{ editId ? 'ویرایش سخت‌افزار' : 'سخت‌افزار جدید' }}
      </h3>

      <form @submit.prevent="handleSubmit" class="space-y-3">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <!-- N_Code -->
          <div class="form-control">
            <label class="label py-1"><span class="label-text">کد ملی پرسنل *</span></label>
            <input v-model="form.n_code" required class="input input-bordered input-sm" placeholder="کد ملی" />
          </div>

          <!-- PC Name -->
          <div class="form-control">
            <label class="label py-1"><span class="label-text">نام سیستم *</span></label>
            <input v-model="form.pc_name" required class="input input-bordered input-sm" placeholder="مثلاً PC-001" />
          </div>

          <!-- Type -->
          <div class="form-control">
            <label class="label py-1"><span class="label-text">نوع</span></label>
            <select v-model="form.type" class="select select-bordered select-sm">
              <option value="pc">کامپیوتر</option>
              <option value="laptop">لپ‌تاپ</option>
              <option value="server">سرور</option>
            </select>
          </div>

          <!-- OS -->
          <div class="form-control">
            <label class="label py-1"><span class="label-text">سیستم عامل</span></label>
            <input v-model="form.os" class="input input-bordered input-sm" placeholder="Windows 10" />
          </div>

          <!-- IP Valid -->
          <div class="form-control">
            <label class="label py-1"><span class="label-text">IP معتبر</span></label>
            <input v-model="form.ip_valid" @blur="onBlurIP" class="input input-bordered input-sm" placeholder="192.168.1.1" maxlength="15" />
          </div>

          <!-- IP Local -->
          <div class="form-control">
            <label class="label py-1"><span class="label-text">IP محلی</span></label>
            <input v-model="form.ip_local" @blur="onBlurLocal" class="input input-bordered input-sm" placeholder="10.0.0.1" maxlength="15" />
          </div>

          <!-- MAC -->
          <div class="form-control">
            <label class="label py-1"><span class="label-text">MAC</span></label>
            <input v-model="form.mac" @blur="onBlurMAC" class="input input-bordered input-sm" placeholder="AA:BB:CC:DD:EE:FF" maxlength="17" />
          </div>

          <!-- Net Type -->
          <div class="form-control">
            <label class="label py-1"><span class="label-text">نوع شبکه</span></label>
            <select v-model="form.net_type" class="select select-bordered select-sm">
              <option value="wired">کابلی</option>
              <option value="wireless">بی‌سیم</option>
              <option value="both">هردو</option>
            </select>
          </div>

          <!-- Switch -->
          <div class="form-control">
            <label class="label py-1"><span class="label-text">سوئیچ</span></label>
            <input v-model="form.switch" class="input input-bordered input-sm" placeholder="نام سوئیچ" />
          </div>

          <!-- Port -->
          <div class="form-control">
            <label class="label py-1"><span class="label-text">پورت</span></label>
            <input v-model="form.port" class="input input-bordered input-sm" placeholder="شماره پورت" />
          </div>

          <!-- VLAN -->
          <div class="form-control">
            <label class="label py-1"><span class="label-text">VLAN</span></label>
            <input v-model="form.vlan" class="input input-bordered input-sm" placeholder="VLAN ID" />
          </div>

          <!-- Motherboard -->
          <div class="form-control">
            <label class="label py-1"><span class="label-text">مادربورد</span></label>
            <input v-model="form.motherboard" class="input input-bordered input-sm" placeholder="مدل مادربورد" />
          </div>

          <!-- CPU -->
          <div class="form-control">
            <label class="label py-1"><span class="label-text">پردازنده</span></label>
            <input v-model="form.cpu" class="input input-bordered input-sm" placeholder="Intel i5" />
          </div>

          <!-- RAM -->
          <div class="form-control">
            <label class="label py-1"><span class="label-text">RAM</span></label>
            <input v-model="form.ram" class="input input-bordered input-sm" placeholder="۸ گیگ" />
          </div>

          <!-- HDD -->
          <div class="form-control">
            <label class="label py-1"><span class="label-text">هارد</span></label>
            <input v-model="form.hdd" class="input input-bordered input-sm" placeholder="SSD 256" />
          </div>

          <!-- Shutdown -->
          <div class="form-control">
            <label class="label py-1"><span class="label-text">خاموش</span></label>
            <input v-model="form.shutdown" type="checkbox" class="toggle toggle-sm mt-2" />
          </div>

          <!-- Clean At -->
          <div class="form-control">
            <label class="label py-1"><span class="label-text">تاریخ پاک‌سازی</span></label>
            <JalaliDatePicker v-model="form.clean_at" />
          </div>

          <!-- Mark -->
          <div class="form-control">
            <label class="label py-1"><span class="label-text">علامت‌دار</span></label>
            <input v-model="form.mark" type="checkbox" class="toggle toggle-sm mt-2" />
          </div>
        </div>

        <!-- Comments (full width) -->
        <div class="form-control">
          <label class="label py-1"><span class="label-text">توضیحات</span></label>
          <textarea v-model="form.comments" class="textarea textarea-bordered textarea-sm" rows="2" placeholder="توضیحات اضافه..."></textarea>
        </div>

        <div v-if="error" class="alert alert-error text-sm">{{ error }}</div>

        <div class="modal-action">
          <button type="submit" :disabled="saving" class="btn btn-primary">
            {{ saving ? 'در حال ذخیره...' : editId ? 'بروزرسانی' : 'ایجاد' }}
          </button>
          <button type="button" @click="emit('close')" class="btn btn-ghost">انصراف</button>
        </div>
      </form>
    </div>
  </div>
</template>
