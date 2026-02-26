import { OrchestratorAction, OrchestratorResponse, type OrchestratorMessage, CLIMessageType } from '../types/api';
import { useSessionStore } from '../stores/sessionStore';

export function useOrchestrator() {
  const ws = ref<WebSocket | null>(null);
  const sessionStore = useSessionStore();
  const isConnected = ref(false);

  function connect() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname || 'localhost';
    const socket = new WebSocket(`${protocol}//${host}:8000/ws`);
    
    socket.onopen = () => {
      isConnected.value = true;
      send(OrchestratorAction.LIST_SESSIONS, {});
    };

    socket.onmessage = (event) => {
      try {
        const data: OrchestratorMessage = JSON.parse(event.data);
        handleMessage(data);
      } catch (e) {
        console.error('Failed to parse orchestrator message', e);
      }
    };

    socket.onclose = () => {
      isConnected.value = false;
      setTimeout(connect, 3000);
    };

    ws.value = socket;
  }

  function handleMessage(data: OrchestratorMessage) {
    switch (data.type) {
      case OrchestratorResponse.SESSION_LIST:
        data.sessions?.forEach(s => {
          sessionStore.upsertSession(s.id, { dir: s.dir, isActive: true });
          send(OrchestratorAction.CONNECT_SESSION, { session_id: s.id });
          requestSessionState(s.id);
        });
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
          isActive: true
        });
        break;
      
      case CLIMessageType.HISTORY_UPDATE:
        sessionStore.addHistoryItem(sessionId, msg.payload.item);
        break;
      
      case CLIMessageType.STATUS_UPDATE:
        sessionStore.upsertSession(sessionId, { status: msg.payload });
        break;

      case CLIMessageType.STREAMING_STATE:
        sessionStore.upsertSession(sessionId, { streamingState: msg.payload.state });
        break;
      
      case CLIMessageType.THOUGHT_STREAM:
        if (sessionStore.activeSessionId === sessionId) {
           sessionStore.upsertSession(sessionId, { 
             streamingState: msg.payload.isComplete ? 'idle' : 'responding' 
           });
        }
        break;
    }
  }

  function send(action: OrchestratorAction, payload: any) {
    if (ws.value?.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify({ action, ...payload }));
    }
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
    send(OrchestratorAction.CLI_COMMAND, {
      session_id: sessionStore.activeSessionId,
      payload: { type: CLIMessageType.SEND_PROMPT, payload: { text } }
    });
  }

  function stopGeneration() {
    if (!sessionStore.activeSessionId) return;
    send(OrchestratorAction.CLI_COMMAND, {
      session_id: sessionStore.activeSessionId,
      payload: { type: CLIMessageType.STOP_GENERATION, payload: {} }
    });
  }

  return { isConnected, connect, startSession, stopSession, sendMessage, stopGeneration };
}
