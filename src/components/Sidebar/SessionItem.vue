<template>
  <q-item 
    clickable 
    v-ripple 
    :active="isActive"
    :active-class="$q.dark.isActive ? 'bg-grey-9 text-primary' : 'bg-white text-primary shadow-sm'"
    class="rounded-borders q-mx-sm session-item"
    @click="$emit('select')"
  >
    <q-item-section avatar>
      <q-icon name="terminal" size="sm" />
    </q-item-section>
    <q-item-section>
      <q-item-label class="text-weight-medium ellipsis">{{ label }}</q-item-label>
      <q-item-label caption class="ellipsis">{{ session.dir }}</q-item-label>
    </q-item-section>
    <q-item-section side class="session-actions">
      <q-btn 
        flat 
        round 
        dense 
        icon="close" 
        size="sm" 
        color="grey-6"
        @click.stop="onStop"
      >
        <q-tooltip>Stop Session</q-tooltip>
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

const label = computed(() => props.session.dir.split('/').pop() || 'Session');

function onStop() {
  $q.dialog({
    title: 'Stop Session',
    message: `Stop Gemini CLI in "${props.session.dir}"?`,
    cancel: true,
    persistent: true,
    ok: { label: 'Stop', color: 'negative', unelevated: true }
  }).onOk(() => {
    emit('stop', props.session.id);
  });
}
</script>

<style scoped>
.session-item .session-actions { display: none; }
.session-item:hover .session-actions { display: flex; }
.shadow-sm { box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
</style>
