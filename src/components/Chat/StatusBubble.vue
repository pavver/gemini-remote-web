<template>
  <div class="chat-message-row q-mb-sm row no-wrap items-start justify-start">
    
    <!-- Аватар-лоадер (ліворуч, як у бота) -->
    <div class="avatar-col q-mr-xs gt-xs flex flex-center">
      <div v-if="loading" class="loader-wrapper flex flex-center">
        <q-circular-progress
          indeterminate
          size="24px"
          :thickness="0.2"
          color="primary"
          track-color="transparent"
        />
      </div>
      <q-avatar 
        v-else
        size="30px" 
        :color="iconColor || 'grey-8'" 
        text-color="white" 
        :icon="icon || 'info'"
        class="shadow-1"
      />
    </div>

    <div class="message-content-wrapper bot-wrapper row no-wrap items-stretch">
      <!-- Хмаринка статусу -->
      <div 
        class="message-bubble status-bubble-style" 
        :class="$q.dark.isActive ? 'bot-bubble-dark' : 'bot-bubble-light'"
      >
        <div class="message-body full-height justify-center">
          <div class="status-text text-weight-medium">{{ message }}</div>
          <div v-if="caption" class="status-caption text-grey-6">{{ caption }}</div>
        </div>
      </div>

      <!-- Велика кнопка скасування праворуч -->
      <q-btn 
        v-if="canCancel" 
        unelevated
        color="red-1"
        text-color="red-7"
        icon="stop" 
        label="Зупинити"
        class="q-ml-sm stop-button rounded-borders transition-all"
        @click="$emit('cancel')"
      >
        <q-tooltip>Скасувати генерацію (Esc)</q-tooltip>
      </q-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message: string;
  caption?: string | undefined;
  loading?: boolean | undefined;
  canCancel?: boolean | undefined;
  icon?: string | undefined;
  iconColor?: string | undefined;
}>();

defineEmits(['cancel']);
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

.loader-wrapper {
  width: 30px;
  height: 30px;
}

.message-content-wrapper {
  max-width: 95%;
}

.status-bubble-style {
  padding: 8px 14px;
  border-radius: 10px;
  border-bottom-left-radius: 2px;
  border: 1px solid transparent;
  display: flex;
  align-items: center;
}

/* Використовуємо ті ж кольори, що і в ChatMessage */
.bot-bubble-light {
  background-color: #ffffff;
  color: #1e293b;
  border-color: #e2e8f0;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
}

.bot-bubble-dark {
  background-color: #1e293b;
  color: #f1f5f9;
  border-color: #334155;
}

.status-text {
  font-size: 13px;
  line-height: 1.2;
}

.status-caption {
  font-size: 9px;
  line-height: 1.1;
  margin-top: 2px;
}

.stop-button {
  padding: 0 16px;
  font-weight: bold;
  text-transform: none;
  font-size: 12px;
}

.body--dark .stop-button {
  background: rgba(244, 67, 54, 0.15) !important;
  color: #ff8a80 !important;
  border: 1px solid rgba(244, 67, 54, 0.2);
}

.stop-button:hover {
  filter: brightness(0.95);
  transform: translateY(-1px);
}

.transition-all {
  transition: all 0.2s ease;
}

.rounded-borders {
  border-radius: 10px !important;
}
</style>
