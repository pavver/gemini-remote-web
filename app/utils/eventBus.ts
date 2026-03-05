/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

type Handler<T = any> = (event: T) => void;

class GeminiEventBus {
  private handlers = new Map<string, Handler[]>();

  /**
   * Subscribe to an event
   */
  on<T = any>(type: string, handler: Handler<T>) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, []);
    }
    this.handlers.get(type)!.push(handler);
  }

  /**
   * Unsubscribe from an event
   */
  off<T = any>(type: string, handler: Handler<T>) {
    const handlers = this.handlers.get(type);
    if (handlers) {
      this.handlers.set(type, handlers.filter(h => h !== handler));
    }
  }

  /**
   * Emit an event
   */
  emit<T = any>(type: string, event: T) {
    // Log for debugging if needed
    // console.log(`[EventBus] Emit: ${type}`, event);
    
    this.handlers.get(type)?.forEach(handler => {
      try {
        handler(event);
      } catch (e) {
        console.error(`[EventBus] Error in handler for ${type}:`, e);
      }
    });
  }

  /**
   * Specialized methods for Terminal
   */
  emitTerminalOutput(ptyId: number, data: string) {
    this.emit(`terminal:output:${ptyId}`, data);
  }

  onTerminalOutput(ptyId: number, handler: Handler<string>) {
    this.on(`terminal:output:${ptyId}`, handler);
  }

  offTerminalOutput(ptyId: number, handler: Handler<string>) {
    this.off(`terminal:output:${ptyId}`, handler);
  }
}

export const eventBus = new GeminiEventBus();
