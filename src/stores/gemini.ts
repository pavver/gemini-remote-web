import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { 
  AgentStatus, 
  QuotaState, 
  MemoryState, 
  ThoughtInfo, 
  ConsentRequest, 
  RemoteMessage,
  AllTopics,
  AgentInfo,
  SessionStatusState,
  ModelState,
  SessionIdState,
  RamUsageState,
  AgentsState,
  McpServersState,
  EditorState,
  LastMessageIdState,
  LoadingIndicatorState,
  ChatStreamEvent,
  SettingsHashState,
  RemoteSettingDefinition,
  SettingsListResponse,
  RemoteMessageRecord,
  ChatHistoryResponse
} from '../types/protocol';

export const useGeminiStore = defineStore('gemini', () => {
  const isConnected = ref(false);
  const isAuthenticated = ref(false);

  // Proxy settings
  const proxyMode = ref(false);
  const activeSessionId = ref<string | null>(null);
  let proxySender: ((payload: Record<string, unknown>) => void) | null = null;

  // System State
  const status = ref<AgentStatus>('idle');
  const quota = ref<QuotaState | null>(null);
  const memory = ref<MemoryState | null>(null);
  const activeModel = ref<string | null>(null);
  const geminiSessionId = ref<string | null>(null);
  const ramUsage = ref<string | null>(null); // formatted string
  const agents = ref<AgentInfo[]>([]);
  const mcpServers = ref<string[]>([]);
  const loadingIndicator = ref<LoadingIndicatorState>({ elapsedTime: 0, status: 'idle' });
  const activeEditor = ref<string | null>(null);
  const lastMessageId = ref<string | null>(null);
  const settingsHash = ref<string | null>(null);
  const settings = ref<RemoteSettingDefinition[]>([]);

  // Active Requests (Confirmation Queue)
  const activeRequest = ref<ConsentRequest | null>(null);

  // Chat Data
  const streamOutput = ref('');
  const currentThought = ref<ThoughtInfo | null>(null);
  const userMessages = ref<string[]>([]);
  const messages = ref<RemoteMessageRecord[]>([]);

  // System Toasts
  interface SystemToast {
    id: string;
    message: string;
    finished: boolean;
    timestamp: number;
  }
  const activeToasts = ref<SystemToast[]>([]);

  function setProxyMode(sessionIdVal: string, sender: (payload: Record<string, unknown>) => void) {
    console.log('[GeminiStore] Setting proxy mode for session:', sessionIdVal);
    resetChatState(true); 
    proxyMode.value = true;
    activeSessionId.value = sessionIdVal;
    proxySender = sender;
    isConnected.value = true;
    isAuthenticated.value = true;
    
    const allTopics: AllTopics[] = [
      'state:session:status', 
      'state:session:id', 
      'state:session:model', 
      'state:system:quota',
      'state:system:memory',
      'state:system:loading_indicator',
      'state:system:ramUsage',
      'state:system:agents',

      'state:system:mcp:servers',
      'state:session:editor',
      'state:chat:last_message_id',
      'state:confirm:active:request',
      'event:chat:stream',
      'event:chat:thought',
      'event:chat:user_message',
      'event:confirm:active:resolved',
      'event:system:feedback',
      'event:system:transient_message',
      'event:system:retry',
      'event:system:hook:start',
      'event:system:hook:end',
      'event:system:mcp:progress'
    ];
    
    subscribe(allTopics);
    
    // Request history immediately to catch system notifications
    setTimeout(() => {
      loadHistory();
    }, 100);
  }

  function loadHistory() {
    sendAction('chat:get_history_page', { 
      correlationId: `init-history-${Date.now()}`, 
      limit: 50, 
      offset: 0, 
      sort: 'desc' 
    });
  }

  function resetChatState(keepConnection = false) {
    messages.value = [];
    streamOutput.value = '';
    currentThought.value = null;
    userMessages.value = [];
    activeToasts.value = [];
    status.value = 'idle';
    if (!keepConnection) isConnected.value = false;
  }

  function formatBytes(bytes: number) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  function handleMessage(msg: RemoteMessage) {
    if (msg.topic) {
      console.log(`[GeminiStore] RECV topic: ${msg.topic}`, msg.payload);
    } else {
      console.log(`[GeminiStore] RECV type: ${msg.type}`, msg);
    }

    if (msg.type === 'auth_ok') {
      isAuthenticated.value = true;
      if (msg.sessionId) geminiSessionId.value = msg.sessionId;
      return;
    }

    if (msg.type === 'response:settings:list') {
      const p = msg as unknown as SettingsListResponse;
      settings.value = p.settings;
      return;
    }

    if (msg.type === 'response:chat:history') {
      const p = msg as unknown as ChatHistoryResponse;
      // We reverse to show oldest first in the chat list (scrolling down to newest)
      messages.value = p.messages.reverse();
      return;
    }

    if (msg.type === 'response:settings:set') {
      return;
    }

    if (!msg.topic) return;
    const payload = msg.payload;

    switch (msg.topic) {
      case 'state:session:status':
        if (payload) {
            status.value = (payload as SessionStatusState).status;
            if (status.value === 'idle') currentThought.value = null;
        }
        break;
      case 'state:system:quota':
        if (payload) quota.value = payload as QuotaState;
        break;
      case 'state:system:memory':
        if (payload) memory.value = payload as MemoryState;
        break;
      case 'state:system:loading_indicator':
        if (payload) loadingIndicator.value = payload as LoadingIndicatorState;
        break;
      case 'state:session:model':
        if (payload) activeModel.value = (payload as ModelState).model;
        break;
      case 'state:session:id':
        if (payload) geminiSessionId.value = (payload as SessionIdState).id;
        break;
      case 'state:system:ramUsage':
        if (payload) {
          const p = payload as RamUsageState;
          ramUsage.value = formatBytes(p.rss);
        }
        break;
      case 'state:system:agents':
        if (payload) agents.value = (payload as AgentsState).agents || [];
        break;
      case 'state:system:mcp:servers':
        if (payload) mcpServers.value = (payload as McpServersState).servers || [];
        break;
      case 'state:session:editor':
        if (payload) activeEditor.value = (payload as EditorState).editor || null;
        break;
      case 'state:confirm:active:request':
        activeRequest.value = payload ? (payload as ConsentRequest) : null;
        break;
      case 'state:chat:last_message_id':
        if (payload) lastMessageId.value = (payload as LastMessageIdState).id;
        break;
      case 'state:session:settings:hash':
        if (payload) settingsHash.value = (payload as SettingsHashState).hash;
        break;
      
      case 'event:chat:stream':
        if (payload) {
            const p = payload as ChatStreamEvent;
            streamOutput.value += p.chunk;
            
            // Real-time update for messages array
            let lastMsg = messages.value[messages.value.length - 1];
            if (!lastMsg || lastMsg.type !== 'gemini') {
              lastMsg = {
                id: `gemini-${Date.now()}`,
                timestamp: new Date().toISOString(),
                type: 'gemini',
                content: [{ text: '' }]
              };
              messages.value.push(lastMsg);
            }
            if (lastMsg.content[0]) {
              lastMsg.content[0].text = (lastMsg.content[0].text || '') + p.chunk;
            }

            currentThought.value = null;
        }
        break;
      case 'event:chat:thought':
        if (payload) {
            currentThought.value = payload as ThoughtInfo;
        }
        break;
      case 'event:chat:user_message':
        if (payload) {
            const p = payload as { text: string };
            if (p.text) {
              userMessages.value.push(p.text);
              // Check if already added (to prevent duplicates if local echo is implemented elsewhere)
              const alreadyExists = messages.value.some(m => m.type === 'user' && m.content[0]?.text === p.text && (Date.now() - new Date(m.timestamp).getTime() < 5000));
              if (!alreadyExists) {
                messages.value.push({
                  id: `u-${Date.now()}`,
                  timestamp: new Date().toISOString(),
                  type: 'user',
                  content: [{ text: p.text }]
                });
              }
            }
        }
        break;
      case 'event:confirm:active:resolved':
        if (payload) {
          const p = payload as { correlationId: string };
          if (activeRequest.value?.correlationId === p.correlationId) {
            activeRequest.value = null;
          }
        }
        break;
      case 'event:system:feedback':
        if (payload) {
            const p = payload as { message: string, severity?: string };
            const id = `fb-${Date.now()}`;
            activeToasts.value.push({ id, message: p.message, finished: true, timestamp: Date.now() });
            setTimeout(() => { activeToasts.value = activeToasts.value.filter(t => t.id !== id); }, 5000);
        }
        break;
      case 'event:system:transient_message':
        if (payload) {
            const p = payload as { message: string, type: string };
            const id = `tm-${Date.now()}`;
            activeToasts.value.push({ id, message: p.message, finished: true, timestamp: Date.now() });
            setTimeout(() => { activeToasts.value = activeToasts.value.filter(t => t.id !== id); }, 5000);
        }
        break;
      case 'event:system:retry':
        if (payload) {
            const p = payload as { attempt: number, maxAttempts: number, model?: string };
            const id = `retry-${Date.now()}`;
            const modelText = p.model ? ` (${p.model})` : '';
            const message = `Повторна спроба ${p.attempt}/${p.maxAttempts}${modelText}...`;
            activeToasts.value.push({ 
                id, 
                message, 
                finished: true, 
                timestamp: Date.now() 
            });
            setTimeout(() => { activeToasts.value = activeToasts.value.filter(t => t.id !== id); }, 5000);
        }
        break;
      case 'event:system:hook:start':
        if (payload) {
            const p = payload as { hookName: string };
            activeToasts.value.push({ id: `hook-${p.hookName}`, message: `Виконується: ${p.hookName}...`, finished: false, timestamp: Date.now() });
        }
        break;
      case 'event:system:hook:end':
        if (payload) {
            const p = payload as { hookName: string, success: boolean };
            const message = `${p.success ? 'Завершено' : 'Помилка'}: ${p.hookName}`;
            const t = activeToasts.value.find(t => t.id === `hook-${p.hookName}`);
            if (t) {
              t.finished = true;
              t.message = message;
              setTimeout(() => { activeToasts.value = activeToasts.value.filter(toast => toast.id !== t.id); }, 2000);
            }
        }
        break;
      case 'event:system:mcp:progress':
        if (payload) {
            const p = payload as { server: string, message: string };
            const id = `mcp-${p.server}`;
            const text = `${p.server}: ${p.message}`;

            let t = activeToasts.value.find(t => t.id === id);
            if (!t) {
              t = { id, message: text, finished: false, timestamp: Date.now() };
              activeToasts.value.push(t);
            } else {
              t.message = text;
            }
            setTimeout(() => { activeToasts.value = activeToasts.value.filter(toast => toast.id !== id); }, 10000);
        }
        break;
    }
  }

  function sendAction(action: string, payload: Record<string, unknown> = {}) {
    if (proxyMode.value && proxySender) {
      proxySender({ action, ...payload });
    }
  }

  function subscribe(topics: AllTopics[]) {
    sendAction('system:subscribe', { topics });
  }

  function unsubscribe(topics: AllTopics[]) {
    sendAction('system:unsubscribe', { topics });
  }

  function loadSettings() {
    sendAction('settings:get', { correlationId: `settings-${Date.now()}` });
  }

  function updateSetting(id: string, value: unknown, hash?: string) {
    sendAction('settings:set', { 
      correlationId: `set-${Date.now()}`, 
      id, 
      value, 
      settingsHash: hash 
    });
  }

  function clearSettings() {
    settings.value = [];
    settingsHash.value = null;
  }

  function sendMessage(text: string) {
    streamOutput.value = '';
    currentThought.value = null;
    sendAction('chat:send', { text });
  }

  function replyToRequest(correlationId: string, confirmed: boolean) {
    sendAction('confirm:reply', { correlationId, confirmed });
  }

  return {
    isConnected,
    isAuthenticated,
    status,
    quota,
    memory,
    ramUsage,
    loadingIndicator,
    agents,
    mcpServers,
    activeEditor,
    activeModel,
    activeRequest,
    streamOutput,
    currentThought,
    userMessages,
    messages,
    activeToasts,
    geminiSessionId,
    settings,
    settingsHash,
    handleMessage,
    setProxyMode,
    sendMessage,
    replyToRequest,
    subscribe,
    unsubscribe,
    loadSettings,
    updateSetting,
    clearSettings,
    resetChatState,
    loadHistory
  };
});
