import { AIChatConfig, ChatSession } from './types';

const CONFIG_KEY = 'ai_chat_config';
const SESSIONS_KEY = 'ai_chat_sessions';

function isServer(): boolean {
  return typeof window === 'undefined';
}

export function saveChatConfig(config: AIChatConfig): void {
  if (isServer()) return;
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch {
    // QuotaExceededError etc. — silently fail
  }
}

export function loadChatConfig(): AIChatConfig | null {
  if (isServer()) return null;
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
  if (isServer()) return;
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

function isValidSession(v: unknown): v is ChatSession {
  return (
    typeof v === 'object' && v !== null &&
    'id' in v && typeof (v as ChatSession).id === 'string' &&
    'title' in v && typeof (v as ChatSession).title === 'string' &&
    'messages' in v && Array.isArray((v as ChatSession).messages)
  );
}

export function loadChatSessions(): ChatSession[] {
  if (isServer()) return [];
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidSession);
  } catch {
    return [];
  }
}

export function deleteChatSession(id: string): void {
  if (isServer()) return;
  const sessions = loadChatSessions().filter((s) => s.id !== id);
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch {
    // QuotaExceededError etc. — silently fail
  }
}
