<script setup lang="ts">
defineProps<{
  type: string,
  text?: string
}>();
</script>

<template>
  <div class="flex flex-col items-start w-full">
    <div class="max-w-[98%] sm:max-w-[90%] bg-neutral-900/40 border border-neutral-800 p-3.5 sm:p-5 rounded-2xl rounded-tl-none border-dashed shadow-sm">
      <!-- Header with Icon and Label -->
      <div class="mb-2 flex items-center gap-2">
        <div class="w-5 h-5 rounded bg-neutral-800 flex items-center justify-center">
          <UIcon name="i-heroicons-cpu-chip" class="w-3.5 h-3.5 text-neutral-500" />
        </div>
        <span class="text-[9px] font-black text-neutral-500 uppercase tracking-[0.2em] leading-none">
          System {{ type }}
        </span>
      </div>
      
      <!-- Content Area -->
      <div class="text-xs font-mono text-neutral-300 leading-relaxed whitespace-pre-wrap">
        {{ text }}
      </div>
    </div>
  </div>
</template>
