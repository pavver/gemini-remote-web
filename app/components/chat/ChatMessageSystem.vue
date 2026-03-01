<script setup lang="ts">
const props = defineProps<{
  type: string,
  text?: string
}>();

const isError = computed(() => ['error', 'warning', 'failed'].some(t => props.type.toLowerCase().includes(t)));
</script>

<template>
  <div class="flex flex-col items-start w-full my-2">
    <div 
      class="max-w-[98%] sm:max-w-[90%] bg-[#181818] border p-3.5 sm:p-5 rounded-xl rounded-tl-none shadow-lg transition-all duration-500"
      :class="isError ? 'border-red-500/30 shadow-red-950/10' : 'border-[var(--color-vsc-blue)]/30 shadow-blue-950/10'"
    >
      <!-- Header with Icon and Label -->
      <div class="mb-3 flex items-center gap-2">
        <div 
          class="w-6 h-6 rounded flex items-center justify-center transition-colors"
          :class="isError ? 'bg-red-500/20' : 'bg-[var(--color-vsc-blue)]/20'"
        >
          <UIcon 
            :name="isError ? 'i-heroicons-exclamation-triangle' : 'i-heroicons-information-circle'" 
            class="w-4 h-4" 
            :class="isError ? 'text-red-400' : 'text-[var(--color-vsc-blue)]'"
          />
        </div>
        <span 
          class="text-[10px] font-black uppercase tracking-[0.2em] leading-none"
          :class="isError ? 'text-red-400' : 'text-[var(--color-vsc-blue)]'"
        >
          {{ type }}
        </span>
      </div>
      
      <!-- Content Area -->
      <div 
        class="text-[11px] font-mono leading-relaxed whitespace-pre-wrap"
        :class="isError ? 'text-red-200/80' : 'text-blue-100/80'"
      >
        {{ text }}
      </div>
    </div>
  </div>
</template>
