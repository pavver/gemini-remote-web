<template>
  <div class="message-content-renderer" v-html="renderedContent"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

const props = defineProps<{
  content: string;
}>();

const md: MarkdownIt = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' +
               hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
               '</code></pre>';
      } catch (e) {
        console.error('Highlighting error:', e);
      }
    }
    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
  }
});

const renderedContent = computed(() => {
  return md.render(props.content);
});
</script>

<style>
.message-content-renderer {
  line-height: 1.5;
  font-size: 15px;
  overflow-wrap: break-word;
}

.message-content-renderer p {
  margin-bottom: 4px;
}

.message-content-renderer p:last-child {
  margin-bottom: 0;
}

.message-content-renderer pre {
  margin: 8px 0;
  padding: 12px;
  border-radius: 8px;
  overflow-x: auto;
  background-color: #0d1117;
  color: #c9d1d9;
}

.message-content-renderer code {
  font-family: 'Fira Code', 'JetBrains Mono', monospace;
  font-size: 0.9em;
  padding: 2px 4px;
  border-radius: 4px;
  background-color: rgba(175, 184, 193, 0.2);
}

.body--dark .message-content-renderer code {
  background-color: rgba(110, 118, 129, 0.4);
}

.message-content-renderer pre code {
  padding: 0;
  background-color: transparent;
}

.message-content-renderer blockquote {
  margin: 8px 0;
  padding-left: 12px;
  border-left: 3px solid #d0d7de;
  color: #636c76;
}

.body--dark .message-content-renderer blockquote {
  border-left-color: #30363d;
  color: #8b949e;
}

.message-content-renderer table {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 8px;
}

.message-content-renderer th, .message-content-renderer td {
  border: 1px solid #d0d7de;
  padding: 4px 10px;
}

.body--dark .message-content-renderer th, .body--dark .message-content-renderer td {
  border-color: #30363d;
}

.message-content-renderer ul, .message-content-renderer ol {
  padding-left: 1.5em;
  margin-bottom: 4px;
}

.message-content-renderer ul:last-child, .message-content-renderer ol:last-child {
  margin-bottom: 0;
}

.message-content-renderer img {
  max-width: 100%;
  border-radius: 8px;
}
</style>
