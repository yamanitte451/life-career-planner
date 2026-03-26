import { saveChatConfig, loadChatConfig, saveChatSession, loadChatSessions, deleteChatSession } from '../lib/chatStorage';
import { AIChatConfig, ChatSession } from '../lib/types';
import { setupLocalStorageMock } from './test-utils';

describe('chatStorage', () => {
  beforeEach(() => {
    setupLocalStorageMock();
  });

  describe('AIChatConfig', () => {
    it('設定を保存・読み込みできる', () => {
      const config: AIChatConfig = { provider: 'openai', apiKey: 'sk-test', model: 'gpt-4o-mini' };
      saveChatConfig(config);
      expect(loadChatConfig()).toEqual(config);
    });

    it('未保存の場合nullを返す', () => {
      expect(loadChatConfig()).toBeNull();
    });
  });

  describe('ChatSession', () => {
    const session1: ChatSession = {
      id: 'sess1',
      title: 'テスト',
      messages: [{ id: 'm1', role: 'user', content: 'hello', timestamp: 1000 }],
      createdAt: 1000,
    };

    const session2: ChatSession = {
      id: 'sess2',
      title: 'テスト2',
      messages: [],
      createdAt: 2000,
    };

    it('セッションを保存・読み込みできる', () => {
      saveChatSession(session1);
      const loaded = loadChatSessions();
      expect(loaded).toHaveLength(1);
      expect(loaded[0].id).toBe('sess1');
    });

    it('同じIDのセッションを上書きする', () => {
      saveChatSession(session1);
      const updated = { ...session1, title: '更新' };
      saveChatSession(updated);
      const loaded = loadChatSessions();
      expect(loaded).toHaveLength(1);
      expect(loaded[0].title).toBe('更新');
    });

    it('複数セッションを管理できる', () => {
      saveChatSession(session1);
      saveChatSession(session2);
      expect(loadChatSessions()).toHaveLength(2);
    });

    it('セッションを削除できる', () => {
      saveChatSession(session1);
      saveChatSession(session2);
      deleteChatSession('sess1');
      const loaded = loadChatSessions();
      expect(loaded).toHaveLength(1);
      expect(loaded[0].id).toBe('sess2');
    });

    it('未保存の場合空配列を返す', () => {
      expect(loadChatSessions()).toEqual([]);
    });
  });
});
