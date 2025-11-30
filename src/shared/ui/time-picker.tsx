"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { ListBox, type ListBoxOption } from "@/shared/ui/listbox";

export type TimePickerProps = {
  value?: string; // HH:mm format
  onChange?: (time: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  modal?: boolean;
};

// Generate hours array (00-23)
const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));

// Generate minutes array in 5-minute increments (00, 05, 10, ..., 55)
const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, "0"));

const hourOptions: ListBoxOption<string>[] = hours.map((hour) => ({
  value: hour,
  label: hour,
}));

const minuteOptions: ListBoxOption<string>[] = minutes.map((minute) => ({
  value: minute,
  label: minute,
}));

export function TimePicker({
  value = "",
  onChange,
  disabled,
  placeholder = "Select time",
  className,
  modal = false
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Parse current value
  const [selectedHour, selectedMinute] = value ? value.split(":") : [null, null];

  const handleHourChange = (hour: string | null) => {
    const nextHour = hour ?? "00";
    const nextMinute = selectedMinute ?? "00";
    onChange?.(`${nextHour}:${nextMinute}`);
  };

  const handleMinuteChange = (minute: string | null) => {
    const nextHour = selectedHour ?? "00";
    const nextMinute = minute ?? "00";
    onChange?.(`${nextHour}:${nextMinute}`);
  };

  return (
    <Popover open={open} modal={modal} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <Clock className="mr-2 h-4 w-4" />
          {value || <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <div className="flex gap-3">
          <div className="w-28 space-y-2">
            <p className="text-muted-foreground text-xs font-medium uppercase">Hours</p>
            <ListBox
              options={hourOptions}
              value={selectedHour}
              onChange={(next) => handleHourChange(next as string | null)}
              className="border-border"
              optionClassName="py-1.5"
              emptyLabel="No hours"
            />
          </div>
          <div className="flex items-center pt-8">
            <span className="text-2xl font-semibold text-muted-foreground">:</span>
          </div>
          <div className="w-28 space-y-2">
            <p className="text-muted-foreground text-xs font-medium uppercase">Minutes</p>
            <ListBox
              options={minuteOptions}
              value={selectedMinute}
              onChange={(next) => handleMinuteChange(next as string | null)}
              className="border-border"
              optionClassName="py-1.5"
              emptyLabel="No minutes"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
