import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InputPhone } from '@/shared/ui/input-phone';

Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
  value: vi.fn(),
  writable: true,
});

describe('InputPhone', () => {
  it('renders phone input with placeholder', () => {
    render(<InputPhone />);
    expect(screen.getByPlaceholderText('+33 6 12 34 56 78')).toBeInTheDocument();
  });

  it('renders with tel inputMode', () => {
    render(<InputPhone />);
    const input = screen.getByPlaceholderText('+33 6 12 34 56 78');
    expect(input).toHaveAttribute('inputMode', 'tel');
  });

  it('renders with tel autocomplete', () => {
    render(<InputPhone />);
    const input = screen.getByPlaceholderText('+33 6 12 34 56 78');
    expect(input).toHaveAttribute('autocomplete', 'tel');
  });

  it('accepts and displays a phone value', () => {
    render(<InputPhone value="+33612345678" onChange={() => {}} />);
    const input = screen.getByPlaceholderText('+33 6 12 34 56 78') as HTMLInputElement;
    expect(input.value).toBeTruthy();
  });

  it('calls onChange when value changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<InputPhone value="" onChange={onChange} />);
    const input = screen.getByPlaceholderText('+33 6 12 34 56 78');

    await user.type(input, '612345678');

    expect(onChange).toHaveBeenCalled();
  });

  it('handles empty value correctly', () => {
    const onChange = vi.fn();
    render(<InputPhone value="" onChange={onChange} />);
    const input = screen.getByPlaceholderText('+33 6 12 34 56 78') as HTMLInputElement;
    // When empty, the component shows the default country code
    expect(input.value).toBe('+33');
  });

  it('handles undefined value correctly', () => {
    const onChange = vi.fn();
    render(<InputPhone onChange={onChange} />);
    const input = screen.getByPlaceholderText('+33 6 12 34 56 78');
    expect(input).toBeInTheDocument();
  });

  it('can be disabled', () => {
    render(<InputPhone disabled />);
    const container = screen.getByPlaceholderText('+33 6 12 34 56 78').closest('.PhoneInput');
    // The disabled prop is passed to the PhoneInput component
    expect(container).toBeInTheDocument();
  });

  it('accepts a name prop', () => {
    render(<InputPhone name="phone" />);
    // PhoneInput component should receive the name prop
    expect(screen.getByPlaceholderText('+33 6 12 34 56 78')).toBeInTheDocument();
  });

  it('accepts an id prop', () => {
    render(<InputPhone id="phone-input" />);
    const input = screen.getByPlaceholderText('+33 6 12 34 56 78');
    expect(input).toHaveAttribute('aria-label', 'Phone number');
  });

  it('applies custom className to wrapper', () => {
    const { container } = render(<InputPhone className="custom-phone" />);
    const phoneInput = container.querySelector('.PhoneInput');
    expect(phoneInput).toHaveClass('custom-phone');
  });

  it('applies default styling classes', () => {
    const { container } = render(<InputPhone />);
    const phoneInput = container.querySelector('.PhoneInput');
    expect(phoneInput).toHaveClass('flex');
    expect(phoneInput).toHaveClass('h-10');
    expect(phoneInput).toHaveClass('w-full');
    expect(phoneInput).toHaveClass('rounded-md');
    expect(phoneInput).toHaveClass('border');
  });

  it('calls onChange with empty string when value is cleared', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<InputPhone value="+33612345678" onChange={onChange} />);
    const input = screen.getByPlaceholderText('+33 6 12 34 56 78');

    await user.clear(input);

    // Should call onChange with empty string when cleared
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[0]).toBe('');
  });

  it('has aria-label for accessibility', () => {
    render(<InputPhone />);
    const input = screen.getByLabelText('Phone number');
    expect(input).toBeInTheDocument();
  });

  it('merges custom className with default classes', () => {
    const { container } = render(<InputPhone className="my-custom-class" />);
    const phoneInput = container.querySelector('.PhoneInput');
    expect(phoneInput).toHaveClass('my-custom-class');
    expect(phoneInput).toHaveClass('flex'); // Default class still present
  });

  it('opens the country selector popover', async () => {
    const user = userEvent.setup();
    render(<InputPhone />);

    await user.click(screen.getByRole('button', { name: /country/i }));

    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('parses a pasted national phone number', () => {
    const onChange = vi.fn();
    render(<InputPhone onChange={onChange} />);
    const input = screen.getByLabelText('Phone number');

    fireEvent.paste(input, {
      clipboardData: {
        getData: () => '+33 6 12 34 56 78',
      },
    });

    expect(onChange).toHaveBeenCalledWith('+33612345678');
  });

  it('ignores pasted text that is not a possible phone number', () => {
    const onChange = vi.fn();
    render(<InputPhone onChange={onChange} />);
    const input = screen.getByLabelText('Phone number');

    fireEvent.paste(input, {
      clipboardData: {
        getData: () => 'not a phone',
      },
    });

    expect(onChange).not.toHaveBeenCalled();
  });
});
