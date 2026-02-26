import { defineStore } from 'pinia';
import type { HistoryItem, SystemStatus, Session } from '../types/api';

export interface SessionState {
  id: string;
  dir: string;
  history: HistoryItem[];
  status: SystemStatus;
  streamingState: string;
  isActive: boolean;
  toolArgsCache: Record<string, any>;
}

export const useSessionStore = defineStore('sessions', () => {
  const sessions = ref<Map<string, SessionState>>(new Map());
  const activeSessionId = ref<string | null>(null);

  const activeSession = computed(() => {
    if (!activeSessionId.value) return null;
    return sessions.value.get(activeSessionId.value) || null;
  });

  function upsertSession(id: string, partial: Partial<SessionState>) {
    const existing = sessions.value.get(id) || {
      id,
      dir: '',
      history: [],
      status: {
        model: undefined,
        ramUsage: '0 MB',
        contextTokens: 0,
        geminiMdFileCount: 0,
        skillsCount: 0,
        mcpServers: []
      },
      streamingState: 'idle',
      isActive: true,
      toolArgsCache: {}
    };
    
    // Robust status merge
    if (partial.status) {
      existing.status = { ...existing.status, ...partial.status };
    }
    
    // Scan history for tool args
    if (partial.history) {
      partial.history.forEach(item => extractArgs(existing, item));
    }

    sessions.value.set(id, { 
      ...existing, 
      ...partial,
      status: { ...existing.status } as SystemStatus
    });
  }

  function extractArgs(session: SessionState, item: any) {
    const calls = item.calls || item.payload?.calls || item.toolCalls || item.payload?.toolCalls;
    if (calls && Array.isArray(calls)) {
      calls.forEach((c: any) => {
        if (c.name && c.args) {
          const key = c.name.toLowerCase().replace(/_/g, '');
          session.toolArgsCache[key] = c.args;
        }
      });
    }
  }

  function addHistoryItem(sessionId: string, item: HistoryItem) {
    const session = sessions.value.get(sessionId);
    if (session) {
      const exists = session.history.some(i => i.id === item.id);
      if (!exists) {
        extractArgs(session as SessionState, item);
        session.history.push(item);
      }
    }
  }

  function removeSession(id: string) {
    sessions.value.delete(id);
    if (activeSessionId.value === id) activeSessionId.value = null;
  }

  return { sessions, activeSessionId, activeSession, upsertSession, addHistoryItem, removeSession };
});
