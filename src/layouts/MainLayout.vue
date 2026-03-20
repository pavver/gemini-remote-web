<template>
  <q-layout view="lHh Lpr lFf" :class="$q.dark.isActive ? 'bg-dark' : 'bg-grey-1'">
    
    <!-- Початкове завантаження -->
    <div v-if="isLoading" class="fixed-center text-center">
      <q-spinner-dots color="primary" size="4em" />
      <div class="text-subtitle1 q-mt-md text-grey-7">Синхронізація...</div>
    </div>

    <template v-else>
      <!-- Екран авторизації -->
      <div v-if="!auth.isAuthenticated" class="auth-wrapper flex flex-center" :class="$q.dark.isActive ? 'bg-black' : 'bg-grey-2'">
        <login-card />
      </div>

      <!-- Контент додатка -->
      <template v-else>
        <status-header 
          @toggle-left="leftDrawerOpen = !leftDrawerOpen" 
          @open-settings="settingsOpen = true"
          @open-system-details="systemDetailsOpen = true"
        />

        <!-- Лівий сайдбар: Сесії -->
        <q-drawer 
          v-model="leftDrawerOpen" 
          show-if-above 
          bordered 
          :width="280"
          :class="$q.dark.isActive ? 'bg-grey-10' : 'bg-grey-2'"
        >
          <div class="column full-height">
            <div class="q-pa-md">
              <q-btn 
                unelevated 
                color="primary" 
                icon="add" 
                label="Нова сесія" 
                class="full-width q-py-sm q-mb-lg rounded-borders text-weight-bold" 
                @click="openNewSessionDialog" 
              />
              
              <div class="row items-center justify-between q-mb-sm q-px-sm">
                <div class="text-overline text-grey-6 text-weight-bold">Активні сесії</div>
                <q-badge rounded color="primary" :label="auth.sessions.length" />
              </div>

              <q-list padding class="q-gutter-y-sm">
                <session-item 
                  v-for="session in auth.sessions" 
                  :key="session.id" 
                  :session="session"
                  :is-active="auth.activeSessionId === session.id"
                  @select="auth.connectToSession(session.id)"
                  @stop="auth.stopSession"
                />
                
                <div v-if="auth.sessions.length === 0" class="text-center q-mt-xl">
                  <q-icon name="terminal" size="48px" color="grey-4" />
                  <div class="text-caption text-grey-6 q-mt-sm">Немає активних сесій</div>
                </div>
              </q-list>
            </div>
            
            <q-space />
            
            <q-separator :dark="$q.dark.isActive" />
            <user-panel />
          </div>
        </q-drawer>

        <q-page-container>
          <router-view />
        </q-page-container>

        <!-- Діалоги -->
        <settings-dialog v-model="settingsOpen" />
        
        <q-dialog v-model="systemDetailsOpen">
          <system-details-dialog />
        </q-dialog>

        <!-- Глобальні підтвердження -->
        <q-dialog :model-value="!!gemini.activeRequest" persistent position="bottom">
          <q-card style="width: 500px; max-width: 95vw" class="q-mb-lg shadow-15 rounded-borders">
            <q-linear-progress :value="1" color="primary" />
            <q-card-section class="row items-center no-wrap">
              <q-avatar icon="security" color="primary-1" text-color="primary" class="q-mr-md" />
              <div>
                <div class="text-weight-bold text-subtitle1">Потрібен дозвіл</div>
                <div class="text-grey-8">{{ gemini.activeRequest?.prompt }}</div>
              </div>
            </q-card-section>
            <q-card-actions align="right" class="q-pa-md">
              <q-btn flat label="Відхилити" color="grey-7" v-close-popup @click="gemini.replyToRequest(gemini.activeRequest!.correlationId, false)" />
              <q-btn unelevated label="Підтвердити" color="primary" @click="gemini.replyToRequest(gemini.activeRequest!.correlationId, true)" />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </template>
    </template>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useAuthStore } from '../stores/auth';
import { useGeminiStore } from '../stores/gemini';

// Компоненти
import LoginCard from '../components/LoginCard.vue';
import StatusHeader from '../components/StatusHeader.vue';
import SessionItem from '../components/Sidebar/SessionItem.vue';
import UserPanel from '../components/Sidebar/UserPanel.vue';
import NewSessionDialog from '../components/NewSessionDialog.vue';
import SettingsDialog from '../components/Dialogs/SettingsDialog.vue';
import SystemDetailsDialog from '../components/Dialogs/SystemDetailsDialog.vue';

const $q = useQuasar();
const auth = useAuthStore();
const gemini = useGeminiStore();

const leftDrawerOpen = ref(false);
const settingsOpen = ref(false);
const systemDetailsOpen = ref(false);
const isLoading = ref(true);

onMounted(async () => {
  await auth.tryAutoLogin();
  isLoading.value = false;
});

function openNewSessionDialog() {
  $q.dialog({ component: NewSessionDialog });
}
</script>

<style>
.rounded-borders {
  border-radius: 8px !important;
}

.auth-wrapper {
  min-height: 100vh;
  width: 100%;
  padding: 24px 16px;
  overflow-y: auto;
}
</style>
