import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NumericInput from '../../components/forms/NumericInput';

describe('NumericInput', () => {
  it('初期値を表示する', () => {
    render(<NumericInput value={12345} onChange={() => {}} />);
    const input = screen.getByRole('spinbutton') as HTMLInputElement;
    expect(input.value).toBe('12345');
  });

  it('数値入力でonChangeが呼ばれる', async () => {
    const onChange = vi.fn();
    render(<NumericInput value={0} onChange={onChange} />);
    const input = screen.getByRole('spinbutton');
    await userEvent.clear(input);
    await userEvent.type(input, '500');
    expect(onChange).toHaveBeenCalledWith(500);
  });

  it('空入力でblur時に0にフォールバックする', async () => {
    const onChange = vi.fn();
    render(<NumericInput value={100} onChange={onChange} />);
    const input = screen.getByRole('spinbutton');
    await userEvent.clear(input);
    await userEvent.tab();
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it('外部からのvalue変更を反映する（非フォーカス時）', () => {
    const { rerender } = render(<NumericInput value={100} onChange={() => {}} />);
    rerender(<NumericInput value={200} onChange={() => {}} />);
    const input = screen.getByRole('spinbutton') as HTMLInputElement;
    expect(input.value).toBe('200');
  });
});
