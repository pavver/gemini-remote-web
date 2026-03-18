/**
 * Gemini Remote API v1.5 Protocol Types
 */

export type AgentStatus = 'idle' | 'busy' | 'thinking' | 'generating';

export interface QuotaState {
  remaining?: number;
  limit?: number;
  resetTime?: string;
}

export interface MemoryState {
  fileCount: number;
}

export interface AgentInfo {
  name: string;
  displayName?: string;
  description: string;
  kind: 'local' | 'remote';
}

export interface AgentsState {
  agents: AgentInfo[];
}

export interface SettingsHashState {
  hash: string;
}

export interface RemoteSettingDefinition {
  id: string;
  label: string;
  description?: string;
  type: 'boolean' | 'string' | 'number' | 'enum' | 'array' | 'object';
  value: unknown;
  default: unknown;
  isChanged: boolean;
  options?: Array<{ label: string; value: unknown }>;
  requiresRestart: boolean;
  category: string;
}

export interface SettingsListResponse {
  type: 'response:settings:list';
  correlationId: string;
  settings: RemoteSettingDefinition[];
}

export interface SettingsSetResponse {
  type: 'response:settings:set';
  correlationId: string;
  success: boolean;
  settingsHash?: string;
  error?: string;
}

export interface ModelState {
  model: string;
}

export interface SessionIdState {
  id: string;
}

export interface EditorState {
  editor?: string;
}

export interface SessionStatusState {
  status: AgentStatus;
}

export interface LastMessageIdState {
  id: string;
}

export interface LoadingPhraseState {
  phrase: string | null;
}

export interface LoadingElapsedState {
  elapsed: number;
}

export interface RamRssState {
  rss: number;
}

export interface RamHeapTotalState {
  heapTotal: number;
}

export interface RamHeapUsedState {
  heapUsed: number;
}

export interface RamUsageState {
  rss: number;
  heapTotal: number;
  heapUsed: number;
}

export interface ChatStreamEvent {
  chunk: string;
  isStderr: boolean;
}

export interface ConsentRequest {
  correlationId: string;
  prompt: string;
}

export interface ThoughtInfo {
  subject: string;
  summary: string;
  timestamp: string;
}

export interface McpServersState {
  servers: string[];
}

export interface RemotePart {
  text?: string;
  functionCall?: { name: string; args: Record<string, unknown> };
  functionResponse?: { name: string; response: Record<string, unknown> };
  // and other parts if needed
}

export interface RemoteMessageRecord {
  id: string;
  timestamp: string;
  type: 'user' | 'gemini' | 'info' | 'error' | 'warning';
  content: RemotePart[];
  model?: string;
}

export interface ChatHistoryResponse {
  type: 'response:chat:history';
  correlationId: string;
  total: number;
  messages: RemoteMessageRecord[];
}

// Orchestrator Specific Types
export type OrchestratorAction = 
  | { action: 'AUTH', login: string, password: string }
  | { action: 'LIST_SESSIONS' }
  | { action: 'START_SESSION', dir: string }
  | { action: 'STOP_SESSION', session_id: string }
  | { action: 'CONNECT_SESSION', session_id: string }
  | { action: 'DISCONNECT_SESSION', session_id: string }
  | { action: 'CLI_COMMAND', session_id: string, payload: Record<string, unknown> };

export interface SessionInfo {
  id: string;
  dir: string;
}

export type OrchestratorResponse = 
  | { type: 'AUTH_OK' }
  | { type: 'AUTH_FAILED', message: string }
  | { type: 'SESSION_LIST', sessions: SessionInfo[] }
  | { type: 'SESSION_STARTED', session_id: string, dir: string }
  | { type: 'SESSION_STOPPED', session_id: string }
  | { type: 'SESSION_CONNECTED', session_id: string }
  | { type: 'ERROR', message: string }
  | { type: 'PROXY_MESSAGE', session_id: string, message: unknown }
  | { type: 'PONG' };

export type AllTopics = 
  | 'state:system:quota'
  | 'state:system:memory'
  | 'state:system:loading_phrase'
  | 'state:system:loading_elapsed'
  | 'state:system:mcp:servers'
  | 'state:system:agents'
  | 'state:system:ram:rss'
  | 'state:system:ram:heap_total'
  | 'state:system:ram:heap_used'
  | 'state:session:status'
  | 'state:session:model'
  | 'state:session:id'
  | 'state:session:settings:hash'
  | 'state:session:editor'
  | 'state:chat:last_message_id'
  | 'state:confirm:active:request'
  | 'event:chat:stream'
  | 'event:chat:thought'
  | 'event:chat:user_message'
  | 'event:system:console'
  | 'event:system:feedback'
  | 'event:system:transient_message'
  | 'event:system:hook:start'
  | 'event:system:hook:end'
  | 'event:system:mcp:progress'
  | 'event:system:retry'
  | 'event:system:agents:refresh'
  | 'event:confirm:active:resolved'
  | 'event:bus:tool-calls-update'
  | 'event:bus:ask-user-request'
  | 'event:bus:ask-user-response'
  | 'event:shell:data';

export interface RemoteMessage {
  topic?: string;
  type?: string;
  payload?: unknown;
  sessionId?: string;
  version?: number;
}
