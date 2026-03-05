import { defineStore } from 'pinia';
import type { HistoryItem, SystemStatus, AnsiOutput } from '../types/api';

export interface SessionState {
  id: string;
  dir: string;
  history: HistoryItem[];
  pendingHistoryItem: HistoryItem | null;
  status: SystemStatus;
  streamingState: string;
  isActive: boolean;
  activePtyId: number | null;
  shellOutput: AnsiOutput;
  lastPtyOutput: Record<number, string[]>; // Buffer of chunks per PTY
  toolArgsCache: Record<string, any>;
  lastToast: { id: number; message: string; severity: 'info' | 'warning' | 'error' } | null;
  responseStartTime: number | null;
  cliAuthStatus?: { state: string; error: string | null };
}

export const useSessionStore = defineStore('sessions', () => {
  // Use a plain reactive object instead of Map for reliable Vue 3 reactivity
  const sessions = reactive<Record<string, SessionState>>({});
  const activeSessionId = ref<string | null>(null);

  const activeSession = computed(() => {
    if (!activeSessionId.value) return null;
    return sessions[activeSessionId.value] || null;
  });

  function upsertSession(id: string, partial: Partial<SessionState>) {
    if (!sessions[id]) {
      sessions[id] = {
        id,
        dir: '',
        history: [],
        pendingHistoryItem: null,
        status: {
          model: undefined,
          ramUsage: '0 MB',
          contextTokens: 0,
          geminiMdFileCount: 0,
          skillsCount: 0,
          mcpServers: [],
          cwd: '',
          gitBranch: null,
          platform: '',
          activePtyId: null
        },
        streamingState: 'idle',
        isActive: true,
        activePtyId: null,
        shellOutput: [],
        lastPtyOutput: {},
        toolArgsCache: {},
        lastToast: null,
        responseStartTime: null
      };
    }
    
    const session = sessions[id];
    
    if (partial.status) {
      session.status = { ...session.status, ...partial.status };
    }
    
    if (partial.history) {
      partial.history.forEach(item => extractArgs(session, item));
    }

    // Merge other properties
    Object.assign(session, partial);
  }

  function setPtyOutput(sessionId: string, ptyId: number, chunk: string) {
    // No-op: we now use EventBus for live streaming and CLI buffer for replay
  }

  function extractArgs(session: SessionState, item: any) {
    const calls = item.calls || item.payload?.calls || item.toolCalls || item.payload?.toolCalls || item.tools;
    if (calls && Array.isArray(calls)) {
      calls.forEach((c: any) => {
        if (c.name && c.args) {
          const key = c.name.toLowerCase().replace(/_/g, '');
          session.toolArgsCache[key] = c.args;
        }
      });
    }
  }

  function appendShellOutput(sessionId: string, chunk: AnsiOutput) {
    const session = sessions[sessionId];
    if (session) {
      session.shellOutput = [...session.shellOutput, ...chunk];
      if (session.shellOutput.length > 1000) {
        session.shellOutput = session.shellOutput.slice(-1000);
      }
    }
  }

  function addHistoryItem(sessionId: string, item: HistoryItem) {
    const session = sessions[sessionId];
    if (session) {
      const exists = session.history.some(i => i.id === item.id);
      if (!exists) {
        extractArgs(session, item);
        session.history.push(item);
      }
    }
  }

  function setPendingHistoryItem(sessionId: string, item: HistoryItem | null) {
    const session = sessions[sessionId];
    if (session) {
      session.pendingHistoryItem = item;
    }
  }

  function removeSession(id: string) {
    delete sessions[id];
    if (activeSessionId.value === id) activeSessionId.value = null;
  }

  return { 
    sessions, 
    activeSessionId, 
    activeSession, 
    upsertSession, 
    appendShellOutput,
    addHistoryItem, 
    setPtyOutput,
    setPendingHistoryItem,
    removeSession 
  };
});
