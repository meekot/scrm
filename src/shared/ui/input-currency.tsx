"use client";

import { forwardRef } from "react";
import { entityDefaults } from "@/shared/config/entity";
import { Input } from "@/shared/ui/input";
import type { InputProps } from "@/shared/ui/input";

type InputCurrencyProps = Omit<InputProps, "type"> & {
  currencySymbol?: string;
};

const symbols: Record<string, string> = {
  EUR: "€",
  USD: "$",
  GBP: "£",
};

const InputCurrency = forwardRef<HTMLInputElement, InputCurrencyProps>(
  ({ className, currencySymbol, onFocus, ...props }, ref) => {
    const symbol = currencySymbol ?? symbols[entityDefaults.currency] ?? "€";

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      // Select all text on focus for easier replacement
      e.target.select();
      // Call original onFocus handler if provided
      onFocus?.(e);
    };

    return (
      <div className="relative">
        <span className="-translate-y-1/2 absolute top-1/2 left-3 text-sm text-muted-foreground">
          {symbol}
        </span>
        <Input
          ref={ref}
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          className={`pl-9 ${className ?? ""}`}
          onFocus={handleFocus}
          {...props}
        />
      </div>
    );
  }
);

InputCurrency.displayName = "InputCurrency";

export { InputCurrency };
