import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SignInForm } from '@/features/auth/components/SignInForm';

describe('SignInForm', () => {
  it('should render email and password fields', () => {
    render(<SignInForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('should render submit button', () => {
    render(<SignInForm />);

    const button = screen.getByRole('button', { name: /sign in/i });
    expect(button).toBeInTheDocument();
  });

  it('should have email input with proper attributes', () => {
    render(<SignInForm />);

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('name', 'email');
    expect(emailInput).toHaveAttribute('required');
    expect(emailInput).toHaveAttribute('autocomplete', 'email');
  });

  it('should have password input with proper attributes', () => {
    render(<SignInForm />);

    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveAttribute('name', 'password');
    expect(passwordInput).toHaveAttribute('required');
    expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
  });
});
