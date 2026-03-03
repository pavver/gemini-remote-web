/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export enum OrchestratorAction {
  AUTH = 'AUTH',
  LIST_SESSIONS = 'LIST_SESSIONS',
  START_SESSION = 'START_SESSION',
  STOP_SESSION = 'STOP_SESSION',
  CONNECT_SESSION = 'CONNECT_SESSION',
  DISCONNECT_SESSION = 'DISCONNECT_SESSION',
  CLI_COMMAND = 'CLI_COMMAND',
  EXECUTE_COMMAND = 'EXECUTE_COMMAND',
  CLEAR_HISTORY = 'CLEAR_HISTORY',
  RESET_SESSION = 'RESET_SESSION',
}

export enum OrchestratorResponse {
  AUTH_OK = 'AUTH_OK',
  AUTH_FAILED = 'AUTH_FAILED',
  SESSION_LIST = 'SESSION_LIST',
  SESSION_STARTED = 'SESSION_STARTED',
  SESSION_STOPPED = 'SESSION_STOPPED',
  PROXY_MESSAGE = 'PROXY_MESSAGE',
  ERROR = 'ERROR',
}

export interface SessionInfo {
  id: string;
  dir: string;
}

export interface OrchestratorMessage {
  type: OrchestratorResponse;
  sessions?: SessionInfo[];
  session_id?: string;
  dir?: string;
  message?: CLIOutgoingMessage;
  error?: string;
}

// --- CLI Level ---

export enum CLIMessageType {
  SESSION_INIT = 'SESSION_INIT',
  HISTORY_UPDATE = 'HISTORY_UPDATE',
  THOUGHT_STREAM = 'THOUGHT_STREAM',
  CONFIRMATION_REQUEST = 'CONFIRMATION_REQUEST',
  STREAMING_STATE = 'STREAMING_STATE',
  SEND_PROMPT = 'SEND_PROMPT',
  CONFIRMATION_RESPONSE = 'CONFIRMATION_RESPONSE',
  STOP_GENERATION = 'STOP_GENERATION',
  SHELL_INPUT = 'SHELL_INPUT',
  SHELL_OUTPUT = 'SHELL_OUTPUT',
  STATUS_UPDATE = 'STATUS_UPDATE',
  TOAST = 'TOAST',
  SEARCH_REQUEST = 'SEARCH_REQUEST',
  SEARCH_RESPONSE = 'SEARCH_RESPONSE',
  AUTH_STATE_UPDATE = 'AUTH_STATE_UPDATE',
  RESIZE_TERMINAL = 'RESIZE_TERMINAL',
  SESSION_STATE_REQUEST = 'SESSION_STATE_REQUEST',
  HISTORY_REQUEST = 'HISTORY_REQUEST',
  HISTORY_RESPONSE = 'HISTORY_RESPONSE',
  OPEN_DIFF = 'OPEN_DIFF',
  DIFF_RESPONSE = 'DIFF_RESPONSE',
  EXECUTE_COMMAND = 'EXECUTE_COMMAND',
  CLEAR_HISTORY = 'CLEAR_HISTORY',
  RESET_SESSION = 'RESET_SESSION',
  SUBSCRIBE = 'SUBSCRIBE',
  UNSUBSCRIBE = 'UNSUBSCRIBE',
}

export interface AnsiToken {
  text: string;
  fg: string;
  bg: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  inverse: boolean;
}

export type AnsiOutput = AnsiToken[][];

export interface HistoryItem {
  id: number;
  type: string;
  text?: string;
  role?: 'user' | 'model' | 'system';
  thought?: { summary: string };
  model?: string;
  tools?: RemoteToolCall[];
}

export interface RemoteToolCall {
  callId: string;
  name: string;
  args: string;
  status: string;
  description?: string;
  result?: string;
}

export interface ConfirmationOption {
  label: string;
  value: string;
}

export interface ConfirmationRequest {
  id: number;
  prompt: string;
  type: string;
  options: ConfirmationOption[];
}

export interface SystemStatus {
  model: string | undefined;
  ramUsage: string;
  contextTokens: number;
  geminiMdFileCount: number;
  skillsCount: number;
  mcpServers: Array<{ name: string; status: string }>;
  cwd: string;
  gitBranch: string | null;
  platform: string;
  activePtyId: number | null;
}

export interface DiffRequest {
  filePath: string;
  newContent: string;
}

export interface CLIOutgoingMessage {
  type: CLIMessageType;
  payload: any;
}

export interface CLIIncomingMessage {
  type: CLIMessageType;
  payload: any;
}
