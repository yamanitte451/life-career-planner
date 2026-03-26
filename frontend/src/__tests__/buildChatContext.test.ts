import { buildSystemPrompt } from '../lib/buildChatContext';
import { defaultLifePlan } from '../lib/storage';
import { runSimulation } from '../lib/simulation';

describe('buildSystemPrompt', () => {
  const simulation = runSimulation(defaultLifePlan, 30);

  it('プロンプト文字列を返す', () => {
    const prompt = buildSystemPrompt(defaultLifePlan, simulation);
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(100);
  });

  it('世帯情報を含む', () => {
    const prompt = buildSystemPrompt(defaultLifePlan, simulation);
    expect(prompt).toContain('本人: 30歳');
    expect(prompt).toContain('配偶者: 28歳');
    expect(prompt).toContain('東京都');
  });

  it('収支情報を含む', () => {
    const prompt = buildSystemPrompt(defaultLifePlan, simulation);
    expect(prompt).toContain('世帯年収');
    expect(prompt).toContain('月額支出');
  });

  it('シミュレーション結果サマリーを含む', () => {
    const prompt = buildSystemPrompt(defaultLifePlan, simulation);
    expect(prompt).toContain('10年後');
    expect(prompt).toContain('30年後');
    expect(prompt).toContain('純資産');
  });

  it('AIの役割を指示する', () => {
    const prompt = buildSystemPrompt(defaultLifePlan, simulation);
    expect(prompt).toContain('ファイナンシャルプランナー');
    expect(prompt).toContain('キャリアアドバイザー');
  });

  it('ライフイベントがある場合に表示する', () => {
    const planWithEvents = {
      ...defaultLifePlan,
      lifeEvents: [
        {
          id: '1',
          name: '転職',
          category: 'career' as const,
          yearOffset: 2,
          person: 'self' as const,
          oneTimeCost: 0,
          annualCostChange: 0,
          annualIncomeChange: 800000,
          durationYears: 0,
          memo: '',
        },
      ],
    };
    const sim = runSimulation(planWithEvents, 30);
    const prompt = buildSystemPrompt(planWithEvents, sim);
    expect(prompt).toContain('転職');
    expect(prompt).toContain('2年後');
  });
});
