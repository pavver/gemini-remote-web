import { OrchestratorAction, OrchestratorResponse, CLIMessageType } from '../types/api';
import { useSessionStore } from '../stores/sessionStore';

// Shared state across all components
const ws = ref<WebSocket | null>(null);
const isConnected = ref(false);
const isAuthenticated = ref(false);
const authError = ref<string | null>(null);
const suggestions = ref<any[]>([]);
const activeConfirmation = ref<any>(null);

export function useOrchestrator() {
  const sessionStore = useSessionStore();

  function connect(url: string, login?: string, password?: string) {
    if (ws.value) ws.value.close();
    
    const socket = new WebSocket(url);
    authError.value = null;
    
    socket.onopen = () => {
      isConnected.value = true;
      if (login && password) {
        sendRaw({ action: OrchestratorAction.AUTH, login, password });
      } else {
        send(OrchestratorAction.LIST_SESSIONS, {});
      }
    };

    socket.onmessage = (event) => {
      try {
        console.log('[Orchestrator RAW]:', event.data);
        const data: any = JSON.parse(event.data);
        handleMessage(data);
      } catch (e) {
        console.error('Failed to parse orchestrator message', e);
      }
    };

    socket.onclose = () => {
      isConnected.value = false;
      
      // If we weren't authenticated and there's no specific error yet, it's a connection issue
      if (!isAuthenticated.value && !authError.value) {
        authError.value = 'Could not connect to Orchestrator. Check URL or firewall.';
      }

      // Do not auto-reconnect if auth failed or explicitly disconnected
      if (isAuthenticated.value) {
        setTimeout(() => connect(url, login, password), 3000);
      }
    };

    ws.value = socket;
  }

  function handleMessage(data: any) {
    switch (data.type) {
      case OrchestratorResponse.AUTH_OK:
        isAuthenticated.value = true;
        authError.value = null;
        send(OrchestratorAction.LIST_SESSIONS, {});
        break;

      case OrchestratorResponse.AUTH_FAILED:
        isAuthenticated.value = false;
        authError.value = data.message || 'Authentication failed';
        ws.value?.close();
        break;

      case OrchestratorResponse.SESSION_LIST:
        data.sessions?.forEach((s: any) => {
          sessionStore.upsertSession(s.id, { dir: s.dir, isActive: true });
          send(OrchestratorAction.CONNECT_SESSION, { session_id: s.id });
          requestSessionState(s.id);
        });
        if (data.sessions?.length > 0 && !sessionStore.activeSessionId) {
          sessionStore.activeSessionId = data.sessions[0].id;
        }
        break;

      case OrchestratorResponse.SESSION_STARTED:
        if (data.session_id) {
          sessionStore.upsertSession(data.session_id, { dir: data.dir || '', isActive: true });
          sessionStore.activeSessionId = data.session_id;
          send(OrchestratorAction.CONNECT_SESSION, { session_id: data.session_id });
          requestSessionState(data.session_id);
        }
        break;

      case OrchestratorResponse.PROXY_MESSAGE:
        if (data.session_id && data.message) {
          handleCLIMessage(data.session_id, data.message);
        }
        break;
      
      case OrchestratorResponse.SESSION_STOPPED:
        if (data.session_id) sessionStore.removeSession(data.session_id);
        break;
    }
  }

  function handleCLIMessage(sessionId: string, msg: any) {
    switch (msg.type) {
      case CLIMessageType.SESSION_INIT:
        sessionStore.upsertSession(sessionId, {
          history: msg.payload.history || [],
          status: msg.payload.status,
          streamingState: msg.payload.streamingState || 'idle',
          activePtyId: msg.payload.activePtyId,
          isActive: true
        });
        // Auto-subscribe to shell if PTY is active
        if (msg.payload.activePtyId) {
          subscribe(sessionId, `shell:${msg.payload.activePtyId}`);
        }
        break;
      
      case CLIMessageType.HISTORY_UPDATE:
        sessionStore.addHistoryItem(sessionId, msg.payload.item);
        break;

      case CLIMessageType.HISTORY_RESPONSE:
        // Merge old history items from pagination
        if (msg.payload.items) {
          const session = sessionStore.sessions[sessionId];
          if (session) {
             const existingIds = new Set(session.history.map(i => i.id));
             const newItems = msg.payload.items.filter((i: any) => !existingIds.has(i.id));
             session.history = [...newItems, ...session.history];
          }
        }
        break;
      
      case CLIMessageType.STATUS_UPDATE:
        const prevPtyId = sessionStore.sessions[sessionId]?.activePtyId;
        sessionStore.upsertSession(sessionId, { 
          status: msg.payload,
          activePtyId: msg.payload.activePtyId 
        });
        // Handle PTY subscription change
        if (msg.payload.activePtyId && msg.payload.activePtyId !== prevPtyId) {
           if (prevPtyId) unsubscribe(sessionId, `shell:${prevPtyId}`);
           subscribe(sessionId, `shell:${msg.payload.activePtyId}`);
        }
        break;

      case CLIMessageType.SHELL_OUTPUT:
        sessionStore.appendShellOutput(sessionId, Array.isArray(msg.payload.chunk) ? msg.payload.chunk : [[{ text: msg.payload.chunk, fg: '', bg: '', bold: false, italic: false, underline: false, inverse: false }]]);
        break;

      case CLIMessageType.STREAMING_STATE:
        if (msg.payload.state === 'idle') {
          // Delay transition to idle to keep final toast visible for 1s
          setTimeout(() => {
            sessionStore.upsertSession(sessionId, { 
              streamingState: 'idle',
              responseStartTime: null
            });
          }, 1000);
        } else {
          sessionStore.upsertSession(sessionId, { 
            streamingState: msg.payload.state,
            responseStartTime: undefined
          });
        }
        break;

      case CLIMessageType.TOAST:
        sessionStore.upsertSession(sessionId, { lastToast: msg.payload });
        break;
      
      case CLIMessageType.THOUGHT_STREAM:
        if (sessionStore.activeSessionId === sessionId) {
           sessionStore.upsertSession(sessionId, { 
             streamingState: msg.payload.isComplete ? 'idle' : 'responding',
             responseStartTime: msg.payload.isComplete ? null : undefined
           });
        }
        break;

      case CLIMessageType.SEARCH_RESPONSE:
        suggestions.value = msg.payload?.suggestions || [];
        break;

      case CLIMessageType.CONFIRMATION_REQUEST:
        activeConfirmation.value = msg.payload;
        break;

      case CLIMessageType.AUTH_STATE_UPDATE:
        sessionStore.upsertSession(sessionId, { 
          cliAuthStatus: { state: msg.payload.state, error: msg.payload.error } as any
        });
        break;

      case CLIMessageType.OPEN_DIFF:
        console.log('[Orchestrator] Diff requested:', msg.payload);
        break;
    }
  }

  function send(action: OrchestratorAction, payload: any) {
    if (ws.value?.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify({ action, ...payload }));
    }
  }

  function sendRaw(data: any) {
    if (ws.value?.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify(data));
    }
  }

  function subscribe(sessionId: string, topic: string) {
    send(OrchestratorAction.CLI_COMMAND, {
      session_id: sessionId,
      payload: { type: CLIMessageType.SUBSCRIBE, payload: { topic } }
    });
  }

  function unsubscribe(sessionId: string, topic: string) {
    send(OrchestratorAction.CLI_COMMAND, {
      session_id: sessionId,
      payload: { type: CLIMessageType.UNSUBSCRIBE, payload: { topic } }
    });
  }

  function requestHistory(offset: number, limit: number = 20) {
    if (!sessionStore.activeSessionId) return;
    send(OrchestratorAction.CLI_COMMAND, {
      session_id: sessionStore.activeSessionId,
      payload: { type: CLIMessageType.HISTORY_REQUEST, payload: { offset, limit } }
    });
  }

  function sendDiffResponse(filePath: string, accepted: boolean, content?: string) {
    if (!sessionStore.activeSessionId) return;
    send(OrchestratorAction.CLI_COMMAND, {
      session_id: sessionStore.activeSessionId,
      payload: { type: CLIMessageType.DIFF_RESPONSE, payload: { filePath, accepted, content } }
    });
  }

  function submitAuth(method?: string, apiKey?: string) {
    if (!sessionStore.activeSessionId) return;
    send(OrchestratorAction.CLI_COMMAND, {
      session_id: sessionStore.activeSessionId,
      payload: { type: CLIMessageType.AUTH_SUBMIT, payload: { method, apiKey } }
    });
  }

  function startSession(dir: string = '/home/radxa/gemini') {
    send(OrchestratorAction.START_SESSION, { dir });
  }

  function stopSession(sessionId: string) {
    send(OrchestratorAction.STOP_SESSION, { session_id: sessionId });
  }

  function requestSessionState(sessionId: string) {
    send(OrchestratorAction.CLI_COMMAND, {
      session_id: sessionId,
      payload: { type: CLIMessageType.SESSION_STATE_REQUEST, payload: {} }
    });
  }

  function sendMessage(text: string) {
    if (!sessionStore.activeSessionId) return;
    
    sessionStore.upsertSession(sessionStore.activeSessionId, { 
      lastToast: null,
      responseStartTime: Date.now() 
    });

    if (text.startsWith('/')) {
      send(OrchestratorAction.CLI_COMMAND, {
        session_id: sessionStore.activeSessionId,
        payload: { type: CLIMessageType.EXECUTE_COMMAND, payload: { command: text } }
      });
    } else {
      send(OrchestratorAction.CLI_COMMAND, {
        session_id: sessionStore.activeSessionId,
        payload: { type: CLIMessageType.SEND_PROMPT, payload: { text } }
      });
    }
  }

  function stopGeneration() {
    if (!sessionStore.activeSessionId) return;
    send(OrchestratorAction.CLI_COMMAND, {
      session_id: sessionStore.activeSessionId,
      payload: { type: CLIMessageType.STOP_GENERATION, payload: {} }
    });
  }

  function requestSuggestions(query: string, type: 'at' | 'slash' = 'slash') {
    if (!sessionStore.activeSessionId) return;
    send(OrchestratorAction.CLI_COMMAND, {
      session_id: sessionStore.activeSessionId,
      payload: { 
        type: CLIMessageType.SEARCH_REQUEST, 
        payload: { query, type } 
      }
    });
  }

  function sendConfirmation(id: number, confirmed: boolean, choice?: string) {
    if (!sessionStore.activeSessionId) return;
    send(OrchestratorAction.CLI_COMMAND, {
      session_id: sessionStore.activeSessionId,
      payload: { 
        type: CLIMessageType.CONFIRMATION_RESPONSE, 
        payload: { id, confirmed, choice } 
      }
    });
    activeConfirmation.value = null;
  }

  return { 
    isConnected, 
    isAuthenticated, 
    authError, 
    suggestions,
    activeConfirmation,
    connect, 
    startSession, 
    stopSession, 
    sendMessage, 
    stopGeneration,
    requestSuggestions,
    sendConfirmation,
    subscribe,
    unsubscribe,
    requestHistory,
    sendDiffResponse,
    submitAuth
  };
}
