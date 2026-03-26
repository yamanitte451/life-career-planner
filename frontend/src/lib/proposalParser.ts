import { AIProposal, PlanChange } from './types';
import { generateId } from './id';

const PROPOSAL_PATTERN = /```proposal\s*\n([\s\S]*?)```/g;

interface ParseResult {
  segments: ProposalSegment[];
  proposals: AIProposal[];
}

export type ProposalSegment =
  | { type: 'text'; content: string }
  | { type: 'proposal'; proposal: AIProposal };

function safeNumber(v: unknown, fallback: number): number {
  const n = Number(v);
  return isNaN(n) ? fallback : n;
}

export function parseProposals(content: string): ParseResult {
  const segments: ProposalSegment[] = [];
  const proposals: AIProposal[] = [];

  let lastIndex = 0;
  const regex = new RegExp(PROPOSAL_PATTERN.source, PROPOSAL_PATTERN.flags);
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    // テキスト部分
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: content.slice(lastIndex, match.index) });
    }

    // proposalブロックをパース
    try {
      const json = JSON.parse(match[1]);
      const changes: PlanChange[] = (json.changes || []).map((c: PlanChange) => ({
        path: String(c.path || ''),
        value: safeNumber(c.value, 0),
        delta: c.delta != null ? safeNumber(c.delta, 0) : undefined,
        label: String(c.label || c.path || ''),
      }));

      const proposal: AIProposal = {
        id: generateId(),
        title: String(json.title || '提案'),
        description: String(json.description || ''),
        changes,
      };
      proposals.push(proposal);
      segments.push({ type: 'proposal', proposal });
    } catch {
      // パース失敗時はテキストとして扱う
      segments.push({ type: 'text', content: match[0] });
    }

    lastIndex = match.index + match[0].length;
  }

  // 残りのテキスト
  if (lastIndex < content.length) {
    segments.push({ type: 'text', content: content.slice(lastIndex) });
  }

  // proposalブロックがない場合
  if (segments.length === 0) {
    segments.push({ type: 'text', content });
  }

  return { segments, proposals };
}
