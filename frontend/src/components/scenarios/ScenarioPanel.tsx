'use client';
import { useState, useEffect, useCallback } from 'react';
import { usePlan } from '../../context/PlanContext';
import { Scenario } from '../../lib/types';
import { saveScenario, loadScenarios, deleteScenario } from '../../lib/storage';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

interface Props {
  compareScenarioId: string | null;
  onCompareChange: (id: string | null) => void;
  onScenariosChange?: () => void;
}

export default function ScenarioPanel({ compareScenarioId, onCompareChange, onScenariosChange }: Props) {
  const { plan, updatePlan } = usePlan();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [saveName, setSaveName] = useState('');
  const [expanded, setExpanded] = useState(false);

  const refresh = useCallback(() => {
    setScenarios(loadScenarios());
    onScenariosChange?.();
  }, [onScenariosChange]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleSave = () => {
    if (!saveName.trim()) return;
    const scenario: Scenario = {
      id: generateId(),
      name: saveName.trim(),
      createdAt: Date.now(),
      plan: JSON.parse(JSON.stringify(plan)),
    };
    saveScenario(scenario);
    setSaveName('');
    refresh();
  };

  const handleLoad = (scenario: Scenario) => {
    updatePlan(scenario.plan);
  };

  const handleDelete = (id: string) => {
    deleteScenario(id);
    if (compareScenarioId === id) onCompareChange(null);
    refresh();
  };

  const handleCompare = (id: string) => {
    onCompareChange(compareScenarioId === id ? null : id);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <h2 className="text-lg font-bold text-gray-700">
          💾 シナリオ管理
          {scenarios.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({scenarios.length}件保存済み)
            </span>
          )}
        </h2>
        <span className="text-gray-400 text-sm">{expanded ? '▲ 閉じる' : '▼ 開く'}</span>
      </button>

      {expanded && (
        <div className="mt-4 space-y-4">
          {/* Save current plan */}
          <div>
            <p className="text-sm text-gray-600 mb-2">現在のプランをシナリオとして保存:</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="シナリオ名を入力（例: 転職後プラン）"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <button
                onClick={handleSave}
                disabled={!saveName.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-40 transition whitespace-nowrap"
              >
                保存
              </button>
            </div>
          </div>

          {/* Scenario list */}
          {scenarios.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-3 bg-gray-50 rounded-xl">
              保存済みシナリオはありません
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">保存済みシナリオ:</p>
              {scenarios.map((sc) => (
                <div
                  key={sc.id}
                  className={`flex items-center justify-between rounded-xl p-3 border transition ${
                    compareScenarioId === sc.id
                      ? 'bg-amber-50 border-amber-300'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="min-w-0 mr-2">
                    <p className="font-medium text-gray-800 truncate">{sc.name}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(sc.createdAt).toLocaleString('ja-JP', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleCompare(sc.id)}
                      className={`text-xs px-2 py-1 rounded border transition ${
                        compareScenarioId === sc.id
                          ? 'bg-amber-500 text-white border-amber-500'
                          : 'text-amber-600 border-amber-300 hover:bg-amber-50'
                      }`}
                    >
                      {compareScenarioId === sc.id ? '比較中' : '比較'}
                    </button>
                    <button
                      onClick={() => handleLoad(sc)}
                      className="text-xs px-2 py-1 text-indigo-600 border border-indigo-200 hover:bg-indigo-50 rounded transition"
                    >
                      読み込む
                    </button>
                    <button
                      onClick={() => handleDelete(sc.id)}
                      className="text-xs px-2 py-1 text-red-500 hover:bg-red-50 rounded transition"
                    >
                      削除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-gray-400">
            💡 「比較」ボタンを押すと、現在のプランと選択したシナリオの資産推移を比較表示します。
          </p>
        </div>
      )}
    </div>
  );
}
