<script setup lang="ts">
defineProps<{
  text: string
}>();
</script>

<template>
  <div class="flex flex-col items-end w-full mb-4 animate-in fade-in slide-in-from-right-2 duration-300">
    <div class="max-w-[96%] sm:max-w-[85%] bg-[var(--color-vsc-active)] text-neutral-200 px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl rounded-tr-none border border-[var(--color-vsc-border)] shadow-xl text-sm leading-relaxed font-sans">
      {{ text }}
    </div>
    <div class="flex items-center gap-1 mt-1 mr-2">
      <span class="text-[9px] font-black text-neutral-600 uppercase tracking-widest">You</span>
      <UIcon name="i-heroicons-user" class="w-3 h-3 text-neutral-600" />
    </div>
  </div>
</template>
