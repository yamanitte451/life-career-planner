'use client';
import { useState } from 'react';
import { usePlan } from '../../context/PlanContext';
import { LifeEvent, LifeEventCategory } from '../../lib/types';
import NumericInput from './NumericInput';

const CATEGORY_OPTIONS: { value: LifeEventCategory; label: string; icon: string }[] = [
  { value: 'marriage', label: '結婚', icon: '💒' },
  { value: 'childbirth', label: '出産', icon: '👶' },
  { value: 'childcare', label: '保育・幼稚園', icon: '🏫' },
  { value: 'education', label: '教育', icon: '🎓' },
  { value: 'housing', label: '住宅購入', icon: '🏠' },
  { value: 'car', label: '車購入・買替', icon: '🚗' },
  { value: 'career', label: '転職・昇進', icon: '💼' },
  { value: 'retirement', label: '退職', icon: '🌅' },
  { value: 'other', label: 'その他', icon: '📌' },
];

const PERSON_OPTIONS = [
  { value: 'self' as const, label: '本人' },
  { value: 'spouse' as const, label: '配偶者' },
  { value: 'household' as const, label: '世帯全体' },
];

const EVENT_TEMPLATES: Record<string, Partial<LifeEvent>> = {
  childbirth: { name: '出産', oneTimeCost: 500000, annualCostChange: 360000, durationYears: 3, person: 'household' },
  housing: { name: '住宅購入', oneTimeCost: 5000000, annualCostChange: 180000, durationYears: 35, person: 'household' },
  car: { name: '車購入', oneTimeCost: 3000000, annualCostChange: 300000, durationYears: 7, person: 'household' },
  career: { name: '転職', oneTimeCost: 0, annualIncomeChange: 800000, durationYears: 0, person: 'self' },
  retirement: { name: '退職', oneTimeCost: 0, annualIncomeChange: -3000000, durationYears: 0, person: 'self' },
  marriage: { name: '結婚', oneTimeCost: 3000000, annualCostChange: 0, durationYears: 0, person: 'household' },
  education: { name: '大学進学', oneTimeCost: 500000, annualCostChange: 1200000, durationYears: 4, person: 'household' },
};

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function createEmptyEvent(): LifeEvent {
  return {
    id: generateId(),
    name: '',
    category: 'other',
    yearOffset: 1,
    person: 'household',
    oneTimeCost: 0,
    annualCostChange: 0,
    annualIncomeChange: 0,
    durationYears: 0,
    memo: '',
  };
}

export default function LifeEventForm() {
  const { plan, updatePlan } = usePlan();
  const events = plan.lifeEvents ?? [];
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<LifeEvent>(createEmptyEvent());

  const saveEvent = () => {
    if (!draft.name.trim()) return;
    const existing = events.findIndex((e) => e.id === draft.id);
    let updated: LifeEvent[];
    if (existing >= 0) {
      updated = events.map((e) => (e.id === draft.id ? draft : e));
    } else {
      updated = [...events, draft];
    }
    updatePlan({ lifeEvents: updated });
    setDraft(createEmptyEvent());
    setEditingId(null);
  };

  const deleteEvent = (id: string) => {
    updatePlan({ lifeEvents: events.filter((e) => e.id !== id) });
    if (editingId === id) {
      setDraft(createEmptyEvent());
      setEditingId(null);
    }
  };

  const startEdit = (event: LifeEvent) => {
    setDraft({ ...event });
    setEditingId(event.id);
  };

  const cancelEdit = () => {
    setDraft(createEmptyEvent());
    setEditingId(null);
  };

  const applyTemplate = (category: LifeEventCategory) => {
    const template = EVENT_TEMPLATES[category];
    const base = createEmptyEvent();
    setDraft({
      ...base,
      category,
      ...(template ?? {}),
      id: draft.id,
      yearOffset: draft.yearOffset,
    });
  };

  const selfAge = plan.household.self.age;

  return (
    <div className="space-y-6">
      {/* Registered events list */}
      {events.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-700">登録済みイベント</h3>
          {events.map((event) => {
            const catInfo = CATEGORY_OPTIONS.find((c) => c.value === event.category);
            return (
              <div
                key={event.id}
                className={`flex items-center justify-between bg-white border rounded-xl p-3 ${
                  editingId === event.id ? 'border-indigo-400 ring-1 ring-indigo-200' : 'border-gray-200'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span>{catInfo?.icon ?? '📌'}</span>
                    <span className="font-medium text-gray-800 truncate">{event.name}</span>
                    <span className="text-xs text-gray-400">
                      {event.yearOffset}年後（{selfAge + event.yearOffset}歳）
                    </span>
                  </div>
                  <div className="flex gap-3 text-xs text-gray-500 mt-1">
                    {event.oneTimeCost > 0 && <span>一時費用: {Math.round(event.oneTimeCost / 10000).toLocaleString()}万円</span>}
                    {event.annualCostChange !== 0 && (
                      <span>年間支出変動: {event.annualCostChange > 0 ? '+' : ''}{Math.round(event.annualCostChange / 10000).toLocaleString()}万円</span>
                    )}
                    {event.annualIncomeChange !== 0 && (
                      <span>年間収入変動: {event.annualIncomeChange > 0 ? '+' : ''}{Math.round(event.annualIncomeChange / 10000).toLocaleString()}万円</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 ml-2">
                  <button onClick={() => startEdit(event)} className="text-xs px-2 py-1 text-indigo-600 hover:bg-indigo-50 rounded">
                    編集
                  </button>
                  <button onClick={() => deleteEvent(event.id)} className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded">
                    削除
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Event editor */}
      <div className="bg-indigo-50 rounded-xl p-4">
        <h3 className="font-semibold text-indigo-800 mb-4">
          {editingId ? '📝 イベント編集' : '➕ 新しいライフイベントを追加'}
        </h3>

        {/* Category selector */}
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-2">カテゴリ</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map((cat) => (
              <button
                key={cat.value}
                onClick={() => applyTemplate(cat.value)}
                className={`px-3 py-1.5 rounded-full text-sm transition ${
                  draft.category === cat.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Event name */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">イベント名</label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="例: 第一子出産"
            />
          </div>

          {/* Year offset */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              何年後（{draft.yearOffset}年後 = {selfAge + draft.yearOffset}歳時）
            </label>
            <NumericInput
              className="w-full border rounded-lg px-3 py-2"
              value={draft.yearOffset}
              onChange={(value) => setDraft({ ...draft, yearOffset: value })}
            />
          </div>

          {/* Person */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">対象者</label>
            <select
              className="w-full border rounded-lg px-3 py-2"
              value={draft.person}
              onChange={(e) => setDraft({ ...draft, person: e.target.value as LifeEvent['person'] })}
            >
              {PERSON_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">継続年数（0 = 恒久的）</label>
            <div className="relative">
              <NumericInput
                className="w-full border rounded-lg px-3 py-2 pr-10"
                value={draft.durationYears}
                onChange={(value) => setDraft({ ...draft, durationYears: value })}
              />
              <span className="absolute right-3 top-2 text-gray-400 text-sm">年</span>
            </div>
          </div>

          {/* One-time cost */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">一時費用</label>
            <div className="relative">
              <NumericInput
                className="w-full border rounded-lg px-3 py-2 pr-10"
                value={draft.oneTimeCost}
                onChange={(value) => setDraft({ ...draft, oneTimeCost: value })}
              />
              <span className="absolute right-3 top-2 text-gray-400 text-sm">円</span>
            </div>
          </div>

          {/* Annual cost change */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">年間支出変動額</label>
            <div className="relative">
              <input
                type="number"
                className="w-full border rounded-lg px-3 py-2 pr-10"
                value={draft.annualCostChange}
                onChange={(e) => setDraft({ ...draft, annualCostChange: Number(e.target.value) || 0 })}
              />
              <span className="absolute right-3 top-2 text-gray-400 text-sm">円/年</span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">正の値=支出増、負の値=支出減</p>
          </div>

          {/* Annual income change */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">年間収入変動額</label>
            <div className="relative">
              <input
                type="number"
                className="w-full border rounded-lg px-3 py-2 pr-10"
                value={draft.annualIncomeChange}
                onChange={(e) => setDraft({ ...draft, annualIncomeChange: Number(e.target.value) || 0 })}
              />
              <span className="absolute right-3 top-2 text-gray-400 text-sm">円/年</span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">正の値=収入増、負の値=収入減</p>
          </div>

          {/* Memo */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">メモ</label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2"
              value={draft.memo}
              onChange={(e) => setDraft({ ...draft, memo: e.target.value })}
              placeholder="自由メモ"
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={saveEvent}
            disabled={!draft.name.trim()}
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-40 transition"
          >
            {editingId ? '更新' : '追加'}
          </button>
          {editingId && (
            <button
              onClick={cancelEdit}
              className="px-5 py-2 bg-white border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition"
            >
              キャンセル
            </button>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
        💡 カテゴリを選ぶとテンプレート値が自動入力されます。金額は後から自由に変更できます。
      </div>

      {events.length === 0 && (
        <div className="text-center text-gray-400 text-sm py-4">
          まだイベントが登録されていません。上のフォームから追加してください。
        </div>
      )}
    </div>
  );
}
