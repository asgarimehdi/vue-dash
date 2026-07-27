<script setup lang="ts">
import { ref } from 'vue'
import { useHardwareStore } from '@/stores/hardware'
import { HARDWARE_TYPE_LABELS, NET_TYPE_LABELS } from '@/utils/helpers'

const store = useHardwareStore()

const expanded = ref(false)

function apply() {
  store.filters.page = 1
  store.fetchList()
}
</script>

<template>
  <div class="collapse collapse-arrow bg-base-100 border border-base-300 mb-4 rounded-box">
    <input type="checkbox" v-model="expanded" />
    <div class="collapse-title text-sm font-medium">فیلترهای پیشرفته</div>
    <div class="collapse-content">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <!-- Search -->
        <div class="form-control">
          <label class="label py-1"><span class="label-text text-xs">جستجوی کلی</span></label>
          <input v-model="store.filters.search" @input="apply" class="input input-bordered input-sm" placeholder="نام، IP، MAC..." />
        </div>

        <!-- Type -->
        <div class="form-control">
          <label class="label py-1"><span class="label-text text-xs">نوع دستگاه</span></label>
          <select v-model="store.filters.type" @change="apply" class="select select-bordered select-sm">
            <option value="">همه</option>
            <option v-for="(lbl, key) in HARDWARE_TYPE_LABELS" :key="key" :value="key">{{ lbl }}</option>
          </select>
        </div>

        <!-- OS -->
        <div class="form-control">
          <label class="label py-1"><span class="label-text text-xs">سیستم عامل</span></label>
          <input v-model="store.filters.os" @input="apply" class="input input-bordered input-sm" placeholder="مثلاً Windows 10" />
        </div>

        <!-- CPU -->
        <div class="form-control">
          <label class="label py-1"><span class="label-text text-xs">پردازنده</span></label>
          <input v-model="store.filters.cpu" @input="apply" class="input input-bordered input-sm" placeholder="مثلاً Intel i5" />
        </div>

        <!-- RAM -->
        <div class="form-control">
          <label class="label py-1"><span class="label-text text-xs">RAM</span></label>
          <input v-model="store.filters.ram" @input="apply" class="input input-bordered input-sm" placeholder="مثلاً 8 یا 16" />
        </div>

        <!-- HDD -->
        <div class="form-control">
          <label class="label py-1"><span class="label-text text-xs">هارد</span></label>
          <input v-model="store.filters.hdd" @input="apply" class="input input-bordered input-sm" placeholder="مثلاً SSD 256" />
        </div>

        <!-- Net Type -->
        <div class="form-control">
          <label class="label py-1"><span class="label-text text-xs">نوع شبکه</span></label>
          <select v-model="store.filters.net_type" @change="apply" class="select select-bordered select-sm">
            <option value="">همه</option>
            <option v-for="(lbl, key) in NET_TYPE_LABELS" :key="key" :value="key">{{ lbl }}</option>
          </select>
        </div>

        <!-- Shutdown -->
        <div class="form-control">
          <label class="label py-1"><span class="label-text text-xs">وضعیت</span></label>
          <select v-model="store.filters.shutdown" @change="apply" class="select select-bordered select-sm">
            <option value="">همه</option>
            <option value="true">خاموش</option>
            <option value="false">روشن</option>
          </select>
        </div>

        <!-- Mark -->
        <div class="form-control">
          <label class="label py-1"><span class="label-text text-xs">علامت‌دار</span></label>
          <select v-model="store.filters.mark" @change="apply" class="select select-bordered select-sm">
            <option value="">همه</option>
            <option value="true">بله</option>
            <option value="false">خیر</option>
          </select>
        </div>

        <!-- Person -->
        <div class="form-control">
          <label class="label py-1"><span class="label-text text-xs">پرسنل</span></label>
          <input v-model="store.filters.person" @input="apply" class="input input-bordered input-sm" placeholder="نام یا کد ملی" />
        </div>

        <!-- Unit -->
        <div class="form-control">
          <label class="label py-1"><span class="label-text text-xs">واحد سازمانی</span></label>
          <input v-model="store.filters.unit" @input="apply" class="input input-bordered input-sm" placeholder="نام واحد" />
        </div>

        <!-- Semat -->
        <div class="form-control">
          <label class="label py-1"><span class="label-text text-xs">سمت</span></label>
          <input v-model="store.filters.semat" @input="apply" class="input input-bordered input-sm" placeholder="نام سمت" />
        </div>
      </div>
    </div>
  </div>
</template>
