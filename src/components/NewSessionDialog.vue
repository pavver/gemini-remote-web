<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin" style="width: 500px">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">Start New Session</div>
      </q-card-section>

      <q-card-section class="q-gutter-md">
        <div class="text-caption text-grey-7">
          Enter the absolute path where you want to launch Gemini CLI.
        </div>
        
        <q-input 
          v-model="dir" 
          label="Directory Path" 
          outlined 
          dense 
          autofocus 
          @keyup.enter="handleStart"
          placeholder="/home/user/project"
        >
          <template v-slot:prepend>
            <q-icon name="folder" />
          </template>
        </q-input>

        <div v-if="auth.recentDirs.length > 0">
          <div class="text-overline text-grey-6 q-mb-xs">Recent Directories</div>
          <q-list bordered separator dense class="rounded-borders">
            <q-item 
              v-for="recent in auth.recentDirs" 
              :key="recent" 
              clickable 
              v-ripple
              @click="dir = recent"
            >
              <q-item-section avatar>
                <q-icon name="history" color="grey-6" />
              </q-item-section>
              <q-item-section class="ellipsis text-caption">
                {{ recent }}
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="grey-7" v-close-popup :disable="loading" />
        <q-btn 
          unelevated 
          label="Start Session" 
          color="primary" 
          :disable="!dir.trim() || loading" 
          @click="handleStart" 
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
const dir = ref('');
const loading = ref(false);

defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent();

async function handleStart() {
  if (!dir.value.trim()) return;
  loading.value = true;
  try {
    auth.startNewSession(dir.value.trim());
    // Visual feedback delay
    await new Promise(r => setTimeout(r, 800));
    onDialogOK();
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
}
</script>
