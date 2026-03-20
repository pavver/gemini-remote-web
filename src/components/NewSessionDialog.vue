<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide" position="top">
    <q-card class="q-dialog-plugin modern-dialog q-mt-xl" style="width: 500px; max-width: 95vw">
      <q-card-section class="row items-center q-pb-none">
        <q-avatar icon="add_box" color="primary-1" text-color="primary" size="md" />
        <div class="text-h6 q-ml-md font-exo">Нова сесія</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup color="grey-6" />
      </q-card-section>

      <q-card-section class="q-pa-md">
        <div class="text-caption text-grey-7 q-mb-md">
          Вкажіть абсолютний шлях до директорії, де ви хочете запустити Gemini CLI.
        </div>
        
        <q-input 
          v-model="dir" 
          outlined 
          dense 
          autofocus 
          @keyup.enter="handleStart"
          placeholder="/home/user/project"
          class="directory-input"
          bg-color="$q.dark.isActive ? 'grey-9' : 'grey-1'"
        >
          <template v-slot:prepend>
            <q-icon name="folder_open" color="primary" />
          </template>
        </q-input>

        <div v-if="auth.recentDirs.length > 0" class="q-mt-lg">
          <div class="text-overline text-grey-6 text-weight-bold q-mb-xs">Нещодавні директорії</div>
          <q-list bordered separator dense class="rounded-borders recent-list">
            <q-item 
              v-for="recent in auth.recentDirs" 
              :key="recent" 
              clickable 
              v-ripple
              @click="dir = recent"
              class="recent-item"
            >
              <q-item-section avatar class="min-width-auto q-pr-sm">
                <q-icon name="history" color="grey-5" size="xs" />
              </q-item-section>
              <q-item-section class="ellipsis text-caption">
                {{ recent }}
              </q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right" size="xs" color="grey-4" />
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md bg-grey-1" :class="$q.dark.isActive ? 'bg-grey-10' : 'bg-grey-1'">
        <q-btn flat label="Скасувати" color="grey-7" v-close-popup :disable="loading" class="text-weight-bold" />
        <q-btn 
          unelevated 
          label="Запустити" 
          color="primary" 
          :disable="!dir.trim() || loading" 
          @click="handleStart"
          class="q-px-lg text-weight-bold"
          :loading="loading"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useDialogPluginComponent } from 'quasar';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const dir = ref(auth.recentDirs[0] || '');
const loading = ref(false);

defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent();

async function handleStart() {
  if (!dir.value.trim()) return;
  loading.value = true;
  try {
    auth.startNewSession(dir.value.trim());
    // Невелика затримка для візуального комфорту
    await new Promise(r => setTimeout(r, 600));
    onDialogOK();
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.modern-dialog {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0,0,0,0.15) !important;
}

.directory-input :deep(.q-field__control) {
  border-radius: 10px;
}

.recent-list {
  border-color: rgba(0,0,0,0.05);
  background: rgba(0,0,0,0.01);
}

.body--dark .recent-list {
  border-color: rgba(255,255,255,0.05);
  background: rgba(255,255,255,0.02);
}

.recent-item {
  height: 36px;
  transition: all 0.2s ease;
}

.recent-item:hover {
  background: rgba(var(--q-primary), 0.05);
}

.min-width-auto {
  min-width: auto !important;
}

.font-exo {
  font-family: 'Exo 2', sans-serif;
}

.bg-primary-1 {
  background: rgba(var(--q-primary), 0.1);
}
</style>
