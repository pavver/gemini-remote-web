<template>
  <q-card class="login-card shadow-12 q-pa-lg">
    <q-card-section class="text-center">
      <q-avatar size="100px" font-size="60px" color="primary" text-color="white" icon="cloud_sync" />
      <div class="text-h5 q-mt-md text-weight-bold">Orchestrator Login</div>
      <div class="text-subtitle2 text-grey-7">Connect to your Gemini CLI Instance</div>
    </q-card-section>

    <q-card-section class="q-gutter-md">
      <q-input 
        v-model="username" 
        label="Username" 
        outlined 
        dense 
        @keyup.enter="handleLogin" 
        :disable="auth.isAuthenticating"
      >
        <template v-slot:prepend>
          <q-icon name="person" />
        </template>
      </q-input>

      <q-input 
        v-model="password" 
        label="Password" 
        type="password" 
        outlined 
        dense 
        @keyup.enter="handleLogin"
        :disable="auth.isAuthenticating"
      >
        <template v-slot:prepend>
          <q-icon name="lock" />
        </template>
      </q-input>

      <q-checkbox v-model="rememberMe" label="Remember me" color="primary" />
    </q-card-section>

    <q-card-actions vertical>
      <q-btn 
        color="primary" 
        label="Sign In" 
        class="full-width" 
        size="lg" 
        unelevated 
        :loading="auth.isAuthenticating"
        @click="handleLogin"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useQuasar } from 'quasar';

const auth = useAuthStore();
const $q = useQuasar();

const username = ref('');
const password = ref('');
const rememberMe = ref(false);

async function handleLogin() {
  if (!username.value || !password.value) {
    $q.notify({ type: 'negative', message: 'Please enter credentials' });
    return;
  }

  const success = await auth.login(username.value, password.value, rememberMe.value);
  if (!success) {
    $q.notify({ type: 'negative', message: 'Invalid credentials or Orchestrator offline' });
  }
}
</script>

<style scoped>
.login-card {
  width: 100%;
  max-width: 400px;
  border-radius: 12px;
}
</style>
