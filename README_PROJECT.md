# SCRM - Modern CRM for Beauty Professionals

**SCRM** is a modular ecosystem of microservices designed for small businesses, especially beauty professionals. The system is built with a strong **Mobile First** philosophy, focusing on simplicity, speed, and scalability.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker (for Supabase local development)
- npm or pnpm

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd scrm
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start Supabase**

   ```bash
   npm run supabase:start
   ```

   This will start:
   - PostgreSQL database
   - Supabase Studio (http://127.0.0.1:54323)
   - Auth server
   - Storage server
   - All required services

4. **Environment setup**
   - Copy `.env.example` to `.env.local` (already done)
   - Update variables if needed (defaults work for local)

5. **Start development server**

   ```bash
   npm run dev
   ```

6. **Open the app**
   - Visit http://localhost:3000
   - Create a test user in Supabase Studio
   - Login with the test user

### Available Scripts

```bash
# Development
npm run dev              # Start Next.js dev server
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
npm run type-check       # TypeScript type checking

# Testing
npm run test             # Run tests
npm run test:ui          # Run tests with UI
npm run test:coverage    # Generate coverage report

# Supabase
npm run supabase:start   # Start Supabase local
npm run supabase:stop    # Stop Supabase
npm run supabase:status  # Check Supabase status
npm run supabase:reset   # Reset database
npm run types:generate   # Generate TypeScript types from DB
```

## 🏗️ Architecture

### Clean Architecture / DDD

The project follows Clean Architecture principles with Domain-Driven Design:

- **Core Layer** - Business logic, entities, value objects
- **Application Layer** - Use cases, CQRS commands/queries
- **Infrastructure Layer** - Database, external services
- **Presentation Layer** - UI components, pages

### CQRS Pattern

Commands (Write) and Queries (Read) are separated:

- **Commands** - Validate through domain, emit events
- **Queries** - Direct database access for performance

### Bounded Contexts

- **Auth** - Authentication & authorization
- **Client** - Client management
- **Appointment** - Scheduling & status
- **Service** - Service catalog
- **Entity** - Multi-tenant organizations
- **Notification** - SMS/Email (future)

## 🗂️ Project Structure

```
/scrm
├── app/                    # Next.js App Router
├── src/
│   ├── core/              # Domain Layer
│   ├── application/       # Use Cases (CQRS)
│   ├── infrastructure/    # External services
│   ├── presentation/      # UI components
│   └── lib/               # Utilities
├── supabase/              # Database migrations
└── docs/                  # Documentation
```

See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed architecture documentation.

## 🔐 Authentication

The app uses Supabase Auth with role-based access control:

**Roles:**

- **SUPERADMIN** - Platform administrators
- **OWNER** - Entity owner
- **ADMIN** - Entity administrator
- **STAFF** - Entity staff member

Multi-tenant architecture allows users to belong to multiple entities with different roles.

See [AUTH_COMPLETE.md](docs/summaries/AUTH_COMPLETE.md) for details.

## 🎨 UI Components

Built with shadcn/ui - 26 mobile-first components:

- Forms, inputs, buttons
- Tables, cards, dialogs
- Calendar, badges, avatars
- Toast notifications

All components are customizable and located in `src/presentation/components/ui/`.

## 📱 Mobile First

Every component and page is designed mobile-first:

- Responsive design with Tailwind CSS
- Touch-friendly interactions
- Optimized for small screens
- Progressive enhancement

## 🛠️ Tech Stack

### Core

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling

### Backend

- **Supabase** - Database, Auth, Storage
- **PostgreSQL** - Database

### State & Data

- **React Query** - Data fetching
- **Zod** - Validation
- **React Hook Form** - Form handling

### Architecture

- **InversifyJS** - Dependency injection
- **CQRS** - Command/Query separation
- **DDD** - Domain-driven design

### UI Components

- **shadcn/ui** - Component library
- **Lucide React** - Icons
- **Sonner** - Toast notifications

## 📚 Documentation

- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - System architecture & design patterns
- [DEPENDENCIES.md](docs/DEPENDENCIES.md) - Complete dependency list
- [summaries/](docs/summaries/) - Development session summaries
  - FOUNDATION_COMPLETE.md - Foundation setup
  - AUTH_COMPLETE.md - Authentication system
  - SESSION_SUMMARY.md - Development session overview

## 🧪 Testing

Create a test user in Supabase Studio:

1. Open http://127.0.0.1:54323
2. Go to Authentication → Users
3. Click "Add user"
4. Enter email and password
5. Save

Then login at http://localhost:3000

## 🚀 Development Workflow

1. Start Supabase: `npm run supabase:start`
2. Start dev server: `npm run dev`
3. Make changes
4. Format code: `npm run format`
5. Check types: `npm run type-check`
6. Run tests: `npm run test`

## 🔜 Next Steps

### High Priority

- [ ] Entity onboarding flow
- [ ] Row Level Security (RLS) policies
- [ ] Client management CRUD

### Short Term

- [ ] Appointment scheduling
- [ ] Service catalog management
- [ ] Entity member management

### Future

- [ ] Notification system (SMS/Email)
- [ ] Analytics dashboard
- [ ] Calendar view
- [ ] Payment integration

See [SESSION_SUMMARY.md](docs/summaries/SESSION_SUMMARY.md) for detailed roadmap.

## 📄 License

Private project

## 👥 Team

Built with modern architecture principles and AI-powered development.

---

**Status**: Foundation Complete ✅
**Last Updated**: 2025-11-29
