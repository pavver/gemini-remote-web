<script setup lang="ts">
import { marked } from 'marked';

const props = defineProps<{
  text: string
}>();

const renderedMarkdown = computed(() => {
  return marked.parse(props.text || '');
});
</script>

<template>
  <div class="flex flex-col items-start w-full">
    <div class="max-w-[98%] sm:max-w-[90%] bg-[#181818] border border-[var(--color-vsc-border)] p-3.5 sm:p-5 rounded-2xl rounded-tl-none border-dashed shadow-lg font-[var(--font-cascadia)]">
      <!-- Only content, no header -->
      <div class="prose prose-neutral prose-invert max-w-none prose-content-chunk" v-html="renderedMarkdown">
      </div>
    </div>
  </div>
</template>
