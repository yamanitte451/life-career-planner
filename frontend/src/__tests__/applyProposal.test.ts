import { describe, it, expect } from 'vitest';
import { applyProposalToPlan } from '../lib/applyProposal';
import { AIProposal, LifePlan } from '../lib/types';
import { defaultLifePlan } from '../lib/storage';

function makeProposal(changes: AIProposal['changes']): AIProposal {
  return { id: 'test', title: 'test', description: 'test', changes };
}

describe('applyProposalToPlan', () => {
  it('許可されたパスの値を更新する', () => {
    const plan: LifePlan = { ...defaultLifePlan };
    const proposal = makeProposal([
      { path: 'income.selfAnnualIncome', value: 6000000, label: '本人年収' },
    ]);

    const updates = applyProposalToPlan(plan, proposal);
    expect(updates.income).toBeDefined();
    expect((updates.income as { selfAnnualIncome: number }).selfAnnualIncome).toBe(6000000);
  });

  it('複数の変更を同時に適用する', () => {
    const plan: LifePlan = { ...defaultLifePlan };
    const proposal = makeProposal([
      { path: 'income.selfAnnualIncome', value: 6000000, label: '年収' },
      { path: 'expense.housing', value: 80000, label: '住居費' },
    ]);

    const updates = applyProposalToPlan(plan, proposal);
    expect(updates.income).toBeDefined();
    expect(updates.expense).toBeDefined();
    expect((updates.income as { selfAnnualIncome: number }).selfAnnualIncome).toBe(6000000);
    expect((updates.expense as { housing: number }).housing).toBe(80000);
  });

  it('許可されていないパスは無視する', () => {
    const plan: LifePlan = { ...defaultLifePlan };
    const proposal = makeProposal([
      { path: 'household.self.age', value: 99, label: '年齢' },
    ]);

    const updates = applyProposalToPlan(plan, proposal);
    expect(Object.keys(updates)).toHaveLength(0);
  });

  it('不正な値（NaN, Infinity）は無視する', () => {
    const plan: LifePlan = { ...defaultLifePlan };
    const proposal = makeProposal([
      { path: 'income.selfAnnualIncome', value: NaN, label: '年収' },
    ]);

    const updates = applyProposalToPlan(plan, proposal);
    expect(Object.keys(updates)).toHaveLength(0);
  });

  it('同じセクション内の複数フィールドを更新する', () => {
    const plan: LifePlan = { ...defaultLifePlan };
    const proposal = makeProposal([
      { path: 'income.selfAnnualIncome', value: 6000000, label: '年収' },
      { path: 'income.selfBonus', value: 1000000, label: '賞与' },
    ]);

    const updates = applyProposalToPlan(plan, proposal);
    const income = updates.income as { selfAnnualIncome: number; selfBonus: number };
    expect(income.selfAnnualIncome).toBe(6000000);
    expect(income.selfBonus).toBe(1000000);
  });
});
