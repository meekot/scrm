# Feature: Authentication (Login Only)

**Status**: 🔨 In Development
**Date Started**: 2025-11-29
**Date Completed**: -

---

## Overview

Implement email/password authentication using Supabase Auth. This initial version supports login only (registration will be added later). Users can sign in with their credentials and the system will manage their session.

---

## Requirements

### Functional Requirements
- [ ] User can login with email and password
- [ ] Form validation (email format, required fields)
- [ ] Display authentication errors to user
- [ ] Redirect to dashboard after successful login
- [ ] Session persists across page refreshes
- [ ] User can logout
- [ ] Protected routes require authentication

### Non-Functional Requirements
- [ ] Performance: Login completes in < 2 seconds
- [ ] Security: Passwords never exposed in client code
- [ ] Security: CSRF protection via Supabase tokens
- [ ] Accessibility: Form is keyboard navigable
- [ ] Accessibility: Error messages announced to screen readers

---

## Database Schema

No schema changes needed. Using Supabase's built-in `auth.users` table.

### Existing Auth Tables
- `auth.users` - Supabase managed user authentication
- `public.entity_members` - Links users to entities (already exists)

---

## API Design

### Auth Actions (Server Actions)
```typescript
// Location: src/features/auth/actions.ts

export async function signIn(email: string, password: string): Promise<{ error?: string }>

export async function signOut(): Promise<{ error?: string }>
```

### Queries
```typescript
// Location: src/features/auth/queries.ts

export async function getUser(supabase)

export async function getSession(supabase)
```

---

## UI Components

### Pages
- `/sign-in` - Login page with email/password form

### Components
- `SignInForm` - Email/password login form with validation
  - Location: `src/features/auth/components/SignInForm.tsx`
  - Uses react-hook-form + Zod validation
  - Shows loading state during submission
  - Displays error messages

### Forms
```typescript
// Location: src/features/auth/schemas.ts

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
```

---

## Implementation Checklist

### Core Logic
- [x] Middleware client (`client-middleware.ts`) - Already done
- [ ] Auth actions (`actions.ts`)
- [ ] Auth queries (`queries.ts`)
- [ ] Zod schemas (`schemas.ts`)
- [ ] Export index file (`index.ts`)

### React Integration
- [ ] SignInForm component with validation
- [ ] Error handling and display
- [ ] Loading states
- [ ] Success redirect logic
- [ ] Update sign-in page to use SignInForm

### Quality Assurance
- [ ] Type check passes (`npm run typecheck`)
- [ ] Lint check passes (`npm run lint`)
- [ ] Unit tests for auth actions
- [ ] Unit tests for form validation
- [ ] Integration test for SignInForm
- [ ] Manual test: successful login flow
- [ ] Manual test: failed login (wrong password)
- [ ] Manual test: validation errors
- [ ] Manual test: logout flow

---

## Testing Strategy

### Unit Tests
Location: `src/__tests__/features/auth/`

- [ ] `actions.test.ts` - Test signIn/signOut actions
- [ ] `schemas.test.ts` - Test validation schemas
- [ ] `queries.test.ts` - Test user/session queries

### Integration Tests
- [ ] `SignInForm.test.tsx` - Test form rendering, validation, submission

### Manual Testing Checklist
- [ ] Can login with valid credentials
- [ ] Cannot login with invalid credentials
- [ ] Error messages display correctly
- [ ] Redirects to dashboard after login
- [ ] Session persists on page refresh
- [ ] Can logout successfully
- [ ] Protected routes redirect to sign-in when not authenticated
- [ ] Sign-in page redirects to dashboard when already authenticated

---

## Security Considerations

- [x] RLS policies defined (using existing entity_members policies)
- [ ] Email validation prevents injection
- [ ] Password handled securely by Supabase
- [ ] Session tokens stored in httpOnly cookies
- [ ] CSRF protection via Supabase tokens
- [x] Middleware enforces route protection

---

## Performance Considerations

- [ ] Form validation is client-side (instant feedback)
- [ ] Server action for actual authentication
- [ ] Loading states prevent double submission
- [ ] Session check cached by middleware

---

## Documentation

- [ ] Feature documented in `docs/DEV-WORKFLOW.md`
- [ ] API documented (JSDoc comments)

---

## Notes

- Registration/sign-up will be added in a future feature
- For now, users must be created manually in Supabase dashboard
- Email verification is disabled for development
- Password reset will be added later
