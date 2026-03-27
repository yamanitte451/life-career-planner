'use client';
import { useMemo } from 'react';
import { AIProposal } from '../../lib/types';
import { parseProposals, ProposalSegment } from '../../lib/proposalParser';
import { formatCurrency } from '../../lib/simulation';

const PERCENT_PATHS = new Set([
  'investment.expectedReturn',
  'investment.salaryGrowthRate',
  'investment.inflationRate',
  'debt.mortgageInterestRate',
]);

const AGE_PATHS = new Set(['investment.pensionStartAge']);

const YEAR_PATHS = new Set(['debt.mortgageLoanTermYears']);

function formatChangeValue(path: string, value: number): string {
  if (PERCENT_PATHS.has(path)) return `${value}%`;
  if (AGE_PATHS.has(path)) return `${value}歳`;
  if (YEAR_PATHS.has(path)) return `${value}年`;
  return formatCurrency(value);
}

function formatDeltaValue(path: string, delta: number): string {
  const prefix = delta >= 0 ? '+' : '';
  if (PERCENT_PATHS.has(path)) return `${prefix}${delta}%`;
  if (AGE_PATHS.has(path)) return `${prefix}${delta}歳`;
  if (YEAR_PATHS.has(path)) return `${prefix}${delta}年`;
  return `${prefix}${formatCurrency(delta)}`;
}

interface Props {
  role: 'user' | 'assistant';
  content: string;
  onApplyProposal?: (proposal: AIProposal) => void;
  appliedProposalIds?: Set<string>;
}

function ProposalCard({
  proposal,
  onApply,
  isApplied,
}: {
  proposal: AIProposal;
  onApply?: (proposal: AIProposal) => void;
  isApplied: boolean;
}) {
  return (
    <div className="my-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
      <div className="flex items-start gap-2 mb-2">
        <span className="text-lg">💡</span>
        <div>
          <p className="text-sm font-bold text-blue-800">{proposal.title}</p>
          <p className="text-xs text-blue-600 mt-0.5">{proposal.description}</p>
        </div>
      </div>
      <div className="space-y-1 mb-3">
        {proposal.changes.map((change, i) => (
          <div key={`${change.path}:${change.value}:${change.label ?? ''}:${i}`} className="flex items-center gap-2 text-xs text-gray-700 bg-white rounded px-2 py-1">
            <span className="font-medium">{change.label}</span>
            <span className="text-gray-400">→</span>
            <span className="font-semibold text-blue-700">{formatChangeValue(change.path, change.value)}</span>
            {change.delta != null && (
              <span className={`text-xs ${change.delta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ({formatDeltaValue(change.path, change.delta)})
              </span>
            )}
          </div>
        ))}
      </div>
      {onApply && (
        <button
          onClick={() => onApply(proposal)}
          disabled={isApplied}
          className={`w-full text-sm font-medium py-2 rounded-lg transition-colors ${
            isApplied
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isApplied ? '反映済み' : 'シミュレーションに反映'}
        </button>
      )}
    </div>
  );
}

export default function ChatMessage({ role, content, onApplyProposal, appliedProposalIds }: Props) {
  const isUser = role === 'user';

  const segments = useMemo<ProposalSegment[]>(() => {
    if (isUser) return [{ type: 'text', content }];
    return parseProposals(content).segments;
  }, [content, isUser]);

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-md'
            : 'bg-gray-100 text-gray-800 rounded-bl-md'
        }`}
      >
        {!isUser && (
          <p className="text-xs font-semibold text-blue-600 mb-1">AI アドバイザー</p>
        )}
        {segments.map((seg, i) =>
          seg.type === 'text' ? (
            <span key={i} className="whitespace-pre-wrap">{seg.content}</span>
          ) : (
            <ProposalCard
              key={seg.proposal.id}
              proposal={seg.proposal}
              onApply={onApplyProposal}
              isApplied={appliedProposalIds?.has(seg.proposal.id) ?? false}
            />
          )
        )}
      </div>
    </div>
  );
}
