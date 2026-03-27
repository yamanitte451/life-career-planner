import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import ChatMessage from '../../components/chat/ChatMessage';
import { parseProposals } from '../../lib/proposalParser';

const proposalContent = `以下の提案をご検討ください。

\`\`\`proposal
{
  "title": "転職で年収アップ",
  "description": "年収を80万円増やす提案です",
  "changes": [
    { "path": "income.selfAnnualIncome", "value": 5800000, "delta": 800000, "label": "本人年収" }
  ]
}
\`\`\`

ぜひご検討ください。`;

describe('ChatMessage', () => {
  it('userロールはテキストをそのまま表示する', () => {
    render(<ChatMessage role="user" content="こんにちは" />);
    expect(screen.getByText('こんにちは')).toBeInTheDocument();
  });

  it('assistantロールはAIアドバイザーラベルを表示する', () => {
    render(<ChatMessage role="assistant" content="ご相談を承ります。" />);
    expect(screen.getByText('AI アドバイザー')).toBeInTheDocument();
  });

  it('proposalブロックを含む場合、提案カードを表示する', () => {
    render(<ChatMessage role="assistant" content={proposalContent} onApplyProposal={vi.fn()} />);
    expect(screen.getByText('転職で年収アップ')).toBeInTheDocument();
    expect(screen.getByText('年収を80万円増やす提案です')).toBeInTheDocument();
    expect(screen.getByText('本人年収')).toBeInTheDocument();
  });

  it('「シミュレーションに反映」ボタン押下でonApplyProposalが呼ばれる', () => {
    const onApply = vi.fn();
    render(<ChatMessage role="assistant" content={proposalContent} onApplyProposal={onApply} />);
    fireEvent.click(screen.getByRole('button', { name: 'シミュレーションに反映' }));
    expect(onApply).toHaveBeenCalledTimes(1);
    const calledWith = onApply.mock.calls[0][0];
    expect(calledWith.title).toBe('転職で年収アップ');
    expect(calledWith.changes).toHaveLength(1);
  });

  it('appliedProposalIdsにIDが含まれるとボタンが「反映済み」になりdisabledになる', () => {
    const { proposals } = parseProposals(proposalContent);
    const appliedIds = new Set([proposals[0].id]);
    render(
      <ChatMessage
        role="assistant"
        content={proposalContent}
        onApplyProposal={vi.fn()}
        appliedProposalIds={appliedIds}
      />
    );
    const button = screen.getByRole('button', { name: '反映済み' });
    expect(button).toBeDisabled();
  });
});
