<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import type { Terminal as XTerm } from '@xterm/xterm';
import { eventBus } from '../../../utils/eventBus';
import '@xterm/xterm/css/xterm.css';

const props = defineProps<{
  ptyId: number;
  isActive: boolean;
}>();

const emit = defineEmits<{
  (e: 'input', data: string): void;
}>();

const terminalElement = ref<HTMLElement | null>(null);
let terminal: XTerm | null = null;
let fitAddon: any = null;
const pendingData = ref<string[]>([]);

const sessionStore = useSessionStore();
const { subscribePty, unsubscribePty } = useOrchestrator();
const isCollapsed = ref(false);
const hasInitialized = ref(false);

async function initTerminal() {
  if (!process.client || !terminalElement.value) return;

  console.log(`[Terminal ${props.ptyId}] Initializing xterm.js...`);
  
  try {
    const { Terminal } = await import('@xterm/xterm');
    const { FitAddon } = await import('@xterm/addon-fit');

    terminal = new Terminal({
      cursorBlink: true,
      fontSize: 12,
      fontFamily: '"Cascadia Code", Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#000000',
        foreground: '#d4d4d4',
        cursor: '#ffffff',
        selectionBackground: '#333333',
      },
      allowProposedApi: true,
      convertEol: true
    });

    fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(terminalElement.value);
    
    nextTick(() => {
      fitAddon.fit();
      console.log(`[Terminal ${props.ptyId}] Terminal ready, requesting subscription (fromStart: true)...`);
      
      // Initial subscription always from start to get the full history/context
      if (sessionStore.activeSessionId) {
        subscribePty(sessionStore.activeSessionId, props.ptyId, true);
      }

      // Flush data that arrived while xterm was initializing
      if (pendingData.value.length > 0) {
        console.log(`[Terminal ${props.ptyId}] Flushing ${pendingData.value.length} buffered chunks`);
        pendingData.value.forEach(chunk => terminal?.write(chunk));
        pendingData.value = [];
      }
      
      hasInitialized.value = true;
    });

    terminal.onData((data) => {
      if (props.isActive) {
        emit('input', data);
      }
    });
  } catch (e) {
    console.error(`[Terminal ${props.ptyId}] Failed to init terminal:`, e);
  }
}

function handleTerminalClick() {
  if (props.isActive && terminal) {
    terminal.focus();
  }
}

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value;
  
  if (isCollapsed.value) {
    // Unsubscribe when collapsed to stop real-time traffic
    if (sessionStore.activeSessionId) {
      console.log(`[Terminal ${props.ptyId}] Collapsed, unsubscribing...`);
      unsubscribePty(sessionStore.activeSessionId, props.ptyId);
    }
  } else {
    // Re-subscribe when expanded, but from last point (fromStart: false)
    nextTick(() => {
      if (fitAddon) fitAddon.fit();
      if (sessionStore.activeSessionId && hasInitialized.value) {
        console.log(`[Terminal ${props.ptyId}] Expanded, re-subscribing (fromStart: false)...`);
        subscribePty(sessionStore.activeSessionId, props.ptyId, false);
      }
    });
  }
}

function handleOutput(newChunk: string) {
  if (!newChunk) return;
  
  if (terminal) {
    // Only write if not collapsed. If collapsed, we'll catch up on expand.
    if (!isCollapsed.value) {
      terminal.write(newChunk);
    }
  } else {
    pendingData.value.push(newChunk);
    if (pendingData.value.length > 500) pendingData.value.shift();
  }
}

onMounted(async () => {
  console.log(`[Terminal ${props.ptyId}] Component mounted`);
  eventBus.onTerminalOutput(props.ptyId, handleOutput);
  await initTerminal();
  if (process.client) {
    window.addEventListener('resize', () => fitAddon?.fit());
  }
});

onUnmounted(() => {
  terminal?.dispose();
  eventBus.offTerminalOutput(props.ptyId, handleOutput);
  
  if (sessionStore.activeSessionId) {
    unsubscribePty(sessionStore.activeSessionId, props.ptyId);
  }

  if (process.client) {
    window.removeEventListener('resize', () => fitAddon?.fit());
  }
});

defineExpose({
  write: (data: string) => {
    if (terminal && !isCollapsed.value) {
      terminal.write(data);
    }
  },
  fit: () => fitAddon?.fit()
});
</script>

<template>
  <div class="flex flex-col w-full bg-black border border-neutral-800 rounded-lg overflow-hidden my-2 shadow-xl min-h-[100px]">
    <!-- Terminal Header -->
    <div class="flex items-center justify-between px-3 py-1.5 bg-neutral-900 border-b border-neutral-800 select-none">
      <div class="flex items-center gap-2">
        <UIcon name="i-heroicons-command-line" class="w-3.5 h-3.5 text-neutral-400" />
        <span class="text-[10px] font-black text-neutral-200 uppercase tracking-widest">
          Terminal PTY: {{ ptyId }}
        </span>
        <span v-if="isActive" class="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
      </div>
      
      <div class="flex items-center gap-2">
        <button 
          class="p-1 hover:bg-neutral-800 rounded transition-colors text-neutral-500 hover:text-neutral-200"
          @click="toggleCollapse"
        >
          <UIcon :name="isCollapsed ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-up'" class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Terminal Content -->
    <div 
      v-show="!isCollapsed" 
      ref="terminalElement" 
      class="h-64 w-full p-2 cursor-text"
      @click="handleTerminalClick"
    ></div>
    
    <div v-if="isCollapsed" class="px-3 py-2 text-[10px] text-neutral-500 italic flex items-center gap-2">
      <UIcon name="i-heroicons-pause-circle" class="w-3.5 h-3.5" />
      Terminal updates paused while collapsed
    </div>
  </div>
</template>

<style>
.xterm {
  padding: 4px;
}
.xterm .xterm-viewport {
  background-color: #000 !important;
}
.xterm-viewport::-webkit-scrollbar {
  width: 8px;
}
.xterm-viewport::-webkit-scrollbar-track {
  background: transparent;
}
.xterm-viewport::-webkit-scrollbar-thumb {
  background: #333;
  border-radius: 10px;
}
.xterm-viewport::-webkit-scrollbar-thumb:hover {
  background: #444;
}
</style>
