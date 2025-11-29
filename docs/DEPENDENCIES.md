# SCRM Application Dependencies

## Installation Guide

### Step 1: Install Core Dependencies

```bash
npm install @supabase/supabase-js@latest \
  @supabase/ssr \
  @tanstack/react-query \
  @tanstack/react-query-devtools \
  react-hook-form \
  zod \
  @hookform/resolvers \
  inversify \
  reflect-metadata \
  date-fns \
  class-variance-authority \
  clsx \
  tailwind-merge \
  lucide-react
```

### Step 2: Initialize shadcn/ui

```bash
# This will ask you configuration questions
npx shadcn@latest init
```

**Configuration options (recommended):**

- Style: Default
- Base color: Slate (or your preference)
- CSS variables: Yes
- TypeScript: Yes
- Use React Server Components: Yes
- Location for components: `src/presentation/components/ui`
- Location for utils: `src/lib/utils`
- Tailwind config: tailwind.config.ts
- Import alias: `@/*`

### Step 3: Install shadcn/ui Components

```bash
# Essential components for CRM
npx shadcn@latest add button form input label card table dialog \
  dropdown-menu select calendar popover badge avatar tabs toast \
  alert skeleton sheet command separator switch checkbox radio-group \
  textarea scroll-area
```

### Step 4: Install Development Dependencies

```bash
npm install -D @types/node \
  @types/react \
  @types/react-dom \
  vitest \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  jsdom \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser \
  prettier \
  prettier-plugin-tailwindcss
```

### Step 5: Install Optional but Recommended

```bash
npm install zustand \
  libphonenumber-js \
  recharts \
  sonner \
  @use-gesture/react \
  @tanstack/react-virtual
```

### Step 6: Install External Services (when needed)

```bash
# For SMS notifications
npm install twilio

# For email notifications
npm install resend

# Or alternative: SendGrid
# npm install @sendgrid/mail
```

## Complete Dependencies List

### Production Dependencies

| Package                          | Version | Purpose                                 |
| -------------------------------- | ------- | --------------------------------------- |
| `@supabase/supabase-js`          | latest  | Supabase client for database operations |
| `@supabase/ssr`                  | latest  | Supabase SSR helpers for Next.js        |
| `@tanstack/react-query`          | latest  | Data fetching and caching               |
| `@tanstack/react-query-devtools` | latest  | React Query dev tools                   |
| `react-hook-form`                | latest  | Form state management                   |
| `zod`                            | latest  | Schema validation                       |
| `@hookform/resolvers`            | latest  | Form validation integration             |
| `inversify`                      | latest  | Dependency injection container          |
| `reflect-metadata`               | latest  | Required for inversify decorators       |
| `date-fns`                       | latest  | Date manipulation for appointments      |
| `class-variance-authority`       | latest  | Component variant styling               |
| `clsx`                           | latest  | Conditional className utility           |
| `tailwind-merge`                 | latest  | Merge Tailwind classes                  |
| `lucide-react`                   | latest  | Icon library                            |
| `zustand`                        | latest  | State management (optional)             |
| `libphonenumber-js`              | latest  | Phone number validation                 |
| `recharts`                       | latest  | Charts for analytics                    |
| `sonner`                         | latest  | Toast notifications                     |
| `@use-gesture/react`             | latest  | Touch gestures for mobile               |
| `@tanstack/react-virtual`        | latest  | Virtual scrolling for performance       |
| `twilio`                         | latest  | SMS service integration                 |
| `resend`                         | latest  | Email service integration               |

### Development Dependencies

| Package                            | Version | Purpose                        |
| ---------------------------------- | ------- | ------------------------------ |
| `@types/node`                      | latest  | Node.js TypeScript types       |
| `@types/react`                     | latest  | React TypeScript types         |
| `@types/react-dom`                 | latest  | React DOM TypeScript types     |
| `vitest`                           | latest  | Unit testing framework         |
| `@testing-library/react`           | latest  | React testing utilities        |
| `@testing-library/jest-dom`        | latest  | Custom Jest matchers           |
| `@testing-library/user-event`      | latest  | User interaction simulation    |
| `jsdom`                            | latest  | DOM implementation for testing |
| `@typescript-eslint/eslint-plugin` | latest  | TypeScript ESLint rules        |
| `@typescript-eslint/parser`        | latest  | TypeScript parser for ESLint   |
| `prettier`                         | latest  | Code formatter                 |
| `prettier-plugin-tailwindcss`      | latest  | Tailwind class sorting         |
| `supabase`                         | latest  | Supabase CLI                   |

### shadcn/ui Components

The following components will be installed via `npx shadcn@latest add`:

- **Forms & Inputs**: button, form, input, label, textarea, select, checkbox, radio-group, switch
- **Layout**: card, separator, scroll-area, sheet
- **Navigation**: tabs, dropdown-menu, command
- **Data Display**: table, badge, avatar, calendar
- **Feedback**: dialog, popover, toast, alert, skeleton

## Post-Installation Configuration

### 1. Update tsconfig.json

Ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 2. Create Prettier Config

Create `.prettierrc`:

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### 3. Update package.json Scripts

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write \"**/*.{ts,tsx,json,md}\"",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "types:generate": "supabase gen types typescript --local > src/infrastructure/persistence/supabase/types.ts",
    "supabase:start": "supabase start",
    "supabase:stop": "supabase stop",
    "supabase:reset": "supabase db reset"
  }
}
```

### 4. Environment Variables

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Twilio (for SMS)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Resend (for Email)
RESEND_API_KEY=your_resend_api_key

# App
NODE_ENV=development
```

Create `.env.example`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Twilio (for SMS)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Resend (for Email)
RESEND_API_KEY=

# App
NODE_ENV=development
```

## Verification

After installation, verify everything is installed correctly:

```bash
# Check all dependencies
npm list --depth=0

# Run type checking
npx tsc --noEmit

# Run linting
npm run lint

# Start development server
npm run dev
```

## Mobile-First Specific Considerations

### Additional Mobile Optimizations

```bash
# PWA support (Progressive Web App)
npm install next-pwa

# Mobile gesture library (already included above)
# @use-gesture/react

# Responsive utilities
npm install react-responsive

# Mobile viewport handling
npm install react-device-detect
```

### Mobile Testing Tools

```bash
npm install -D @playwright/test # E2E testing with mobile emulation
```

## Bundle Size Optimization

To keep your mobile app performant:

```bash
# Analyze bundle size
npm install -D @next/bundle-analyzer

# Install only what you need from date-fns
# Use named imports: import { format, addDays } from 'date-fns'
# Tree-shaking will remove unused functions
```

## Notes

- **shadcn/ui** components are installed locally in your project, giving you full control
- Components can be customized directly in `src/presentation/components/ui`
- All dependencies are compatible with Next.js 16 and React 19
- Mobile-first approach is built into Tailwind CSS and shadcn/ui
- Consider lazy loading heavy components (charts, calendar) for better mobile performance
