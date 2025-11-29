import { SignInForm } from '@/features/auth/components/SignInForm';

export default function SignInPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Welcome to SCRM</h1>
        <p className="text-muted-foreground">
          Sign in to manage your beauty business
        </p>
      </div>

      <SignInForm />
    </div>
  );
}
