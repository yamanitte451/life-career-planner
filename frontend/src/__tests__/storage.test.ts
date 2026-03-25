import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveScenario, loadScenarios, deleteScenario } from '../lib/storage';
import { Scenario } from '../lib/types';
import { defaultLifePlan } from '../lib/storage';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

vi.stubGlobal('localStorage', localStorageMock);

function makeScenario(overrides: Partial<Scenario> = {}): Scenario {
  return {
    id: 'test-id-1',
    name: 'テストシナリオ',
    createdAt: 1000000,
    plan: { ...defaultLifePlan },
    ...overrides,
  };
}

describe('scenario storage', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('loadScenarios', () => {
    it('returns empty array when nothing is saved', () => {
      expect(loadScenarios()).toEqual([]);
    });

    it('returns empty array on corrupted data', () => {
      localStorageMock.setItem('life_career_scenarios', 'not-json{{{');
      expect(loadScenarios()).toEqual([]);
    });

    it('returns empty array when stored value is not an array', () => {
      localStorageMock.setItem('life_career_scenarios', JSON.stringify({ id: 'x' }));
      expect(loadScenarios()).toEqual([]);
    });
  });

  describe('saveScenario', () => {
    it('saves a scenario and can be loaded back', () => {
      const sc = makeScenario();
      saveScenario(sc);
      const loaded = loadScenarios();
      expect(loaded).toHaveLength(1);
      expect(loaded[0].id).toBe(sc.id);
      expect(loaded[0].name).toBe(sc.name);
    });

    it('can save multiple scenarios', () => {
      saveScenario(makeScenario({ id: 'a', name: 'シナリオA' }));
      saveScenario(makeScenario({ id: 'b', name: 'シナリオB' }));
      const loaded = loadScenarios();
      expect(loaded).toHaveLength(2);
      expect(loaded.map((s) => s.id)).toContain('a');
      expect(loaded.map((s) => s.id)).toContain('b');
    });

    it('overwrites an existing scenario with the same id', () => {
      saveScenario(makeScenario({ id: 'x', name: '初期名' }));
      saveScenario(makeScenario({ id: 'x', name: '更新名' }));
      const loaded = loadScenarios();
      expect(loaded).toHaveLength(1);
      expect(loaded[0].name).toBe('更新名');
    });

    it('preserves the plan data', () => {
      const sc = makeScenario();
      sc.plan.income.selfAnnualIncome = 9999999;
      saveScenario(sc);
      const loaded = loadScenarios();
      expect(loaded[0].plan.income.selfAnnualIncome).toBe(9999999);
    });

    it('preserves createdAt timestamp', () => {
      const sc = makeScenario({ createdAt: 1234567890 });
      saveScenario(sc);
      const loaded = loadScenarios();
      expect(loaded[0].createdAt).toBe(1234567890);
    });

    it('preserves order: new scenario is appended at the end', () => {
      saveScenario(makeScenario({ id: 'first', name: '最初' }));
      saveScenario(makeScenario({ id: 'second', name: '二番目' }));
      const loaded = loadScenarios();
      expect(loaded[0].id).toBe('first');
      expect(loaded[1].id).toBe('second');
    });

    it('overwrite preserves position in list', () => {
      saveScenario(makeScenario({ id: 'a', name: 'A' }));
      saveScenario(makeScenario({ id: 'b', name: 'B' }));
      saveScenario(makeScenario({ id: 'a', name: 'A更新' }));
      const loaded = loadScenarios();
      expect(loaded).toHaveLength(2);
      expect(loaded[0].name).toBe('A更新');
      expect(loaded[1].name).toBe('B');
    });
  });

  describe('deleteScenario', () => {
    it('deletes the scenario with the given id', () => {
      saveScenario(makeScenario({ id: 'del', name: '削除対象' }));
      saveScenario(makeScenario({ id: 'keep', name: '残す' }));
      deleteScenario('del');
      const loaded = loadScenarios();
      expect(loaded).toHaveLength(1);
      expect(loaded[0].id).toBe('keep');
    });

    it('does nothing when id does not exist', () => {
      saveScenario(makeScenario({ id: 'exist', name: '存在する' }));
      deleteScenario('nonexistent');
      expect(loadScenarios()).toHaveLength(1);
    });

    it('results in empty list after deleting the only scenario', () => {
      saveScenario(makeScenario({ id: 'only', name: '唯一' }));
      deleteScenario('only');
      expect(loadScenarios()).toEqual([]);
    });

    it('does nothing when list is already empty', () => {
      expect(() => deleteScenario('ghost')).not.toThrow();
      expect(loadScenarios()).toEqual([]);
    });
  });
});
