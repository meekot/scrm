'use client';

import { useActionState, useEffect } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { signIn } from '../actions';

type FormState = {
  success?: boolean;
  error?: string;
} | null;

export function SignInForm() {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    signIn,
    null
  );

  useEffect(() => {
    if (state?.success) {
      // Use window.location for full page navigation to ensure cookies are sent
      window.location.href = '/dashboard';
    }
  }, [state?.success]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          disabled={isPending}
          autoComplete="email"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          disabled={isPending}
          autoComplete="current-password"
        />
      </div>

      {state?.error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
          {state.error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
}
