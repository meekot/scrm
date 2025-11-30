import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ListBox, type ListBoxOption } from '@/shared/ui/listbox';

describe('ListBox', () => {
  const options: ListBoxOption<string>[] = Array.from({ length: 8 }, (_, idx) => ({
    value: `opt-${idx + 1}`,
    label: `Option ${idx + 1}`,
  }));

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

  it('auto scrolls selected option into center view', async () => {
    render(
      <ListBox
        options={options}
        value="opt-6"
        onChange={() => undefined}
        emptyLabel="empty"
      />
    );

    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith(
      expect.objectContaining({ block: 'center', inline: 'nearest' })
    );
  });

  it('calls onChange when option selected', () => {
    const handleChange = vi.fn();
    render(
      <ListBox
        options={options}
        value={null}
        onChange={handleChange}
        emptyLabel="empty"
      />
    );

    fireEvent.click(screen.getByText('Option 3'));

    expect(handleChange).toHaveBeenCalledWith('opt-3');
  });
});
