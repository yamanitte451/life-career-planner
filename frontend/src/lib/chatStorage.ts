import { AIChatConfig, ChatSession } from './types';

const CONFIG_KEY = 'ai_chat_config';
const SESSIONS_KEY = 'ai_chat_sessions';

export function saveChatConfig(config: AIChatConfig): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

export function loadChatConfig(): AIChatConfig | null {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AIChatConfig;
  } catch {
    return null;
  }
}

export function saveChatSession(session: ChatSession): void {
  const sessions = loadChatSessions();
  const idx = sessions.findIndex((s) => s.id === session.id);
  if (idx >= 0) {
    sessions[idx] = session;
  } else {
    sessions.unshift(session);
  }
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function loadChatSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ChatSession[];
  } catch {
    return [];
  }
}

export function deleteChatSession(id: string): void {
  const sessions = loadChatSessions().filter((s) => s.id !== id);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}
