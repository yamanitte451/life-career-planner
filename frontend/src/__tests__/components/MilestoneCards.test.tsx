import { render, screen } from '@testing-library/react';
import MilestoneCards from '../../components/dashboard/MilestoneCards';
import { MilestoneMetrics } from '../../lib/milestoneMetrics';

const base: MilestoneMetrics = {
  netAssetsAt60: 20000000,
  peakExpenseYear: { year: 2035, age: 40, amount: 6000000 },
  peakEducationYear: { year: 2040, age: 45, amount: 2000000 },
  negativeNetAssetsYear: null,
  lifetimeBalance: 10000000,
};

describe('MilestoneCards', () => {
  it('5つのカードを表示する', () => {
    render(<MilestoneCards metrics={base} />);
    expect(screen.getByText('60歳時点の純資産')).toBeInTheDocument();
    expect(screen.getByText('支出ピーク年')).toBeInTheDocument();
    expect(screen.getByText('教育費ピーク年')).toBeInTheDocument();
    expect(screen.getByText('資産マイナス警告')).toBeInTheDocument();
    expect(screen.getByText('30年累計収支バランス')).toBeInTheDocument();
  });

  it('netAssetsAt60がnullのとき「—」を表示する', () => {
    render(<MilestoneCards metrics={{ ...base, netAssetsAt60: null }} />);
    // 60歳カードの値が「—」になる（支出・教育費も「—」になり得るのでgetAllByTextを使う）
    const dashes = screen.getAllByText('—');
    expect(dashes.length).toBeGreaterThanOrEqual(1);
  });

  it('netAssetsAt60が負のとき「老後資金の見直しを検討」を表示する', () => {
    render(<MilestoneCards metrics={{ ...base, netAssetsAt60: -5000000 }} />);
    expect(screen.getByText('老後資金の見直しを検討')).toBeInTheDocument();
  });

  it('negativeNetAssetsYearがあるとき警告テキストを表示する', () => {
    render(<MilestoneCards metrics={{ ...base, negativeNetAssetsYear: { year: 2055, age: 62 } }} />);
    expect(screen.getByText('62歳')).toBeInTheDocument();
    expect(screen.getByText('2055年に純資産がマイナスに')).toBeInTheDocument();
  });

  it('negativeNetAssetsYearがnullのとき「シミュレーション期間中は安全」を表示する', () => {
    render(<MilestoneCards metrics={base} />);
    expect(screen.getByText('シミュレーション期間中は安全')).toBeInTheDocument();
  });

  it('peakEducationYearがnullのとき「教育費が発生しない期間」を表示する', () => {
    render(<MilestoneCards metrics={{ ...base, peakEducationYear: null }} />);
    expect(screen.getByText('教育費が発生しない期間')).toBeInTheDocument();
  });

  it('lifetimeBalanceが負のとき「赤字」を表示する', () => {
    render(<MilestoneCards metrics={{ ...base, lifetimeBalance: -3000000 }} />);
    expect(screen.getByText('赤字')).toBeInTheDocument();
  });
});
