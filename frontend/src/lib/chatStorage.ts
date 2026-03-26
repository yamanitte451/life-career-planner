import { AIChatConfig, ChatSession } from './types';

const CONFIG_KEY = 'ai_chat_config';
const SESSIONS_KEY = 'ai_chat_sessions';

export function saveChatConfig(config: AIChatConfig): void {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch {
    // QuotaExceededError etc. — silently fail
  }
}

export function loadChatConfig(): AIChatConfig | null {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || !parsed.apiKey) return null;
    return parsed as AIChatConfig;
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
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch {
    // QuotaExceededError etc. — silently fail
  }
}

export function loadChatSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function deleteChatSession(id: string): void {
  const sessions = loadChatSessions().filter((s) => s.id !== id);
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch {
    // QuotaExceededError etc. — silently fail
  }
}
