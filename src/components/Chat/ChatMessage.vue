<template>
  <div class="chat-message-row q-mb-md" :class="message.type === 'user' ? 'row justify-end' : 'row justify-start'">
    
    <!-- Gemini / System / Error Avatar -->
    <div v-if="message.type !== 'user'" class="avatar-col q-mr-sm gt-xs">
      <q-avatar 
        size="32px" 
        :color="avatarConfig.color" 
        text-color="white" 
        :icon="avatarConfig.icon"
        class="shadow-1 msg-avatar"
      />
    </div>

    <div class="message-content-wrapper" :class="message.type === 'user' ? 'user-wrapper' : 'bot-wrapper'">
      
      <!-- Agent Name (only for bot) -->
      <div 
        v-if="message.type !== 'user'"
        class="agent-name q-mb-xs text-caption text-weight-bold text-left"
      >
        {{ displayName }}
      </div>

      <!-- Thinking block -->
      <thinking-block 
        v-if="message.type === 'gemini' && showThinking" 
        :thought="thought" 
        :status="status" 
      />

      <!-- Message Bubble -->
      <div 
        class="message-bubble shadow-1" 
        :class="bubbleClass"
      >
        <div class="message-body">
          <message-content :content="message.content[0]?.text || ''" />
          
          <!-- Inner Timestamp -->
          <div class="bubble-timestamp text-right">
            {{ formatTime(message.timestamp) }}
          </div>
        </div>
        
        <!-- Streaming Progress -->
        <q-linear-progress 
          v-if="isGenerating" 
          indeterminate 
          color="primary" 
          size="2px" 
          class="q-mt-sm" 
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useQuasar } from 'quasar';
import type { RemoteMessageRecord, ThoughtInfo, AgentStatus } from '../../types/protocol';
import MessageContent from './MessageContent.vue';
import ThinkingBlock from './ThinkingBlock.vue';

const props = defineProps<{
  message: RemoteMessageRecord;
  isGenerating: boolean;
  thought: ThoughtInfo | null;
  status: AgentStatus;
  showThinking: boolean;
}>();

const $q = useQuasar();

const avatarConfig = computed(() => {
  switch (props.message.type) {
    case 'gemini': return { color: 'primary', icon: 'auto_awesome' };
    case 'error': return { color: 'red', icon: 'report_problem' };
    case 'warning': return { color: 'amber-9', icon: 'warning' };
    default: return { color: 'grey-8', icon: 'info' };
  }
});

const displayName = computed(() => {
  if (props.message.type === 'user') return 'Ви';
  if (props.message.type === 'gemini') return props.message.model || 'Gemini';
  if (props.message.type === 'error') return 'Помилка';
  if (props.message.type === 'warning') return 'Попередження';
  return 'Система';
});

const bubbleClass = computed(() => {
  const isDark = $q.dark.isActive;
  if (props.message.type === 'user') {
    return isDark ? 'user-bubble-dark' : 'user-bubble-light';
  }
  return isDark ? 'bot-bubble-dark' : 'bot-bubble-light';
});

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
}
</script>

<style scoped>
.chat-message-row {
  max-width: 100%;
}

.message-content-wrapper {
  max-width: 92%;
}

@media (max-width: 600px) {
  .message-content-wrapper {
    max-width: 100%;
  }
}

.message-bubble {
  padding: 8px 12px;
  border-radius: 12px;
  position: relative;
  transition: all 0.2s ease;
  display: inline-block;
  min-width: 60px;
}

.message-body {
  display: flex;
  flex-direction: column;
}

.bubble-timestamp {
  font-size: 9px;
  opacity: 0.5;
  margin-top: 2px;
  align-self: flex-end;
  line-height: 1;
}

/* User Bubbles */
.user-bubble-light {
  background-color: var(--q-primary);
  color: white;
  border-bottom-right-radius: 2px;
}

.user-bubble-dark {
  background-color: #2563eb;
  color: white;
  border-bottom-right-radius: 2px;
}

.user-bubble-light .bubble-timestamp,
.user-bubble-dark .bubble-timestamp {
  color: rgba(255, 255, 255, 0.8);
}

/* Bot Bubbles */
.bot-bubble-light {
  background-color: #ffffff;
  color: #1e293b;
  border: 1px solid #e2e8f0;
  border-bottom-left-radius: 2px;
}

.bot-bubble-dark {
  background-color: #1e293b;
  color: #f1f5f9;
  border: 1px solid #334155;
  border-bottom-left-radius: 2px;
}

.agent-name {
  opacity: 0.6;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  font-size: 9px;
}

.msg-avatar {
  transition: transform 0.2s ease;
  margin-top: 14px;
}

.user-wrapper {
  margin-left: auto;
  text-align: right;
}

.bot-wrapper {
  text-align: left;
}
</style>
