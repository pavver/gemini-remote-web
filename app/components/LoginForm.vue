<script setup lang="ts">
const props = defineProps<{
  error?: string | null;
  isConnecting?: boolean;
  initialData?: any;
}>();

const emit = defineEmits<{
  (e: 'connect', data: { url: string; login: string; password: string; remember: boolean }): void;
}>();

const url = ref('ws://localhost:8000/ws');
const login = ref('admin');
const password = ref('');
const remember = ref(true);

onMounted(() => {
  if (props.initialData) {
    url.value = props.initialData.url || url.value;
    login.value = props.initialData.login || login.value;
    password.value = props.initialData.password || password.value;
    remember.value = true;
  } else if (import.meta.client) {
    url.value = `ws://${window.location.hostname}:8000/ws`;
  }
});

function handleConnect() {
  emit('connect', {
    url: url.value,
    login: login.value,
    password: password.value,
    remember: remember.value
  });
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-[var(--color-vsc-bg)]">
    <UCard 
      class="w-full max-w-md bg-[var(--color-vsc-sidebar)] border-[var(--color-vsc-border)]"
      :ui="{
        header: 'border-b border-[var(--color-vsc-border)]',
        body: 'p-6'
      }"
    >
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-shield-check" class="w-6 h-6 text-[var(--color-vsc-blue)]" />
          <h1 class="text-lg font-bold text-white uppercase tracking-wider">Gemini Remote Login</h1>
        </div>
      </template>

      <div class="space-y-5">
        <UFormField label="Orchestrator URL" class="w-full">
          <UInput 
            v-model="url" 
            icon="i-heroicons-globe-alt" 
            placeholder="ws://localhost:8000/ws" 
            color="neutral"
            variant="outline"
            class="w-full"
            :ui="{ 
              base: 'bg-[var(--color-vsc-bg)] border-[var(--color-vsc-border)] text-white focus:ring-1 focus:ring-[var(--color-vsc-blue)] rounded-md'
            }"
          />
        </UFormField>

        <UFormField label="Login" class="w-full">
          <UInput 
            v-model="login" 
            icon="i-heroicons-user" 
            placeholder="admin" 
            color="neutral"
            variant="outline"
            class="w-full"
            :ui="{ 
              base: 'bg-[var(--color-vsc-bg)] border-[var(--color-vsc-border)] text-white focus:ring-1 focus:ring-[var(--color-vsc-blue)] rounded-md'
            }"
          />
        </UFormField>

        <UFormField label="Password" class="w-full">
          <UInput 
            v-model="password" 
            type="password" 
            icon="i-heroicons-key" 
            placeholder="••••••••" 
            color="neutral"
            variant="outline"
            class="w-full"
            :ui="{ 
              base: 'bg-[var(--color-vsc-bg)] border-[var(--color-vsc-border)] text-white focus:ring-1 focus:ring-[var(--color-vsc-blue)] rounded-md'
            }"
            @keyup.enter="handleConnect"
          />
        </UFormField>

        <div class="flex items-center gap-2 py-1">
          <UCheckbox v-model="remember" label="Remember credentials" color="primary" />
        </div>

        <UAlert
          v-if="error"
          color="error"
          variant="soft"
          icon="i-heroicons-exclamation-triangle"
          :title="error"
        />

        <UButton
          block
          size="lg"
          :loading="isConnecting"
          class="bg-[var(--color-vsc-blue)] hover:bg-[var(--color-vsc-blue-bright)] text-white font-bold transition-all"
          @click="handleConnect"
        >
          CONNECT
        </UButton>
      </div>
    </UCard>
  </div>
</template>
