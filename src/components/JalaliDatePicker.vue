<script setup lang="ts">
import { computed } from 'vue'
import DatePicker from 'vue3-persian-datetime-picker'
import { isoToJalali } from '@/utils/helpers'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void
}>()

const pickerValue = computed({
  get: () => {
    if (!props.modelValue) return ''
    if (props.modelValue.includes('-')) {
      return isoToJalali(props.modelValue)
    }
    return props.modelValue
  },
  set: (val: string) => {
    emit('update:modelValue', val)
  },
})
</script>

<template>
  <DatePicker
    v-model="pickerValue"
    format="jYYYY/jMM/jDD"
    display-format="jYYYY/jMM/jDD"
    input-class="input input-bordered w-full"
    placeholder="انتخاب تاریخ"
  />
</template>
