<script setup lang="ts">
import ChatMessageUser from './ChatMessageUser.vue';
import ChatMessageGemini from './ChatMessageGemini.vue';
import ChatMessageThinking from './ChatMessageThinking.vue';
import ChatMessageSystem from './ChatMessageSystem.vue';
import ChatMessageGeminiContent from './ChatMessageGeminiContent.vue';
import ChatMessageToolGroup from './ChatMessageToolGroup.vue';

const emit = defineEmits(['stop-generation']);

defineProps<{
  history: any[];
  isResponding: boolean;
}>();
</script>

<template>
  <div class="flex-1 overflow-y-auto p-1.5 sm:p-6 flex flex-col gap-1.5 scroll-smooth">
    <!-- Empty State -->
    <div v-if="history.length === 0" class="h-full flex flex-col items-center justify-center text-neutral-700">
      <div class="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center mb-6 border border-neutral-800">
        <UIcon name="i-heroicons-command-line" class="w-10 h-10 text-neutral-800" />
      </div>
      <h3 class="text-lg font-bold text-neutral-400">Ready to Orchestrate</h3>
      <p class="text-sm">Start a new session to begin.</p>
    </div>

    <template v-else>
      <template v-for="(item, index) in history" :key="item.id">
        <div :class="{ 
          'mt-6': item.type === 'user' && index > 0,
          '-mt-1': item.type === 'gemini_content' && history[index-1]?.type === 'gemini_content'
        }">
          <ChatMessageUser 
            v-if="item.type === 'user'" 
            :text="item.text || ''" 
          />
          <ChatMessageGemini 
            v-else-if="item.type === 'gemini'" 
            :text="item.text || ''" 
            :model-name="item.contextModel"
          />
          <ChatMessageGeminiContent
            v-else-if="item.type === 'gemini_content'"
            :text="item.text || ''"
          />
          <ChatMessageToolGroup
            v-else-if="item.type === 'tool_group'"
            :tools="item.tools || []"
          />
          <ChatMessageThinking 
            v-else-if="item.type === 'thinking'" 
            :thought="item.thought || { summary: '' }" 
          />
          <ChatMessageSystem 
            v-else 
            :type="item.type" 
            :text="item.text"
          />
        </div>
      </template>
      
      <!-- Thinking indicator with Stop Button -->
      <div v-if="isResponding" class="flex items-center gap-3 mt-2 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
         <div class="bg-neutral-900 border border-neutral-800 p-3 sm:p-4 rounded-2xl rounded-tl-none flex gap-2 shadow-2xl">
           <div class="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
           <div class="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
           <div class="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
         </div>
         
         <UButton
           icon="i-heroicons-stop-circle"
           color="error"
           variant="soft"
           size="sm"
           label="Stop"
           class="rounded-full font-bold text-[10px] uppercase tracking-wider"
           @click="emit('stop-generation')"
         />
      </div>
    </template>
  </div>
</template>
