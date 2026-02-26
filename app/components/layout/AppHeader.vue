<script setup lang="ts">
const props = defineProps<{
  sidebarOpen: boolean;
}>();

const emit = defineEmits(['toggle-sidebar']);
const sessionStore = useSessionStore();

const activeFolderName = computed(() => {
  const dir = sessionStore.activeSession?.dir;
  if (!dir) return 'Gemini CLI';
  const parts = dir.split('/');
  return parts[parts.length - 1] || dir;
});
</script>

<template>
  <header class="px-2 sm:px-4 border-b border-[var(--color-vsc-border)] bg-[var(--color-vsc-header)] flex justify-between items-center h-12 sm:h-12 shadow-sm z-30">
    <div class="flex items-center gap-2 sm:gap-4 overflow-hidden">
      <UButton
        color="neutral"
        variant="ghost"
        :icon="sidebarOpen ? 'i-heroicons-bars-3-bottom-left' : 'i-heroicons-bars-3'"
        size="md"
        class="hover:bg-[var(--color-vsc-active)]"
        @click="emit('toggle-sidebar')"
      />
      
      <div v-if="sessionStore.activeSession" class="flex items-center gap-2 overflow-hidden">
        <div class="w-1.5 h-1.5 rounded-full animate-pulse bg-emerald-500 flex-shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
        <div class="flex items-baseline gap-2 overflow-hidden">
          <h2 class="text-xs font-bold text-neutral-300 truncate">{{ activeFolderName }}</h2>
          <span class="hidden lg:inline text-[10px] text-neutral-500 font-mono italic truncate max-w-[300px]">
            {{ sessionStore.activeSession.dir }}
          </span>
        </div>
      </div>
    </div>
    
    <div v-if="sessionStore.activeSession?.status" class="flex gap-4 sm:gap-8 items-center flex-shrink-0">
      <!-- Tokens Widget -->
      <div v-if="sessionStore.activeSession.status?.contextTokens !== undefined" class="flex items-center gap-2 sm:gap-3">
        <div class="flex flex-col items-end">
          <span class="text-[9px] font-bold font-mono" :class="Math.round((sessionStore.activeSession.status.contextTokens / 1000000) * 100) > 80 ? 'text-red-400' : 'text-emerald-500'">
            {{ sessionStore.activeSession.status.contextTokens.toLocaleString() }}
          </span>
        </div>
        <div class="flex flex-col gap-1">
          <div class="w-12 sm:w-24 h-1 bg-neutral-800 rounded-full overflow-hidden">
            <div 
              class="h-full transition-all duration-500 ease-out"
              :class="Math.round((sessionStore.activeSession.status.contextTokens / 1000000) * 100) > 80 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-[var(--color-vsc-blue)]'"
              :style="{ width: `${Math.min(100, (sessionStore.activeSession.status.contextTokens / 1000000) * 100)}%` }"
            ></div>
          </div>
          <div class="hidden sm:flex justify-between w-full">
             <span class="text-[7px] text-neutral-600 font-black uppercase tracking-tighter">Usage</span>
             <span class="text-[7px] text-neutral-600 font-black uppercase tracking-tighter">1M Limit</span>
          </div>
        </div>
      </div>

      <!-- RAM -->
      <div class="hidden xs:flex items-center gap-2 px-2 py-1 bg-neutral-800/30 rounded border border-neutral-700/30">
        <UIcon name="i-heroicons-circle-stack" class="text-neutral-500 w-3 h-3" />
        <span class="font-mono text-[10px] text-neutral-400 font-bold">{{ sessionStore.activeSession.status.ramUsage }}</span>
      </div>
    </div>
  </header>
</template>

<style scoped>
@media (min-width: 450px) {
  .xs\:flex { display: flex; }
}
</style>
