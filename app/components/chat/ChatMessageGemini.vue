<script setup lang="ts">
import { marked } from 'marked';

const props = defineProps<{
  text: string,
  modelName?: string
}>();

const renderedMarkdown = computed(() => {
  return marked.parse(props.text || '');
});

// Dynamic color based on model family
const modelColorClass = computed(() => {
  const name = props.modelName?.toLowerCase() || '';
  if (name.includes('pro')) return 'text-purple-400';
  if (name.includes('flash')) return 'text-emerald-400';
  if (name.includes('think')) return 'text-orange-400';
  return 'text-blue-400';
});

const modelBarClass = computed(() => {
  const name = props.modelName?.toLowerCase() || '';
  if (name.includes('pro')) return 'bg-purple-500';
  if (name.includes('flash')) return 'bg-emerald-500';
  if (name.includes('think')) return 'bg-orange-500';
  return 'bg-blue-500';
});
</script>

<template>
  <div class="flex flex-col items-start w-full">
    <div class="max-w-[98%] sm:max-w-[90%] bg-[#252526] border border-[var(--color-vsc-border)] p-3.5 sm:p-5 rounded-2xl rounded-tl-none shadow-xl">
      <!-- Model name inside the main bubble, above the text with dynamic colors -->
      <div v-if="modelName" class="mb-1.5 flex items-center gap-2">
        <div class="w-1 h-3 rounded-full transition-colors duration-500" :class="modelBarClass"></div>
        <span class="text-[9px] font-black uppercase tracking-[0.2em] leading-none transition-colors duration-500" :class="modelColorClass">
          {{ modelName }}
        </span>
      </div>
      
      <div class="prose prose-neutral prose-invert prose-sm max-w-none prose-gemini font-[var(--font-cascadia)]" v-html="renderedMarkdown"></div>
    </div>
  </div>
</template>
