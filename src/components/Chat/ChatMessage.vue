<template>
  <div class="chat-message-row q-mb-sm row no-wrap items-start" :class="message.type === 'user' ? 'justify-end' : 'row justify-start'">
    
    <!-- Аватар бота (тільки зліва) -->
    <div v-if="message.type !== 'user'" class="avatar-col q-mr-xs gt-xs flex flex-center">
      <q-avatar 
        size="30px" 
        :color="avatarConfig.color" 
        text-color="white" 
        :icon="avatarConfig.icon"
        class="msg-avatar shadow-1"
      />
    </div>

    <div class="message-content-wrapper" :class="message.type === 'user' ? 'user-wrapper' : 'bot-wrapper'">
      
      <!-- Блок роздумів моделі -->
      <thinking-block 
        v-if="message.type === 'gemini' && showThinking" 
        :thought="thought" 
        :thoughts="message.thoughts"
        :status="status" 
      />

      <!-- Хмаринка повідомлення -->
      <div 
        class="message-bubble" 
        :class="bubbleClass"
      >
        <div class="message-body">
          <!-- Ім'я агента всередині бульбашки зверху -->
          <div 
            v-if="message.type !== 'user'"
            class="bubble-agent-name"
          >
            {{ displayName }}
          </div>

          <message-content :content="message.content[0]?.text || ''" />
          
          <!-- Мітка часу всередині бульбашки знизу -->
          <div class="bubble-timestamp text-right">
            {{ formatTime(message.timestamp) }}
          </div>
        </div>
        
        <!-- Прогрес генерації -->
        <q-linear-progress 
          v-if="isGenerating" 
          indeterminate 
          color="primary" 
          size="2px" 
          class="q-mt-xs" 
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

.avatar-col {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
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
  padding: 6px 10px;
  border-radius: 10px;
  position: relative;
  transition: all 0.2s ease;
  display: inline-block;
  min-width: 80px;
  border: 1px solid transparent;
}

.message-body {
  display: flex;
  flex-direction: column;
}

.bubble-agent-name {
  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.5;
  margin-bottom: 1px;
}

.bubble-timestamp {
  font-size: 8px;
  opacity: 0.5;
  margin-top: 1px;
  align-self: flex-end;
  line-height: 1;
}

/* User Bubbles */
.user-bubble-light {
  background-color: var(--q-primary);
  color: white;
  border-bottom-right-radius: 2px;
  box-shadow: 0 1px 4px rgba(var(--q-primary), 0.2);
}

.user-bubble-dark {
  background-color: #2563eb;
  color: white;
  border-bottom-right-radius: 2px;
  border-color: rgba(255,255,255,0.1);
}

/* Bot Bubbles */
.bot-bubble-light {
  background-color: #ffffff;
  color: #1e293b;
  border-color: #e2e8f0;
  border-bottom-left-radius: 2px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
}

.bot-bubble-dark {
  background-color: #1e293b;
  color: #f1f5f9;
  border-color: #334155;
  border-bottom-left-radius: 2px;
}

.msg-avatar {
  transition: transform 0.2s ease;
}

.user-wrapper {
  margin-left: auto;
  text-align: right;
}

.bot-wrapper {
  text-align: left;
}
</style>
