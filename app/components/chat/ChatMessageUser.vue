<script setup lang="ts">
defineProps<{
  text: string
}>();
</script>

<template>
  <div class="flex flex-col items-end w-full">
    <div class="max-w-[96%] sm:max-w-[85%] bg-blue-600 text-white px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl rounded-tr-none shadow-lg shadow-blue-900/20 text-sm leading-relaxed">
      {{ text }}
    </div>
  </div>
</template>
