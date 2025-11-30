"use client"

import * as React from "react"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/shared/lib/utils"
import { formatDate } from "@/shared/lib/formatters"
import { Button } from "@/shared/ui/button"
import { Calendar, type CalendarProps } from "@/shared/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover"

type DatePickerProps = {
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  closeOnSelect?: boolean
} & Omit<CalendarProps, "mode" | "selected" | "onSelect">

export function DatePicker({
  selected,
  onSelect,
  placeholder = "Pick a date",
  className,
  closeOnSelect = true,
  ...calendarProps
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (date?: Date) => {
    onSelect?.(date)
    if (closeOnSelect && date) {
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={!selected}
          className={cn(
            "data-[empty=true]:text-muted-foreground flex w-full items-center justify-start gap-2 text-left font-normal",
            className
          )}
        >
          <CalendarIcon className="size-4" />
          {selected ? formatDate(selected, { dateStyle: "long" }) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          {...calendarProps}
        />
      </PopoverContent>
    </Popover>
  )
}
