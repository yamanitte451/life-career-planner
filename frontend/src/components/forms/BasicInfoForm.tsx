'use client';
import { usePlan } from '../../context/PlanContext';
import { ChildInfo, Person, SchoolType, UniversityType } from '../../lib/types';
import { generateId } from '../../lib/id';
import NumericInput from './NumericInput';

const employmentTypes = ['正社員', '契約社員', '派遣', '自営業', 'パート', '無職'];
const workStyles = ['出社', 'ハイブリッド', '在宅'];
const familyCompositions = ['夫婦のみ', '子ども1人', '子ども2人', '子ども3人以上'];

const schoolTypeOptions: { value: SchoolType; label: string }[] = [
  { value: 'public', label: '公立' },
  { value: 'private', label: '私立' },
];

const universityTypeOptions: { value: UniversityType; label: string }[] = [
  { value: 'none', label: '進学しない' },
  { value: 'national', label: '国公立大学' },
  { value: 'private_arts', label: '私立大学（文系）' },
  { value: 'private_science', label: '私立大学（理系）' },
];

function PersonForm({ label, person, onChange }: { label: string; person: Person; onChange: (p: Person) => void }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <h3 className="font-semibold text-gray-700 mb-4">{label}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">名前</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={person.name}
            onChange={(e) => onChange({ ...person, name: e.target.value })}
            placeholder="例: 田中 太郎"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">年齢</label>
          <NumericInput
            className="w-full border rounded-lg px-3 py-2"
            value={person.age}
            onChange={(age) => onChange({ ...person, age })}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">雇用形態</label>
          <select
            className="w-full border rounded-lg px-3 py-2"
            value={person.employmentType}
            onChange={(e) => onChange({ ...person, employmentType: e.target.value })}
          >
            {employmentTypes.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">職種</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={person.jobTitle}
            onChange={(e) => onChange({ ...person, jobTitle: e.target.value })}
            placeholder="例: エンジニア"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">勤務先</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={person.workplace}
            onChange={(e) => onChange({ ...person, workplace: e.target.value })}
            placeholder="例: 株式会社〇〇"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">通勤時間（分）</label>
          <NumericInput
            className="w-full border rounded-lg px-3 py-2"
            value={person.commuteMinutes}
            onChange={(commuteMinutes) => onChange({ ...person, commuteMinutes })}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">勤務スタイル</label>
          <select
            className="w-full border rounded-lg px-3 py-2"
            value={person.workStyle}
            onChange={(e) => onChange({ ...person, workStyle: e.target.value })}
          >
            {workStyles.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}

function ChildForm({
  child,
  index,
  onChange,
  onRemove,
}: {
  child: ChildInfo;
  index: number;
  onChange: (c: ChildInfo) => void;
  onRemove: () => void;
}) {
  const update = <K extends keyof ChildInfo>(key: K, value: ChildInfo[K]) =>
    onChange({ ...child, [key]: value });

  return (
    <div className="border border-orange-200 rounded-xl p-4 bg-orange-50">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-semibold text-orange-800">子ども {index + 1}</h4>
        <button
          type="button"
          onClick={onRemove}
          className="text-sm text-red-500 hover:text-red-700"
        >
          削除
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-600 mb-1">名前（任意）</label>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={child.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="例: 太郎"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">
            生まれるタイミング
            <span className="ml-1 text-gray-400">（0=今年、-3=3歳、5=5年後）</span>
          </label>
          <NumericInput
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={child.birthYearOffset}
            onChange={(v) => update('birthYearOffset', v)}
            allowNegative
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">幼稚園・保育園</label>
          <select
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={child.kindergartenType}
            onChange={(e) => update('kindergartenType', e.target.value as SchoolType)}
          >
            {schoolTypeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">小学校</label>
          <select
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={child.elementaryType}
            onChange={(e) => update('elementaryType', e.target.value as SchoolType)}
          >
            {schoolTypeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">中学校</label>
          <select
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={child.juniorHighType}
            onChange={(e) => update('juniorHighType', e.target.value as SchoolType)}
          >
            {schoolTypeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">高校</label>
          <select
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={child.highSchoolType}
            onChange={(e) => update('highSchoolType', e.target.value as SchoolType)}
          >
            {schoolTypeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">大学・短大</label>
          <select
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={child.universityType}
            onChange={(e) => update('universityType', e.target.value as UniversityType)}
          >
            {universityTypeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        {child.universityType !== 'none' && (
          <div className="flex items-center gap-2 mt-1">
            <input
              type="checkbox"
              id={`away-${child.id}`}
              checked={child.livesAwayForUniversity}
              onChange={(e) => update('livesAwayForUniversity', e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor={`away-${child.id}`} className="text-xs text-gray-600">
              自宅外通学（仕送り等 +100万/年）
            </label>
          </div>
        )}
      </div>
    </div>
  );
}

function defaultChild(): ChildInfo {
  return {
    id: generateId(),
    name: '',
    birthYearOffset: 0,
    kindergartenType: 'public',
    elementaryType: 'public',
    juniorHighType: 'public',
    highSchoolType: 'public',
    universityType: 'national',
    livesAwayForUniversity: false,
  };
}

export default function BasicInfoForm() {
  const { plan, updatePlan } = usePlan();
  const { household } = plan;
  const children = household.children ?? [];

  const familyCompositionFromCount = (count: number): string => {
    if (count === 0) return '夫婦のみ';
    if (count === 1) return '子ども1人';
    if (count === 2) return '子ども2人';
    return '子ども3人以上';
  };

  const addChild = () => {
    const updated = [...children, defaultChild()];
    updatePlan({
      household: {
        ...household,
        children: updated,
        hasChildren: true,
        familyComposition: familyCompositionFromCount(updated.length),
      },
    });
  };

  const updateChild = (index: number, child: ChildInfo) => {
    const updated = [...children];
    updated[index] = child;
    updatePlan({ household: { ...household, children: updated } });
  };

  const removeChild = (index: number) => {
    const updated = children.filter((_, i) => i !== index);
    updatePlan({
      household: {
        ...household,
        children: updated,
        hasChildren: updated.length > 0,
        familyComposition: familyCompositionFromCount(updated.length),
      },
    });
  };

  return (
    <div className="space-y-6">
      <PersonForm
        label="🧑 本人"
        person={household.self}
        onChange={(self) => updatePlan({ household: { ...household, self } })}
      />
      <PersonForm
        label="💑 配偶者"
        person={household.spouse}
        onChange={(spouse) => updatePlan({ household: { ...household, spouse } })}
      />
      <div className="bg-gray-50 rounded-xl p-4">
        <h3 className="font-semibold text-gray-700 mb-4">🏠 世帯情報</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">居住エリア</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              value={household.residenceArea}
              onChange={(e) => updatePlan({ household: { ...household, residenceArea: e.target.value } })}
              placeholder="例: 東京都"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">家族構成</label>
            <select
              className="w-full border rounded-lg px-3 py-2"
              value={household.familyComposition}
              onChange={(e) => updatePlan({ household: { ...household, familyComposition: e.target.value, hasChildren: e.target.value !== '夫婦のみ' } })}
            >
              {familyCompositions.map((f) => <option key={f}>{f}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* 子ども教育計画セクション */}
      <div className="bg-orange-50 rounded-xl p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-orange-800">👶 子どもの教育計画</h3>
          <button
            type="button"
            onClick={addChild}
            className="text-sm bg-orange-500 text-white px-3 py-1 rounded-lg hover:bg-orange-600 transition-colors"
          >
            + 子どもを追加
          </button>
        </div>
        {children.length === 0 ? (
          <p className="text-sm text-gray-500">
            子どもを追加すると、教育費（幼稚園〜大学）をシミュレーションに自動反映します。
          </p>
        ) : (
          <div className="space-y-4">
            {children.map((child, i) => (
              <ChildForm
                key={child.id}
                child={child}
                index={i}
                onChange={(c) => updateChild(i, c)}
                onRemove={() => removeChild(i)}
              />
            ))}
            <div className="text-xs text-gray-500 bg-white rounded-lg p-3 border">
              📊 教育費の目安（文科省調査参考）：公立幼〜公立大 約1,000万円 / 私立幼〜私立大（文系）約2,500万円
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
