<template>
  <q-layout view="lHh lpR fFf" :class="$q.dark.isActive ? 'bg-dark' : 'bg-grey-1'">
    
    <!-- Initial Loading -->
    <div v-if="isLoading" class="fixed-center text-center">
      <q-spinner-dots color="primary" size="4em" />
      <div class="text-subtitle1 q-mt-md text-grey-7">Synchronizing...</div>
    </div>

    <template v-else>
      <!-- Auth Screen -->
      <div v-if="!auth.isAuthenticated" class="fullscreen flex flex-center" :class="$q.dark.isActive ? 'bg-black' : 'bg-grey-2'">
        <login-card />
      </div>

      <!-- App Content -->
      <template v-else>
        <status-header 
          @toggle-left="leftDrawerOpen = !leftDrawerOpen" 
          @toggle-right="rightDrawerOpen = !rightDrawerOpen" 
          @open-settings="settingsOpen = true"
        />

        <!-- Left Sidebar: Sessions -->
        <q-drawer v-model="leftDrawerOpen" show-if-above bordered :class="$q.dark.isActive ? 'bg-grey-10' : 'bg-grey-2'">
          <div class="column full-height">
            <div class="q-pa-md">
              <q-btn outline color="primary" icon="add" label="New Session" class="full-width q-mb-md" @click="openNewSessionDialog" />
              <div class="text-overline text-grey-6 q-mb-sm">Active Sessions</div>
              <q-list padding class="q-gutter-y-xs">
                <session-item 
                  v-for="session in auth.sessions" 
                  :key="session.id" 
                  :session="session"
                  :is-active="auth.activeSessionId === session.id"
                  @select="auth.connectToSession(session.id)"
                  @stop="auth.stopSession"
                />
              </q-list>
            </div>
            <q-space />
            <user-panel />
          </div>
        </q-drawer>

        <!-- Right Sidebar: Thought (Single) -->
        <q-drawer side="right" v-model="rightDrawerOpen" bordered :class="$q.dark.isActive ? 'bg-grey-10' : 'bg-white'">
          <div class="column full-height">
            <q-item-label header class="text-weight-bold row items-center">
              <q-icon name="psychology" class="q-mr-sm" />
              Active Thought
              <q-space />
              <q-btn flat round dense icon="close" size="sm" @click="rightDrawerOpen = false" />
            </q-item-label>
            <q-separator />
            <thought-display />
          </div>
        </q-drawer>

        <q-page-container>
          <router-view />
        </q-page-container>

        <status-bar />

        <settings-dialog v-model="settingsOpen" />

        <!-- Global Confirmations -->
        <q-dialog :model-value="!!gemini.activeRequest" persistent position="bottom">
          <q-card style="width: 500px" class="q-mb-lg shadow-15">
            <q-linear-progress :value="1" color="primary" />
            <q-card-section class="row items-center no-wrap">
              <q-avatar icon="security" color="primary-1" text-color="primary" class="q-mr-md" />
              <div>
                <div class="text-weight-bold text-subtitle1">Permission Required</div>
                <div class="text-grey-8">{{ gemini.activeRequest?.prompt }}</div>
              </div>
            </q-card-section>
            <q-card-actions align="right" class="q-pa-md">
              <q-btn flat label="Deny" color="grey-7" v-close-popup @click="gemini.replyToRequest(gemini.activeRequest!.correlationId, false)" />
              <q-btn unelevated label="Confirm" color="primary" @click="gemini.replyToRequest(gemini.activeRequest!.correlationId, true)" />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </template>
    </template>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useAuthStore } from '../stores/auth';
import { useGeminiStore } from '../stores/gemini';

// Components
import LoginCard from '../components/LoginCard.vue';
import StatusHeader from '../components/StatusHeader.vue';
import SessionItem from '../components/Sidebar/SessionItem.vue';
import UserPanel from '../components/Sidebar/UserPanel.vue';
import ThoughtDisplay from '../components/Sidebar/ThoughtDisplay.vue';
import StatusBar from '../components/Footer/StatusBar.vue';
import NewSessionDialog from '../components/NewSessionDialog.vue';
import SettingsDialog from '../components/Dialogs/SettingsDialog.vue';

const $q = useQuasar();
const auth = useAuthStore();
const gemini = useGeminiStore();

const leftDrawerOpen = ref(false);
const rightDrawerOpen = ref(false);
const settingsOpen = ref(false);
const isLoading = ref(true);

watch(() => gemini.isConnected, (val) => {
  console.log('[DEBUG] gemini.isConnected =', val);
});

onMounted(async () => {
  await auth.tryAutoLogin();
  isLoading.value = false;
});

function openNewSessionDialog() {
  $q.dialog({ component: NewSessionDialog });
}
</script>
