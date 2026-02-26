<script setup lang="ts">
defineProps<{
  thought: { summary: string }
}>();
</script>

<template>
  <div class="flex items-start gap-3 sm:gap-4 opacity-80 group">
    <div class="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:border-blue-500/50 transition-colors">
      <UIcon name="i-heroicons-sparkles" class="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 animate-pulse" />
    </div>
    <div class="flex flex-col gap-0.5 pt-0.5 sm:pt-1">
      <span class="text-[8px] sm:text-[10px] font-black text-neutral-600 uppercase tracking-widest leading-none">Thought Process</span>
      <p class="text-xs sm:text-sm italic text-neutral-400 font-mono leading-relaxed">
        {{ thought.summary }}
      </p>
    </div>
  </div>
</template>
