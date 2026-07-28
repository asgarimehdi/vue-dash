<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const internalValue = ref(props.modelValue || '')
const cssLink = ref<HTMLLinkElement | null>(null)

watch(() => props.modelValue, (val) => {
  internalValue.value = val || ''
})

watch(internalValue, (val) => {
  emit('update:modelValue', val)
})

onMounted(async () => {
  // Dynamically add CSS from CDN (avoids build issues) — skip if already present
  if (!document.querySelector('link[href*="jalalidatepicker@0.6.0"]')) {
    cssLink.value = document.createElement('link')
    cssLink.value.rel = 'stylesheet'
    cssLink.value.href = 'https://unpkg.com/jalalidatepicker@0.6.0/dist/jalaliDatepicker.css'
    document.head.appendChild(cssLink.value)
  }

  const mod = await import('jalalidatepicker')

  if (inputRef.value) {
    inputRef.value.setAttribute('data-jdp', '')
    inputRef.value.setAttribute('data-jdp-time', 'false')
    inputRef.value.setAttribute('data-jdp-format', 'YYYY/MM/DD')

    if (typeof (mod as any).jalaliDatepicker?.startWatch === 'function') {
      ;(mod as any).jalaliDatepicker.startWatch()
    }

    inputRef.value.addEventListener('change', () => {
      if (inputRef.value) internalValue.value = inputRef.value.value
    })

    inputRef.value.addEventListener('jdp:change', (e: any) => {
      internalValue.value = e.detail?.value || e.target?.value || ''
    })
  }
})

onBeforeUnmount(() => {
  if (cssLink.value?.parentNode) {
    cssLink.value.parentNode.removeChild(cssLink.value)
  }
})
</script>

<template>
  <input
    ref="inputRef"
    :value="internalValue"
    @input="internalValue = ($event.target as HTMLInputElement).value"
    class="input input-bordered w-full cursor-pointer"
    placeholder="انتخاب تاریخ"
    readonly
  />
</template>
