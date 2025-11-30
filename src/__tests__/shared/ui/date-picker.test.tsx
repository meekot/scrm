import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DatePicker } from '@/shared/ui/date-picker';

describe('DatePicker', () => {
  it('renders placeholder when no date selected', () => {
    render(<DatePicker placeholder="Choose a date" />);
    expect(screen.getByText('Choose a date')).toBeInTheDocument();
  });

  it('calls onSelect when a date is chosen', async () => {
    const handleSelect = vi.fn();
    const user = userEvent.setup();

    render(<DatePicker onSelect={handleSelect} />);

    await user.click(screen.getByRole('button', { name: /pick a date/i }));

    const dayCell = screen.getAllByRole('gridcell').find((cell) => cell.querySelector('button'));
    expect(dayCell).toBeDefined();
    if (dayCell) {
      const button = dayCell.querySelector('button');
      if (button) {
        await user.click(button);
      }
    }

    expect(handleSelect).toHaveBeenCalled();
  });

  it('closes popover after selecting when closeOnSelect is true (default)', async () => {
    const user = userEvent.setup();
    render(<DatePicker />);

    await user.click(screen.getByRole('button', { name: /pick a date/i }));
    const dayCell = screen.getAllByRole('gridcell').find((cell) => cell.querySelector('button'));
    expect(dayCell).toBeDefined();
    if (dayCell) {
      const button = dayCell.querySelector('button');
      if (button) {
        await user.click(button);
      }
    }

    await waitFor(() => {
      expect(document.querySelector('[data-slot="popover-content"]')).toBeNull();
    });
  });
});
