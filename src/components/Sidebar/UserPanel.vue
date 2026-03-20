<template>
  <div class="q-pa-sm border-t" :class="$q.dark.isActive ? 'bg-grey-10' : 'bg-grey-2'">
    <q-item clickable v-ripple class="rounded-borders user-panel-item" @click="auth.logout">
      <q-item-section avatar class="min-width-auto q-pr-md">
        <q-avatar size="32px" color="primary" text-color="white" class="shadow-1">
          {{ (auth.user || 'U').charAt(0).toUpperCase() }}
        </q-avatar>
      </q-item-section>
      <q-item-section>
        <q-item-label class="text-weight-bold ellipsis text-subtitle2">{{ auth.user }}</q-item-label>
        <q-item-label caption class="text-grey-6">{{ $t('user.signOut') }}</q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-icon name="logout" color="grey-5" size="xs" />
      </q-item-section>
    </q-item>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../../stores/auth';

const auth = useAuthStore();
</script>

<style scoped>
.border-t { 
  border-top: 1px solid rgba(0,0,0,0.05); 
}

.body--dark .border-t {
  border-color: rgba(255,255,255,0.05);
}

.user-panel-item {
  transition: all 0.2s ease;
}

.user-panel-item:hover {
  background: rgba(var(--q-primary), 0.05);
}

.min-width-auto {
  min-width: auto !important;
}
</style>
