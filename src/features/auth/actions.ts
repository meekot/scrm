'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/shared/supabase/client-server';
import { signInSchema } from './schemas';

type SignInState = {
  success?: boolean;
  error?: string;
} | null;

export async function signIn(prevState: SignInState, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // Validate input
  const validation = signInSchema.safeParse({ email, password });
  if (!validation.success) {
    return {
      error: validation.error.issues[0].message,
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: validation.data.email,
    password: validation.data.password,
  });

  if (error) {
    return {
      error: error.message,
    };
  }

  // Return success - redirect will be handled by client with window.location
  return {
    success: true,
  };
}

export async function signOut() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return {
      error: error.message,
    };
  }

  revalidatePath('/', 'layout');
  redirect('/sign-in');
}
