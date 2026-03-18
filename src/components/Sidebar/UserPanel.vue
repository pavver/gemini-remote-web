<template>
  <div class="q-pa-sm border-t" :class="$q.dark.isActive ? 'bg-grey-10' : 'bg-grey-3'">
    <q-item clickable v-ripple class="rounded-borders" @click="auth.logout">
      <q-item-section avatar>
        <q-avatar size="32px" color="primary" text-color="white">
          {{ (auth.user || 'U').charAt(0).toUpperCase() }}
        </q-avatar>
      </q-item-section>
      <q-item-section>
        <q-item-label class="text-weight-bold ellipsis">{{ auth.user }}</q-item-label>
        <q-item-label caption>Sign Out</q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-icon name="logout" color="grey-6" size="xs" />
      </q-item-section>
    </q-item>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../../stores/auth';

const auth = useAuthStore();
</script>

<style scoped>
.border-t { border-top: 1px solid rgba(0,0,0,0.1); }
</style>
