'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { usePlan } from '../../context/PlanContext';
import { AIChatConfig, ChatMessage as ChatMessageType, ChatSession } from '../../lib/types';
import { runSimulation } from '../../lib/simulation';
import { buildSystemPrompt } from '../../lib/buildChatContext';
import { sendMessageStream } from '../../lib/aiClient';
import { loadChatConfig, saveChatSession, loadChatSessions } from '../../lib/chatStorage';
import { generateId } from '../../lib/id';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import AISettingsModal from './AISettingsModal';

export default function ChatPanel() {
  const { plan } = usePlan();
  const [config, setConfig] = useState<AIChatConfig | null>(null);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [sessionId] = useState(() => generateId());
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const saved = loadChatConfig();
    setConfig(saved);
    setSessions(loadChatSessions());
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const saveCurrentSession = useCallback((msgs: ChatMessageType[]) => {
    if (msgs.length === 0) return;
    const firstUserMsg = msgs.find((m) => m.role === 'user');
    const title = firstUserMsg?.content.slice(0, 30) || 'チャット';
    const session: ChatSession = {
      id: sessionId,
      title,
      messages: msgs,
      createdAt: Date.now(),
    };
    saveChatSession(session);
    setSessions(loadChatSessions());
  }, [sessionId]);

  const handleSend = async (text: string) => {
    if (!config?.apiKey) {
      setShowSettings(true);
      return;
    }

    setError(null);
    const userMsg: ChatMessageType = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsStreaming(true);
    setStreamingContent('');

    const simulation = runSimulation(plan);
    const systemPrompt = buildSystemPrompt(plan, simulation);

    const controller = new AbortController();
    abortRef.current = controller;

    let fullContent = '';

    await sendMessageStream(
      config,
      updatedMessages.filter((m) => m.role !== 'system'),
      systemPrompt,
      {
        onChunk: (chunk) => {
          fullContent += chunk;
          setStreamingContent(fullContent);
        },
        onDone: () => {
          const assistantMsg: ChatMessageType = {
            id: generateId(),
            role: 'assistant',
            content: fullContent,
            timestamp: Date.now(),
          };
          const finalMessages = [...updatedMessages, assistantMsg];
          setMessages(finalMessages);
          setStreamingContent('');
          setIsStreaming(false);
          abortRef.current = null;
          saveCurrentSession(finalMessages);
        },
        onError: (err) => {
          setError(err.message);
          setIsStreaming(false);
          setStreamingContent('');
          abortRef.current = null;
        },
      },
      controller.signal
    );
  };

  const handleStop = () => {
    abortRef.current?.abort();
    if (streamingContent) {
      const assistantMsg: ChatMessageType = {
        id: generateId(),
        role: 'assistant',
        content: streamingContent,
        timestamp: Date.now(),
      };
      const finalMessages = [...messages, assistantMsg];
      setMessages(finalMessages);
      saveCurrentSession(finalMessages);
    }
    setStreamingContent('');
    setIsStreaming(false);
  };

  const handleLoadSession = (session: ChatSession) => {
    setMessages(session.messages);
  };

  const handleNewChat = () => {
    setMessages([]);
    setStreamingContent('');
    setError(null);
  };

  const hasApiKey = !!config?.apiKey;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-gray-800">AI相談チャット</h2>
          {hasApiKey && (
            <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              接続済み
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleNewChat}
            className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
          >
            新規チャット
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
          >
            設定
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar: session history */}
        {sessions.length > 0 && (
          <div className="w-48 border-r border-gray-200 overflow-y-auto p-2 hidden lg:block">
            <p className="text-xs font-medium text-gray-400 mb-2 px-1">履歴</p>
            {sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => handleLoadSession(s)}
                className="block w-full text-left text-xs text-gray-600 hover:bg-gray-100 rounded px-2 py-1.5 truncate transition-colors"
              >
                {s.title}
              </button>
            ))}
          </div>
        )}

        {/* Main chat area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {!hasApiKey && messages.length === 0 && (
              <div className="text-center py-12">
                <p className="text-4xl mb-4">🤖</p>
                <p className="text-gray-600 font-medium mb-2">AIチャット相談を始めましょう</p>
                <p className="text-sm text-gray-400 mb-4">
                  あなたのライフプランデータをもとに、AIが個別のアドバイスを提供します。
                </p>
                <button
                  onClick={() => setShowSettings(true)}
                  className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  APIキーを設定する
                </button>
              </div>
            )}

            {hasApiKey && messages.length === 0 && !isStreaming && (
              <div className="text-center py-12">
                <p className="text-4xl mb-4">💬</p>
                <p className="text-gray-600 font-medium mb-2">相談を始めましょう</p>
                <p className="text-sm text-gray-400 mb-6">
                  現在のライフプランデータが自動的にAIに共有されます。
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {[
                    '子どもを持つ場合の家計余力を教えて',
                    '転職で年収を上げるにはどうすれば？',
                    '住宅購入と賃貸継続どちらが得？',
                    '老後資金は足りていますか？',
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSend(q)}
                      className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <ChatMessage key={msg.id} role={msg.role as 'user' | 'assistant'} content={msg.content} />
            ))}

            {streamingContent && (
              <ChatMessage role="assistant" content={streamingContent} />
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                <p className="font-medium mb-1">エラーが発生しました</p>
                <p className="text-xs">{error}</p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="border-t border-gray-200 px-4 py-3">
            {isStreaming ? (
              <div className="flex justify-center">
                <button
                  onClick={handleStop}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  生成を停止
                </button>
              </div>
            ) : (
              <ChatInput onSend={handleSend} disabled={!hasApiKey} />
            )}
          </div>
        </div>
      </div>

      <AISettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        onSave={setConfig}
      />
    </div>
  );
}
