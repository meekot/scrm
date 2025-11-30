import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TimePicker } from '@/shared/ui/time-picker';
import * as React from 'react';

describe('TimePicker', () => {
  let originalScrollIntoView: Element['scrollIntoView'];

  beforeEach(() => {
    originalScrollIntoView = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = vi.fn();
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0);
      return 0;
    });
  });

  afterEach(() => {
    Element.prototype.scrollIntoView = originalScrollIntoView;
    vi.restoreAllMocks();
  });

  it('updates value when selecting hour and minute', async () => {
    function Controlled() {
      const [val, setVal] = React.useState('');
      return <TimePicker value={val} onChange={setVal} modal={false} />;
    }

    render(<Controlled />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /select time/i }));

    const listboxes = screen.getAllByRole('listbox');
    const hoursList = listboxes[0];
    const minutesList = listboxes[1];

    await user.click(within(hoursList).getByText('05'));
    expect(screen.getByRole('button', { name: /05:00/i })).toBeInTheDocument();

    await user.click(within(minutesList).getByText('15'));
    expect(screen.getByRole('button', { name: /05:15/i })).toBeInTheDocument();
  });
});
