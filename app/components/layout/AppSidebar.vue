<script setup lang="ts">
import SessionItem from '../chat/parts/SessionItem.vue';

defineProps<{
  isOpen: boolean;
  isConnected: boolean;
}>();

const emit = defineEmits(['open-new-session', 'select-session', 'stop-session', 'toggle-sidebar']);
const sessionStore = useSessionStore();
</script>

<template>
  <!-- Overlay for mobile when sidebar is open -->
  <div 
    v-if="isOpen" 
    class="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
    @click="emit('toggle-sidebar')"
  ></div>

  <aside 
    class="fixed lg:relative z-50 border-r border-[var(--color-vsc-border)] flex flex-col bg-[var(--color-vsc-sidebar)] transition-all duration-300 ease-in-out overflow-hidden h-full shadow-2xl lg:shadow-none"
    :class="isOpen ? 'w-72 opacity-100 translate-x-0' : 'w-0 p-0 border-none opacity-0 -translate-x-full lg:translate-x-0'"
  >
    <!-- Sidebar Header -->
    <div class="px-4 py-3 flex items-center justify-between min-w-[250px] border-b border-[var(--color-vsc-border)] h-12">
      <div class="flex items-center gap-2">
        <div class="w-6 h-6 bg-[var(--color-vsc-blue)] rounded flex items-center justify-center">
          <UIcon name="i-heroicons-cpu-chip" class="text-white w-4 h-4" />
        </div>
        <span class="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Gemini Remote</span>
      </div>
      <div class="flex items-center gap-2">
        <UBadge :color="isConnected ? 'emerald' : 'red'" variant="subtle" size="sm" class="rounded-full px-2 text-[9px] font-black uppercase tracking-tighter">
          {{ isConnected ? 'Online' : 'Offline' }}
        </UBadge>
        <UButton
          icon="i-heroicons-x-mark"
          color="neutral"
          variant="ghost"
          size="xs"
          class="lg:hidden hover:bg-[var(--color-vsc-active)]"
          @click="emit('toggle-sidebar')"
        />
      </div>
    </div>

    <!-- New Session Button -->
    <div class="p-4 min-w-[250px]">
      <UButton
        icon="i-heroicons-plus"
        color="primary"
        variant="solid"
        size="md"
        block
        label="New Session"
        class="bg-[var(--color-vsc-blue)] hover:bg-[var(--color-vsc-blue-bright)] transition-colors shadow-lg shadow-blue-900/20"
        @click="emit('open-new-session')"
      />
    </div>

    <!-- Sessions List -->
    <div class="flex-1 overflow-y-auto min-w-[250px]">
      <div v-if="sessionStore.sessions.size === 0" class="px-4 py-10 text-neutral-600 text-xs text-center italic border-none">
        No projects open
      </div>
      <SessionItem
        v-for="[id, session] in sessionStore.sessions"
        :key="id"
        :id="id"
        :dir="session.dir"
        :is-active="sessionStore.activeSessionId === id"
        :status="session.status"
        @select="id => { emit('select-session', id); if (typeof window !== 'undefined' && window.innerWidth < 1024) emit('toggle-sidebar'); }"
        @stop="id => emit('stop-session', id)"
      />
    </div>

    <!-- Sidebar Footer -->
    <div class="p-3 border-t border-[var(--color-vsc-border)] min-w-[250px] flex items-center justify-center">
      <span class="text-[8px] font-bold text-neutral-600 uppercase tracking-widest">v1.0.0-remote</span>
    </div>
  </aside>
</template>
