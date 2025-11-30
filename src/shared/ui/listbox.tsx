"use client"

import * as React from "react"
import { CheckIcon, SearchIcon } from "lucide-react"

import { cn } from "@/shared/lib/utils"
import { Input } from "@/shared/ui/input"

export type ListBoxOption<Value = string> = {
  value: Value
  label: string
  description?: string
  meta?: string
  disabled?: boolean
  icon?: React.ReactNode
}

type ListBoxProps<Value = string> = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange"
> & {
  options: ListBoxOption<Value>[]
  value: Value | Value[] | null
  onChange: (value: Value | Value[] | null) => void
  multiple?: boolean
  filterable?: boolean
  filterPlaceholder?: string
  emptyLabel?: string
  optionClassName?: string
}

function ListBox<Value>({
  options,
  value,
  onChange,
  multiple = false,
  filterable = false,
  filterPlaceholder = "Search...",
  emptyLabel = "No options",
  className,
  optionClassName,
  ...props
}: ListBoxProps<Value>) {
  const [query, setQuery] = React.useState("")
  const optionRefs = React.useRef(new Map<Value, HTMLDivElement | null>())
  const lastSelectedRef = React.useRef<Value | null>(null)

  const normalizedValue = React.useMemo(() => {
    if (multiple) {
      return Array.isArray(value) ? value : value != null ? [value] : []
    }
    return (value as Value | null) ?? null
  }, [value, multiple])

  const isSelected = React.useCallback(
    (optionValue: Value) => {
      if (multiple) {
        return (normalizedValue as Value[]).some((item) =>
          Object.is(item, optionValue)
        )
      }
      return Object.is(normalizedValue as Value | null, optionValue)
    },
    [normalizedValue, multiple]
  )

  const handleSelect = (option: ListBoxOption<Value>) => {
    if (option.disabled) return

    if (multiple) {
      const current = (normalizedValue as Value[]) ?? []
      const exists = current.some((item) => Object.is(item, option.value))
      const next = exists
        ? current.filter((item) => !Object.is(item, option.value))
        : [...current, option.value]
      lastSelectedRef.current = option.value
      onChange(next)
      return
    }

    lastSelectedRef.current = option.value
    onChange(option.value)
  }

  const filteredOptions = React.useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return options

    return options.filter((option) => {
      const haystack = [option.label, option.description, option.meta]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      return haystack.includes(term)
    })
  }, [options, query])

  const invalid =
    props["aria-invalid"] === true || props["aria-invalid"] === "true"

  const primarySelected = React.useMemo(() => {
    if (multiple) {
      const arr = normalizedValue as Value[]
      return arr.length ? arr[0] : null
    }
    return normalizedValue as Value | null
  }, [normalizedValue, multiple])

  React.useEffect(() => {
    const target = lastSelectedRef.current ?? primarySelected
    if (target == null) return
    const el = optionRefs.current.get(target)
    if (!el) return
    requestAnimationFrame(() => {
      el.scrollIntoView({ block: "center", inline: "nearest" })
    })
  }, [primarySelected, filteredOptions])

  return (
    <div
      data-slot="listbox"
      data-invalid={invalid}
      className={cn(
        "border-input bg-card text-card-foreground rounded-lg border shadow-xs",
        invalid && "border-destructive/60 ring-destructive/20",
        className
      )}
      {...props}
    >
      {filterable ? (
        <div className="relative border-b border-border/80 px-3 py-2">
          <SearchIcon className="text-muted-foreground absolute left-4 top-1/2 size-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={filterPlaceholder}
            className="pl-9"
          />
        </div>
      ) : null}

      <div
        role="listbox"
        aria-multiselectable={multiple}
        className="max-h-44 space-y-1 overflow-y-auto p-1"
      >
        {filteredOptions.length === 0 ? (
          <p className="text-muted-foreground px-3 py-4 text-sm">{emptyLabel}</p>
        ) : (
          filteredOptions.map((option) => {
            const selected = isSelected(option.value)
            return (
              <div
                key={String(option.value)}
                role="option"
                aria-selected={selected}
                aria-disabled={option.disabled}
                tabIndex={option.disabled ? -1 : 0}
                ref={(node) => {
                  optionRefs.current.set(option.value, node);
                }}
                onClick={() => handleSelect(option)}
                onKeyDown={(event) => {
                  if (option.disabled) return
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    handleSelect(option)
                  }
                }}
                className={cn(
                  "hover:bg-accent/60 focus-visible:border-ring focus-visible:ring-ring/50 group relative flex w-full cursor-pointer items-start gap-3 rounded-md border border-transparent px-3 py-2 text-left outline-none transition-[color,box-shadow,border,background-color] focus-visible:border-ring focus-visible:ring-[3px]",
                  selected && "border-primary/40 bg-primary/5 hover:bg-primary/10",
                  option.disabled && "cursor-not-allowed opacity-50",
                  optionClassName
                )}
              >
                {option.icon ? (
                  <span className="text-muted-foreground mt-0.5 flex size-5 items-center justify-center">
                    {option.icon}
                  </span>
                ) : null}
                  <div className="flex flex-1 items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium leading-tight">
                        {option.label}
                      </div>
                      {option.description ? (
                        <p className="text-muted-foreground text-xs">
                          {option.description}
                        </p>
                      ) : null}
                    </div>
                  <div className="flex items-center gap-2">
                    {option.meta ? (
                      <span className="text-muted-foreground text-xs font-medium">
                        {option.meta}
                      </span>
                    ) : null}
                    <span
                      className={cn(
                        "text-primary opacity-0 transition-opacity duration-150 group-hover:opacity-100",
                        selected && "opacity-100"
                      )}
                    >
                      <CheckIcon className="size-4" />
                    </span>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export { ListBox }
