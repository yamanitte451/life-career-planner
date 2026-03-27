import { AIProposal, PlanChange } from './types';

const PROPOSAL_PATTERN = /```proposal[^\S\r\n]*\r?\n([\s\S]*?)(?:\r?\n?```[^\S\r\n]*)/g;

interface ParseResult {
  segments: ProposalSegment[];
  proposals: AIProposal[];
}

export type ProposalSegment =
  | { type: 'text'; content: string }
  | { type: 'proposal'; proposal: AIProposal };

/** コンテンツから再現可能な安定IDを生成する */
function stableId(title: string, description: string, changes: PlanChange[]): string {
  const key = `${title}|${description}|${changes.map((c) => `${c.path}:${c.value}`).join(',')}`;
  let h = 5381;
  for (let i = 0; i < key.length; i++) {
    h = (Math.imul(31, h) + key.charCodeAt(i)) | 0;
  }
  return 'p' + Math.abs(h).toString(36);
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
      const rawChanges = Array.isArray(json.changes) ? json.changes : [];
      const changes: PlanChange[] = rawChanges
        .filter((c: any) => c && c.path && Number.isFinite(Number(c.value)))
        .map((c: PlanChange) => ({
          path: String(c.path),
          value: Number(c.value),
          delta: c.delta != null && Number.isFinite(Number(c.delta)) ? Number(c.delta) : undefined,
          label: String(c.label || c.path || ''),
        }));

      if (changes.length === 0) {
        segments.push({ type: 'text', content: match[0] });
      } else {
        const title = String(json.title || '提案');
        const description = String(json.description || '');
        const proposal: AIProposal = {
          id: stableId(title, description, changes),
          title,
          description,
          changes,
        };
        proposals.push(proposal);
        segments.push({ type: 'proposal', proposal });
      }
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
