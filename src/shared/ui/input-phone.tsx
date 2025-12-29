"use client";

import * as React from "react";
import PhoneInput, { getCountryCallingCode, type Country, type Value } from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import labels from "react-phone-number-input/locale/en";
import { ChevronDown } from "lucide-react";
import { parsePhoneNumberFromString } from "libphonenumber-js/min";
import { cn } from "@/shared/lib/utils";
import { ListBox, type ListBoxOption } from "@/shared/ui/listbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

type InputPhoneProps = {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  name?: string;
  id?: string;
  className?: string;
};

const defaultCountry: Country = "FR";
const preferredCountries: Country[] = ["FR", "IT", "UA", "RU"];
const preferredCountriesSet = new Set(preferredCountries);

const PhoneTextInput = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn("flex-1 bg-transparent outline-none text-base md:text-sm", className)}
      autoComplete="tel"
      inputMode="tel"
      aria-label="Phone number"
      placeholder="+33 6 12 34 56 78"
      {...props}
    />
  )
);
PhoneTextInput.displayName = "PhoneTextInput";

type CountryOption = {
  value: Country;
  label: string;
};

type CountrySelectProps = React.ComponentProps<"select"> & {
  value?: Country;
  onChange: (value: Country) => void;
  options: CountryOption[];
  disabled?: boolean;
  readOnly?: boolean;
};

function CountrySelect({
  value,
  onChange,
  options,
  disabled,
  readOnly,
  "aria-label": ariaLabel,
}: CountrySelectProps) {
  const [open, setOpen] = React.useState(false);

  const orderedOptions = React.useMemo(() => {
    const optionMap = new Map(options.map((option) => [option.value, option]));
    const preferred = preferredCountries
      .map((country) => optionMap.get(country))
      .filter(Boolean) as CountryOption[];
    const rest = options.filter((option) => !preferredCountriesSet.has(option.value));
    return [...preferred, ...rest];
  }, [options]);

  const listOptions = React.useMemo<ListBoxOption<Country>[]>(() => {
    return orderedOptions.map((option) => {
      const callingCode = getCountryCallingCode(option.value);
      const Flag = flags[option.value];
      return {
        value: option.value,
        label: option.label,
        description: preferredCountriesSet.has(option.value) ? "Preferred" : undefined,
        meta: `+${callingCode}`,
        icon: Flag ? (
          <span className="flex size-4 items-center justify-center overflow-hidden rounded-sm [&_svg]:size-4">
            <Flag title={option.label} />
          </span>
        ) : null,
      };
    });
  }, [orderedOptions]);

  const selectedCountry = value ?? defaultCountry;
  const selectedOption =
    orderedOptions.find((option) => option.value === selectedCountry) ?? orderedOptions[0];
  const selectedLabel = selectedOption?.label ?? selectedCountry;
  const selectedCallingCode = selectedCountry ? getCountryCallingCode(selectedCountry) : "";
  const SelectedFlag = selectedCountry ? flags[selectedCountry] : null;

  return (
    <Popover modal open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={ariaLabel}
          disabled={disabled || readOnly}
          className={cn(
            "flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium outline-none transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] hover:bg-accent/60",
            (disabled || readOnly) && "cursor-not-allowed opacity-60 hover:bg-transparent"
          )}
        >
          {SelectedFlag ? (
            <span className="flex size-4 items-center justify-center overflow-hidden rounded-sm [&_svg]:size-4">
              <SelectedFlag title={selectedLabel} />
            </span>
          ) : (
            <span className="bg-muted size-4 rounded-sm" />
          )}
          <span className="max-w-[7.5rem] truncate text-xs font-semibold">{selectedLabel}</span>
          <ChevronDown className="text-muted-foreground size-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2" align="start">
        <ListBox
          options={listOptions}
          value={selectedOption?.value ?? null}
          onChange={(next) => {
            if (typeof next !== "string") return;
            onChange(next as Country);
            setOpen(false);
          }}
          filterable
          filterPlaceholder="Search country"
          emptyLabel="No countries"
          optionClassName="py-2"
        />
      </PopoverContent>
    </Popover>
  );
}

function InputPhone({ value, onChange, disabled, name, id, className }: InputPhoneProps) {
  const phoneValue = (value || undefined) as Value;
  const [country, setCountry] = React.useState<Country>(defaultCountry);

  const handlePaste = React.useCallback(
    (event: React.ClipboardEvent<HTMLInputElement>) => {
      const raw = event.clipboardData.getData("text");
      const trimmed = raw.trim();
      if (!trimmed) {
        event.preventDefault();
        return;
      }

      const parsed = parsePhoneNumberFromString(trimmed, country ?? defaultCountry);
      if (!parsed || !parsed.isPossible()) {
        event.preventDefault();
        return;
      }

      event.preventDefault();
      onChange?.(parsed.number);
    },
    [country, onChange]
  );

  return (
    <PhoneInput
      international
      defaultCountry={defaultCountry}
      countryCallingCodeEditable={false}
      value={phoneValue}
      onChange={(val) => onChange?.((val as string) ?? '')}
      onCountryChange={(nextCountry) => setCountry((nextCountry ?? defaultCountry) as Country)}
      disabled={disabled}
      name={name}
      id={id}
      className={cn(
        "flex h-10 w-full items-center gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px] data-[invalid=true]:border-destructive",
        className
      )}
      inputComponent={PhoneTextInput}
      countrySelectComponent={CountrySelect}
      countrySelectProps={{ "aria-label": "Country" }}
      numberInputProps={{ onPaste: handlePaste }}
      labels={labels}
    />
  );
}

export { InputPhone };
