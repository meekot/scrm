import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InputCurrency } from '@/shared/ui/input-currency';

describe('InputCurrency', () => {
  it('renders with default EUR symbol', () => {
    render(<InputCurrency />);
    expect(screen.getByText('€')).toBeInTheDocument();
  });

  it('renders with custom currency symbol', () => {
    render(<InputCurrency currencySymbol="$" />);
    expect(screen.getByText('$')).toBeInTheDocument();
  });

  it('renders with GBP symbol when specified', () => {
    render(<InputCurrency currencySymbol="£" />);
    expect(screen.getByText('£')).toBeInTheDocument();
  });

  it('renders input with number type', () => {
    render(<InputCurrency data-testid="currency-input" />);
    const input = screen.getByTestId('currency-input');
    expect(input).toHaveAttribute('type', 'number');
  });

  it('renders input with decimal inputMode', () => {
    render(<InputCurrency data-testid="currency-input" />);
    const input = screen.getByTestId('currency-input');
    expect(input).toHaveAttribute('inputMode', 'decimal');
  });

  it('has min="0" attribute', () => {
    render(<InputCurrency data-testid="currency-input" />);
    const input = screen.getByTestId('currency-input');
    expect(input).toHaveAttribute('min', '0');
  });

  it('has step="0.01" attribute for decimal values', () => {
    render(<InputCurrency data-testid="currency-input" />);
    const input = screen.getByTestId('currency-input');
    expect(input).toHaveAttribute('step', '0.01');
  });

  it('applies left padding class for currency symbol', () => {
    render(<InputCurrency data-testid="currency-input" />);
    const input = screen.getByTestId('currency-input');
    expect(input).toHaveClass('pl-9');
  });

  it('selects all text on focus', async () => {
    const user = userEvent.setup();
    render(<InputCurrency data-testid="currency-input" defaultValue="100" />);
    const input = screen.getByTestId('currency-input') as HTMLInputElement;

    // Spy on the select method
    const selectSpy = vi.spyOn(input, 'select');

    await user.click(input);

    // Check if select was called
    expect(selectSpy).toHaveBeenCalledTimes(1);
  });

  it('calls custom onFocus handler when provided', async () => {
    const user = userEvent.setup();
    const onFocus = vi.fn();
    render(<InputCurrency data-testid="currency-input" onFocus={onFocus} />);
    const input = screen.getByTestId('currency-input');

    await user.click(input);

    expect(onFocus).toHaveBeenCalledTimes(1);
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<InputCurrency ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });

  it('accepts additional props like placeholder', () => {
    render(<InputCurrency placeholder="Enter amount" data-testid="currency-input" />);
    const input = screen.getByTestId('currency-input');
    expect(input).toHaveAttribute('placeholder', 'Enter amount');
  });

  it('accepts disabled prop', () => {
    render(<InputCurrency disabled data-testid="currency-input" />);
    const input = screen.getByTestId('currency-input');
    expect(input).toBeDisabled();
  });

  it('accepts value prop', () => {
    render(<InputCurrency value="50" onChange={() => {}} data-testid="currency-input" />);
    const input = screen.getByTestId('currency-input') as HTMLInputElement;
    expect(input.value).toBe('50');
  });

  it('merges custom className with default classes', () => {
    render(<InputCurrency className="custom-class" data-testid="currency-input" />);
    const input = screen.getByTestId('currency-input');
    expect(input).toHaveClass('pl-9');
    expect(input).toHaveClass('custom-class');
  });
});
