'use client';
import { usePlan } from '../../context/PlanContext';
import { Person } from '../../lib/types';

const employmentTypes = ['正社員', '契約社員', '派遣', '自営業', 'パート', '無職'];
const workStyles = ['出社', 'ハイブリッド', '在宅'];
const familyCompositions = ['夫婦のみ', '子ども1人', '子ども2人', '子ども3人以上'];

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
          <input
            type="number"
            className="w-full border rounded-lg px-3 py-2"
            value={person.age}
            onChange={(e) => onChange({ ...person, age: Number(e.target.value) })}
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
          <input
            type="number"
            className="w-full border rounded-lg px-3 py-2"
            value={person.commuteMinutes}
            onChange={(e) => onChange({ ...person, commuteMinutes: Number(e.target.value) })}
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

export default function BasicInfoForm() {
  const { plan, updatePlan } = usePlan();
  const { household } = plan;

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
    </div>
  );
}
