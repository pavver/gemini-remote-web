<template>
  <q-card class="login-card animate-fade-in" :class="$q.screen.xs ? 'q-pa-lg' : 'q-pa-xl'">
    <!-- Верхня панель налаштувань (Мова + Тема) -->
    <div class="absolute-top-right q-pa-md row items-center q-gutter-x-sm">
      <q-select
        v-model="locale"
        :options="langOptions"
        dense
        borderless
        emit-value
        map-options
        options-dense
        class="lang-select"
      >
        <template v-slot:prepend>
          <q-icon name="language" size="xs" color="primary" />
        </template>
      </q-select>

      <q-separator vertical inset :dark="$q.dark.isActive" />

      <q-btn 
        flat 
        round 
        dense 
        :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'" 
        @click="$q.dark.toggle()"
        :color="$q.dark.isActive ? 'amber' : 'grey-7'"
        size="sm"
      >
        <q-tooltip>{{ $q.dark.isActive ? 'Світла тема' : 'Темна тема' }}</q-tooltip>
      </q-btn>
    </div>

    <q-card-section class="text-center q-pb-none" :class="$q.screen.xs ? 'q-pt-lg' : ''">
      <div class="icon-wrapper mx-auto q-mb-lg flex flex-center">
        <q-icon name="hub" :size="$q.screen.xs ? '48px' : '64px'" color="primary" class="floating-icon" />
      </div>
      <div class="text-h4 text-weight-bold font-exo title-text">{{ $t('login.title') }}</div>
      <div class="text-subtitle1 text-grey-7 q-mt-sm">{{ $t('login.subtitle') }}</div>
    </q-card-section>

    <!-- Форма авторизації -->
    <q-form @submit.prevent="handleLogin">
      <q-card-section class="q-gutter-y-md q-pt-xl" :class="$q.screen.xs ? 'q-pt-lg' : 'q-pt-xl'">
        <q-input 
          v-model="username" 
          :label="$t('login.username')" 
          outlined 
          stack-label
          class="modern-input"
          :disable="auth.isAuthenticating"
          name="username"
          autocomplete="username"
        >
          <template v-slot:prepend>
            <q-icon name="person_outline" color="primary" />
          </template>
        </q-input>

        <q-input 
          v-model="password" 
          :label="$t('login.password')" 
          :type="isPwd ? 'password' : 'text'" 
          outlined 
          stack-label
          class="modern-input"
          :disable="auth.isAuthenticating"
          name="password"
          autocomplete="current-password"
        >
          <template v-slot:prepend>
            <q-icon name="lock_open" color="primary" />
          </template>
          <template v-slot:append>
            <q-btn
              flat
              round
              dense
              :icon="isPwd ? 'visibility_off' : 'visibility'"
              @click="isPwd = !isPwd"
              color="grey-6"
              size="sm"
            />
          </template>
        </q-input>

        <div class="row items-center">
          <q-checkbox v-model="rememberMe" :label="$t('login.rememberMe')" color="primary" class="text-grey-8" />
        </div>
      </q-card-section>

      <q-card-actions class="q-pt-lg">
        <q-btn 
          type="submit"
          color="primary" 
          :label="$t('login.signIn')" 
          class="full-width login-btn" 
          size="lg" 
          unelevated 
          :loading="auth.isAuthenticating"
        />
      </q-card-actions>
    </q-form>
    
    <div class="text-center q-mt-md">
      <div class="text-caption text-grey-6 italic">{{ $t('login.version') }}</div>
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';

const { locale } = useI18n({ useScope: 'global' });
const auth = useAuthStore();
const $q = useQuasar();

const username = ref('');
const password = ref('');
const isPwd = ref(true);
const rememberMe = ref(true);

const LANG_KEY = 'gemini_app_locale';

const langOptions = [
  { value: 'en-US', label: 'English' },
  { value: 'uk-UA', label: 'Українська' }
];

onMounted(() => {
  const savedLang = localStorage.getItem(LANG_KEY);
  if (savedLang) {
    locale.value = savedLang;
  }
});

watch(locale, (val) => {
  localStorage.setItem(LANG_KEY, val);
});

async function handleLogin() {
  if (!username.value || !password.value) {
    $q.notify({ type: 'warning', message: locale.value === 'uk-UA' ? 'Введіть дані' : 'Enter credentials', position: 'top' });
    return;
  }

  const success = await auth.login(username.value, password.value, rememberMe.value);
  if (!success) {
    $q.notify({ type: 'negative', message: locale.value === 'uk-UA' ? 'Помилка входу' : 'Login failed', position: 'top' });
  }
}
</script>

<style scoped>
.login-card {
  width: 100%;
  max-width: 460px;
  border-radius: 24px;
  position: relative;
  transition: all 0.3s ease;
}

.body--light .login-card {
  background: white;
  box-shadow: 0 10px 40px rgba(0,0,0,0.08);
  border: 1px solid rgba(0,0,0,0.05);
}

.body--dark .login-card {
  background: #1d1d1d;
  border: 1px solid rgba(255,255,255,0.08);
  box-shadow: none;
}

.icon-wrapper {
  width: 100px;
  height: 100px;
  background: rgba(var(--q-primary), 0.05);
  border-radius: 30px;
}

@media (max-width: 599px) {
  .icon-wrapper {
    width: 80px;
    height: 80px;
    margin-bottom: 16px;
  }
  
  .title-text {
    font-size: 24px;
  }
}

.modern-input :deep(.q-field__control) {
  border-radius: 12px;
}

.login-btn {
  height: 56px;
  border-radius: 12px;
  font-weight: bold;
}

.font-exo {
  font-family: 'Exo 2', sans-serif;
}

.floating-icon {
  animation: float 4s ease-in-out infinite;
}

@keyframes float {
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(5deg); }
  100% { transform: translateY(0px) rotate(0deg); }
}

.lang-select {
  width: 110px;
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}
</style>
