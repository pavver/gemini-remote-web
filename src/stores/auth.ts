import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useGeminiStore } from './gemini';
import { useQuasar } from 'quasar';
import type { OrchestratorResponse, OrchestratorAction, SessionInfo, RemoteMessage } from '../types/protocol';

const ORCHESTRATOR_WS_URL = `ws://${window.location.hostname}:8000/ws`;
const AUTH_KEY = 'gemini_auth_session';
const RECENT_DIRS_KEY = 'gemini_recent_dirs';

export const useAuthStore = defineStore('auth', () => {
  const geminiStore = useGeminiStore();
  const $q = useQuasar();
  
  const ws = ref<WebSocket | null>(null);
  const user = ref<string | null>(null);
  const isAuthenticating = ref(false);
  const isAuthenticated = ref(false);
  const sessions = ref<SessionInfo[]>([]);
  const activeSessionId = ref<string | null>(null);
  const recentDirs = ref<string[]>(JSON.parse(localStorage.getItem(RECENT_DIRS_KEY) || '[]'));

  function connectOrchestrator() {
    if (ws.value && ws.value.readyState === WebSocket.OPEN) return;

    ws.value = new WebSocket(ORCHESTRATOR_WS_URL);

    ws.value.onmessage = (event) => {
      try {
        console.log('[Orchestrator WS RAW]', event.data);
        const resp = JSON.parse(event.data) as OrchestratorResponse;
        handleOrchestratorMessage(resp);
      } catch (e) {
        console.error('Failed to parse Orchestrator message', e);
      }
    };

    ws.value.onclose = () => {
      isAuthenticated.value = false;
      isAuthenticating.value = false;
    };
  }

  function handleOrchestratorMessage(resp: OrchestratorResponse) {
    console.log('[AuthStore] Incoming Orchestrator message:', resp.type, resp);
    switch (resp.type) {
      case 'AUTH_OK':
        isAuthenticated.value = true;
        isAuthenticating.value = false;
        sendToOrchestrator({ action: 'LIST_SESSIONS' });
        break;
      case 'AUTH_FAILED':
        isAuthenticated.value = false;
        isAuthenticating.value = false;
        $q.notify({ type: 'negative', message: resp.message || 'Auth failed' });
        break;
      case 'SESSION_LIST':
        sessions.value = resp.sessions;
        
        // Check if active session still exists in the list
        if (activeSessionId.value && !sessions.value.some(s => s.id === activeSessionId.value)) {
          console.warn('[AuthStore] Active session no longer exists in orchestrator list');
          activeSessionId.value = null;
          geminiStore.resetChatState();
          $q.notify({ type: 'warning', message: 'Активну сесію було видалено' });
        }

        if (sessions.value.length > 0 && !activeSessionId.value) {
          const first = sessions.value[0];
          if (first) connectToSession(first.id);
        }
        break;
      case 'SESSION_STARTED':
        geminiStore.resetChatState();
        connectToSession(resp.session_id);
        sendToOrchestrator({ action: 'LIST_SESSIONS' });
        break;
      case 'SESSION_STOPPED':
        if (activeSessionId.value === resp.session_id) {
          activeSessionId.value = null;
          geminiStore.resetChatState();
          $q.notify({ type: 'warning', message: `Сесія ${resp.session_id.slice(0, 8)} зупинена` });
        }
        sendToOrchestrator({ action: 'LIST_SESSIONS' });
        break;
      case 'SESSION_CONNECTED':
        geminiStore.setProxyMode(resp.session_id, (payload) => {
          sendToOrchestrator({ action: 'CLI_COMMAND', session_id: resp.session_id, payload });
        });
        break;
      case 'PROXY_MESSAGE':
        if (resp.session_id === activeSessionId.value) {
          geminiStore.handleMessage(resp.message as RemoteMessage);
        }
        break;
      case 'ERROR':
        $q.notify({ type: 'negative', message: resp.message });
        break;
    }
  }

  function sendToOrchestrator(action: OrchestratorAction) {
    if (ws.value?.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify(action));
    }
  }

  function login(username: string, password: string, remember: boolean): Promise<boolean> {
    isAuthenticating.value = true;
    connectOrchestrator();

    return new Promise((resolve) => {
      const checkConnection = setInterval(() => {
        if (ws.value?.readyState === WebSocket.OPEN) {
          clearInterval(checkConnection);
          sendToOrchestrator({ action: 'AUTH', login: username, password });
          user.value = username;
          if (remember) {
            localStorage.setItem(AUTH_KEY, JSON.stringify({ username, password }));
          }

          const checkAuth = setInterval(() => {
            if (isAuthenticated.value) {
              clearInterval(checkAuth);
              resolve(true);
            } else if (!isAuthenticating.value) {
              clearInterval(checkAuth);
              resolve(false);
            }
          }, 100);

          setTimeout(() => { clearInterval(checkAuth); resolve(false); }, 5000);
        }
      }, 100);

      setTimeout(() => {
        clearInterval(checkConnection);
        if (!ws.value || ws.value.readyState !== WebSocket.OPEN) {
          isAuthenticating.value = false;
          resolve(false);
        }
      }, 5000);
    });
  }

  function startNewSession(dir: string) {
    const dirs = [dir, ...recentDirs.value.filter(d => d !== dir)].slice(0, 5);
    recentDirs.value = dirs;
    localStorage.setItem(RECENT_DIRS_KEY, JSON.stringify(dirs));
    sendToOrchestrator({ action: 'START_SESSION', dir });
  }

  function stopSession(sessionId: string) {
    sendToOrchestrator({ action: 'STOP_SESSION', session_id: sessionId });
  }

  function connectToSession(sessionId: string) {
    if (activeSessionId.value !== sessionId) {
      geminiStore.resetChatState();
    }
    activeSessionId.value = sessionId;
    sendToOrchestrator({ action: 'CONNECT_SESSION', session_id: sessionId });
  }

  async function tryAutoLogin(): Promise<boolean> {
    const saved = localStorage.getItem(AUTH_KEY);
    if (!saved) return false;
    try {
      const { username, password } = JSON.parse(saved);
      return await login(username, password, true);
    } catch {
      localStorage.removeItem(AUTH_KEY);
      return false;
    }
  }

  function logout() {
    ws.value?.close();
    isAuthenticated.value = false;
    localStorage.removeItem(AUTH_KEY);
  }

  return {
    user,
    isAuthenticating,
    isAuthenticated,
    sessions,
    activeSessionId,
    recentDirs,
    login,
    logout,
    tryAutoLogin,
    startNewSession,
    stopSession,
    connectToSession
  };
});
