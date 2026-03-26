import { describe, it, expect } from 'vitest';
import { parseProposals } from '../lib/proposalParser';

describe('parseProposals', () => {
  it('proposalブロックがないテキストをそのまま返す', () => {
    const content = '転職を検討してみてはいかがでしょうか。';
    const result = parseProposals(content);
    expect(result.proposals).toHaveLength(0);
    expect(result.segments).toHaveLength(1);
    expect(result.segments[0]).toEqual({ type: 'text', content });
  });

  it('proposalブロックを正しくパースする', () => {
    const content = `以下の提案をご検討ください。

\`\`\`proposal
{
  "title": "転職で年収アップ",
  "description": "年収を80万円増やす提案です",
  "changes": [
    { "path": "income.selfAnnualIncome", "value": 5800000, "delta": 800000, "label": "本人年収" }
  ]
}
\`\`\`

ぜひお試しください。`;

    const result = parseProposals(content);
    expect(result.proposals).toHaveLength(1);
    expect(result.proposals[0].title).toBe('転職で年収アップ');
    expect(result.proposals[0].changes).toHaveLength(1);
    expect(result.proposals[0].changes[0].path).toBe('income.selfAnnualIncome');
    expect(result.proposals[0].changes[0].value).toBe(5800000);
    expect(result.proposals[0].changes[0].delta).toBe(800000);

    expect(result.segments).toHaveLength(3);
    expect(result.segments[0].type).toBe('text');
    expect(result.segments[1].type).toBe('proposal');
    expect(result.segments[2].type).toBe('text');
  });

  it('複数のproposalブロックをパースする', () => {
    const content = `提案A:

\`\`\`proposal
{ "title": "A", "description": "提案A", "changes": [{ "path": "income.selfAnnualIncome", "value": 6000000, "label": "年収" }] }
\`\`\`

提案B:

\`\`\`proposal
{ "title": "B", "description": "提案B", "changes": [{ "path": "expense.housing", "value": 80000, "label": "住居費" }] }
\`\`\``;

    const result = parseProposals(content);
    expect(result.proposals).toHaveLength(2);
    expect(result.proposals[0].title).toBe('A');
    expect(result.proposals[1].title).toBe('B');
  });

  it('不正なJSONはテキストとして扱う', () => {
    const content = `提案:

\`\`\`proposal
{ invalid json }
\`\`\`

以上です。`;

    const result = parseProposals(content);
    expect(result.proposals).toHaveLength(0);
    expect(result.segments).toHaveLength(3);
    // 不正なブロックはテキストとして含まれる
    expect(result.segments[1].type).toBe('text');
  });
});
