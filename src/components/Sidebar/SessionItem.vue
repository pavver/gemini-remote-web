<template>
  <q-item 
    clickable 
    v-ripple 
    :active="isActive"
    :active-class="$q.dark.isActive ? 'bg-primary-9 text-white' : 'bg-white text-primary shadow-sm'"
    class="rounded-borders q-mx-sm session-item q-mb-xs transition-all"
    @click="$emit('select')"
  >
    <q-item-section avatar class="min-width-auto q-pr-md">
      <div class="status-indicator-wrapper">
        <q-icon name="terminal" size="20px" :color="isActive ? 'primary' : 'grey-6'" />
        <div v-if="isActive" class="status-dot-active"></div>
      </div>
    </q-item-section>
    
    <q-item-section>
      <q-item-label class="text-weight-bold ellipsis" :class="isActive ? '' : 'text-grey-8'">
        {{ label }}
      </q-item-label>
      <q-item-label caption class="ellipsis text-grey-6" style="font-size: 11px">
        {{ session.dir }}
      </q-item-label>
    </q-item-section>

    <q-item-section side class="session-actions">
      <q-btn 
        flat 
        round 
        dense 
        icon="power_settings_new" 
        size="sm" 
        color="grey-6"
        class="hover-red"
        @click.stop="onStop"
      >
        <q-tooltip>Зупинити сесію</q-tooltip>
      </q-btn>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useQuasar } from 'quasar';
import type { SessionInfo } from '../../types/protocol';

const props = defineProps<{
  session: SessionInfo;
  isActive: boolean;
}>();

const emit = defineEmits(['select', 'stop']);
const $q = useQuasar();

const label = computed(() => {
  const parts = props.session.dir.split(/[/\\]/);
  return parts.pop() || 'Сесія';
});

function onStop() {
  $q.dialog({
    title: 'Зупинити сесію',
    message: `Ви впевнені, що хочете зупинити Gemini CLI у директорії "${props.session.dir}"?`,
    cancel: { label: 'Скасувати', flat: true, color: 'grey-7' },
    persistent: true,
    ok: { label: 'Зупинити', color: 'negative', unelevated: true }
  }).onOk(() => {
    emit('stop', props.session.id);
  });
}
</script>

<style scoped>
.session-item {
  height: 56px;
  border: 1px solid transparent;
}

.body--light .session-item.q-item--active {
  border-color: rgba(var(--q-primary), 0.1);
}

.session-item .session-actions { 
  display: none; 
}

.session-item:hover .session-actions { 
  display: flex; 
}

.status-indicator-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-dot-active {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  background-color: #4caf50;
  border-radius: 50%;
  border: 2px solid white;
  animation: pulse 2s infinite;
}

.body--dark .status-dot-active {
  border-color: #1d1d1d;
}

@keyframes pulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 5px rgba(76, 175, 80, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
}

.min-width-auto {
  min-width: auto !important;
}

.hover-red:hover {
  color: #f44336 !important;
}

.transition-all {
  transition: all 0.2s ease;
}

.bg-primary-9 {
  background: rgba(var(--q-primary), 0.15);
}
</style>
