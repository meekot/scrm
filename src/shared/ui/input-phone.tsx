"use client";

import * as React from "react";
import PhoneInput, { type Value } from "react-phone-number-input";
import { cn } from "@/shared/lib/utils";

type InputPhoneProps = {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  name?: string;
  id?: string;
  className?: string;
};

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

function InputPhone({ value, onChange, disabled, name, id, className }: InputPhoneProps) {
  const phoneValue = (value || undefined) as Value;

  return (
    <PhoneInput
      international
      defaultCountry="FR"
      countryCallingCodeEditable={false}
      value={phoneValue}
      onChange={(val) => onChange?.((val as string) ?? '')}
      disabled={disabled}
      name={name}
      id={id}
      className={cn(
        "flex h-10 w-full items-center gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px] data-[invalid=true]:border-destructive",
        className
      )}
      inputComponent={PhoneTextInput}
      numberInputProps={{}}
      labels={{
        FR: "France",
      }}
    />
  );
}

export { InputPhone };
