'use client';
import { useState, useEffect } from 'react';
import { AIChatConfig } from '../../lib/types';
import { loadChatConfig, saveChatConfig } from '../../lib/chatStorage';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (config: AIChatConfig) => void;
}

const defaultConfig: AIChatConfig = {
  provider: 'openai',
  apiKey: '',
  model: 'gpt-4o-mini',
};

const models = [
  { value: 'gpt-4o-mini', label: 'GPT-4o mini（推奨・低コスト）' },
  { value: 'gpt-4o', label: 'GPT-4o（高精度）' },
  { value: 'gpt-4.1-mini', label: 'GPT-4.1 mini' },
  { value: 'gpt-4.1', label: 'GPT-4.1' },
];

export default function AISettingsModal({ open, onClose, onSave }: Props) {
  const [config, setConfig] = useState<AIChatConfig>(defaultConfig);

  useEffect(() => {
    if (open) {
      const saved = loadChatConfig();
      if (saved) setConfig(saved);
    }
  }, [open]);

  if (!open) return null;

  const handleSave = () => {
    saveChatConfig(config);
    onSave(config);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">AI設定</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              OpenAI API キー
            </label>
            <input
              type="password"
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              placeholder="sk-..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <p className="text-xs text-gray-400 mt-1">
              APIキーはブラウザのローカルストレージにのみ保存され、外部サーバーには送信されません。
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              モデル
            </label>
            <select
              value={config.model}
              onChange={(e) => setConfig({ ...config, model: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {models.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            disabled={!config.apiKey.trim()}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
