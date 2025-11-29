# SCRM Application Architecture

## Overview

This document describes the architecture for the SCRM (CRM) application built with Next.js 16 and Supabase. The architecture follows modern software engineering principles including Clean Architecture, Domain-Driven Design (DDD), CQRS, Event Sourcing, and GRASP principles.

## Core Principles & Patterns

### Layered Architecture (Clean/Hexagonal)

```
┌─────────────────────────────────────────┐
│   Presentation Layer (Next.js)          │
│   - Pages/Routes (App Router)           │
│   - Components (React)                  │
│   - View Models                         │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│   Application Layer                     │
│   - Use Cases (Commands/Queries)        │
│   - DTOs & Mappers                      │
│   - Application Services                │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│   Domain Layer (Business Logic)         │
│   - Entities & Aggregates               │
│   - Value Objects                       │
│   - Domain Events                       │
│   - Domain Services                     │
│   - Repository Interfaces               │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│   Infrastructure Layer                  │
│   - Supabase Repositories               │
│   - Event Store                         │
│   - External Services (SMS, Email)      │
│   - Type Generation                     │
└─────────────────────────────────────────┘
```

### CQRS Pattern

- **Commands**: Write operations (Create, Update, Delete) → go through domain validation
- **Queries**: Read operations → optimized read models, bypass domain layer
- **Event Store**: Critical operations emit domain events for audit & event sourcing

### DDD Bounded Contexts

The application is organized into the following bounded contexts:

- **Customer Context**: Customer management, profiles
- **Appointment Context**: Scheduling, reminders, calendar
- **Notification Context**: SMS, Email, Push notifications
- **Analytics Context**: Reporting, metrics
- **Identity Context**: Authentication, Authorization

## Folder Structure

```
/scrm
├── app/                              # Next.js App Router (Presentation Layer)
│   ├── (auth)/                       # Route groups for layout isolation
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/                  # Protected routes
│   │   ├── customers/
│   │   ├── appointments/
│   │   └── analytics/
│   ├── api/                          # API Routes (thin adapters)
│   │   ├── commands/                 # Write operations
│   │   │   ├── customers/
│   │   │   └── appointments/
│   │   ├── queries/                  # Read operations
│   │   │   ├── customers/
│   │   │   └── appointments/
│   │   └── webhooks/                 # Supabase webhooks, external services
│   ├── layout.tsx
│   └── providers.tsx                 # React context providers
│
├── src/
│   ├── core/                         # Domain Layer (Pure business logic)
│   │   ├── customer/                 # Customer Bounded Context
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── Customer.ts
│   │   │   │   │   └── CustomerAggregate.ts
│   │   │   │   ├── value-objects/
│   │   │   │   │   ├── Email.ts
│   │   │   │   │   ├── PhoneNumber.ts
│   │   │   │   │   └── CustomerId.ts
│   │   │   │   ├── events/
│   │   │   │   │   ├── CustomerCreated.ts
│   │   │   │   │   ├── CustomerUpdated.ts
│   │   │   │   │   └── CustomerDeleted.ts
│   │   │   │   ├── services/
│   │   │   │   │   └── CustomerDomainService.ts
│   │   │   │   └── repositories/
│   │   │   │       └── ICustomerRepository.ts (interface)
│   │   │   └── index.ts
│   │   │
│   │   ├── appointment/              # Appointment Bounded Context
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── Appointment.ts
│   │   │   │   │   └── AppointmentAggregate.ts
│   │   │   │   ├── value-objects/
│   │   │   │   │   ├── AppointmentId.ts
│   │   │   │   │   ├── TimeSlot.ts
│   │   │   │   │   └── AppointmentStatus.ts
│   │   │   │   ├── events/
│   │   │   │   │   ├── AppointmentScheduled.ts
│   │   │   │   │   ├── AppointmentCancelled.ts
│   │   │   │   │   └── AppointmentCompleted.ts
│   │   │   │   ├── services/
│   │   │   │   │   └── AppointmentSchedulingService.ts
│   │   │   │   └── repositories/
│   │   │   │       └── IAppointmentRepository.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── notification/             # Notification Bounded Context
│   │   │   └── domain/
│   │   │       ├── entities/
│   │   │       ├── events/
│   │   │       └── services/
│   │   │
│   │   └── shared/                   # Shared kernel
│   │       ├── domain/
│   │       │   ├── Entity.ts         # Base entity class
│   │       │   ├── ValueObject.ts    # Base value object
│   │       │   ├── DomainEvent.ts    # Base domain event
│   │       │   └── AggregateRoot.ts  # Base aggregate root
│   │       └── types/
│   │           └── Result.ts         # Result<T, E> type for error handling
│   │
│   ├── application/                  # Application Layer (Use Cases)
│   │   ├── customer/
│   │   │   ├── commands/             # CQRS Commands
│   │   │   │   ├── CreateCustomerCommand.ts
│   │   │   │   ├── CreateCustomerHandler.ts
│   │   │   │   ├── UpdateCustomerCommand.ts
│   │   │   │   └── UpdateCustomerHandler.ts
│   │   │   ├── queries/              # CQRS Queries
│   │   │   │   ├── GetCustomerQuery.ts
│   │   │   │   ├── GetCustomerHandler.ts
│   │   │   │   ├── ListCustomersQuery.ts
│   │   │   │   └── ListCustomersHandler.ts
│   │   │   ├── dto/                  # Data Transfer Objects
│   │   │   │   ├── CustomerDTO.ts
│   │   │   │   └── CreateCustomerDTO.ts
│   │   │   └── mappers/
│   │   │       └── CustomerMapper.ts
│   │   │
│   │   ├── appointment/
│   │   │   ├── commands/
│   │   │   ├── queries/
│   │   │   ├── dto/
│   │   │   └── mappers/
│   │   │
│   │   └── shared/
│   │       ├── ICommandHandler.ts
│   │       ├── IQueryHandler.ts
│   │       └── IEventHandler.ts
│   │
│   ├── infrastructure/               # Infrastructure Layer
│   │   ├── persistence/
│   │   │   ├── supabase/
│   │   │   │   ├── client.ts        # Supabase client setup
│   │   │   │   ├── types.ts         # Generated types from Supabase CLI
│   │   │   │   ├── repositories/
│   │   │   │   │   ├── SupabaseCustomerRepository.ts
│   │   │   │   │   └── SupabaseAppointmentRepository.ts
│   │   │   │   └── migrations/      # Symlink or reference to /supabase/migrations
│   │   │   └── event-store/
│   │   │       ├── SupabaseEventStore.ts
│   │   │       └── EventStoreRepository.ts
│   │   │
│   │   ├── messaging/               # External services
│   │   │   ├── sms/
│   │   │   │   ├── ISmsService.ts
│   │   │   │   └── TwilioSmsService.ts
│   │   │   └── email/
│   │   │       ├── IEmailService.ts
│   │   │       └── ResendEmailService.ts
│   │   │
│   │   ├── event-bus/
│   │   │   ├── IEventBus.ts
│   │   │   ├── SupabaseEventBus.ts  # Using Supabase Realtime/Postgres triggers
│   │   │   └── event-handlers/
│   │   │       └── AppointmentReminderHandler.ts
│   │   │
│   │   └── config/
│   │       ├── env.ts               # Type-safe env variables (using Zod)
│   │       └── di-container.ts      # Dependency injection setup
│   │
│   ├── presentation/                # Presentation helpers
│   │   ├── components/              # Shared UI components
│   │   │   ├── ui/                  # shadcn/ui components
│   │   │   ├── features/
│   │   │   │   ├── customers/
│   │   │   │   │   ├── CustomerList.tsx
│   │   │   │   │   ├── CustomerForm.tsx
│   │   │   │   │   └── useCustomers.ts
│   │   │   │   └── appointments/
│   │   │   │       ├── AppointmentCalendar.tsx
│   │   │   │       └── useAppointments.ts
│   │   │   └── layouts/
│   │   │
│   │   ├── hooks/                   # Shared React hooks
│   │   │   ├── useCommand.ts        # Hook for executing commands
│   │   │   ├── useQuery.ts          # Hook for executing queries
│   │   │   └── useEventSubscription.ts
│   │   │
│   │   ├── view-models/             # View models for UI state
│   │   │   ├── CustomerViewModel.ts
│   │   │   └── AppointmentViewModel.ts
│   │   │
│   │   └── validators/              # Zod schemas for form validation
│   │       ├── customerSchemas.ts
│   │       └── appointmentSchemas.ts
│   │
│   └── lib/                         # Shared utilities
│       ├── errors/
│       │   ├── AppError.ts
│       │   ├── DomainError.ts
│       │   └── ValidationError.ts
│       ├── logger/
│       │   └── logger.ts
│       └── utils/
│           ├── date.ts
│           └── format.ts
│
├── supabase/                        # Supabase configuration
│   ├── config.toml
│   ├── migrations/                  # SQL migrations
│   ├── functions/                   # Edge functions for event handling
│   │   └── appointment-reminder/
│   └── seed.sql
│
├── tests/
│   ├── unit/
│   │   ├── core/                    # Domain tests
│   │   └── application/             # Use case tests
│   ├── integration/
│   │   └── infrastructure/          # Repository tests
│   └── e2e/
│
├── .env.local                       # Local environment variables
├── .env.example
├── next.config.ts
├── tsconfig.json
└── package.json
```

## Key Architecture Decisions

### 1. Type Safety with Supabase

```typescript
// src/infrastructure/persistence/supabase/types.ts
// Generated using: npx supabase gen types typescript --local > src/infrastructure/persistence/supabase/types.ts

import { Database } from './types'

export type Tables = Database['public']['Tables']
export type Customer = Tables['customers']['Row']
export type CustomerInsert = Tables['customers']['Insert']
export type CustomerUpdate = Tables['customers']['Update']
```

### 2. GRASP Principles Implementation

- **Information Expert**: Entities know their own validation logic
- **Creator**: Factories create complex aggregates
- **Controller**: Use case handlers act as controllers
- **Low Coupling**: Dependencies through interfaces (ports)
- **High Cohesion**: Bounded contexts group related logic
- **Polymorphism**: Repository interfaces with multiple implementations
- **Pure Fabrication**: Application services for orchestration
- **Indirection**: Event bus for decoupling
- **Protected Variations**: Interfaces shield from external changes

### 3. CQRS Implementation

#### Commands (Write)

```typescript
// src/application/customer/commands/CreateCustomerCommand.ts
export class CreateCustomerCommand {
  constructor(
    public readonly data: {
      email: string
      name: string
      phone: string
    }
  ) {}
}

// Handler
export class CreateCustomerHandler {
  async execute(command: CreateCustomerCommand): Promise<Result<Customer, DomainError>> {
    // 1. Create domain entity
    // 2. Validate business rules
    // 3. Persist via repository
    // 4. Emit domain events
  }
}
```

#### Queries (Read)

```typescript
// src/application/customer/queries/GetCustomerQuery.ts
export class GetCustomerQuery {
  constructor(public readonly customerId: string) {}
}

// Handler - direct DB access for performance
export class GetCustomerHandler {
  async execute(query: GetCustomerQuery): Promise<CustomerDTO | null> {
    // Direct Supabase query, no domain logic
  }
}
```

### 4. Event Sourcing for Critical Operations

```typescript
// src/core/shared/domain/DomainEvent.ts
export abstract class DomainEvent {
  readonly occurredOn: Date
  readonly eventId: string
  abstract readonly eventType: string
}

// src/infrastructure/persistence/event-store/SupabaseEventStore.ts
export class SupabaseEventStore {
  async append(events: DomainEvent[]): Promise<void>
  async getEvents(aggregateId: string): Promise<DomainEvent[]>
}
```

### 5. Dependency Injection Container

```typescript
// src/infrastructure/config/di-container.ts
import { Container } from 'inversify' // or tsyringe

container.bind<ICustomerRepository>(TYPES.CustomerRepository).to(SupabaseCustomerRepository)

container.bind<ISmsService>(TYPES.SmsService).to(TwilioSmsService)
```

### 6. Next.js Integration

```typescript
// app/api/commands/customers/route.ts
import { CreateCustomerHandler } from '@/application/customer/commands'

export async function POST(request: Request) {
  const handler = container.get<CreateCustomerHandler>()
  const result = await handler.execute(command)

  return result.isSuccess
    ? Response.json(result.value)
    : Response.json(result.error, { status: 400 })
}
```

### 7. React Integration with Hooks

```typescript
// src/presentation/hooks/useCommand.ts
export function useCommand<TCommand, TResult>() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const execute = async (command: TCommand) => {
    // Execute command via API
  }

  return { execute, loading, error }
}
```

## Implementation Examples

### Example 1: Domain Entity (Customer Aggregate)

```typescript
// src/core/customer/domain/entities/CustomerAggregate.ts
import { AggregateRoot } from '@/core/shared/domain/AggregateRoot'
import { Email } from '../value-objects/Email'
import { PhoneNumber } from '../value-objects/PhoneNumber'
import { CustomerCreated } from '../events/CustomerCreated'
import { Result } from '@/core/shared/types/Result'

export class CustomerAggregate extends AggregateRoot {
  private constructor(
    id: string,
    private _email: Email,
    private _name: string,
    private _phone: PhoneNumber,
    private _createdAt: Date
  ) {
    super(id)
  }

  static create(props: {
    email: string
    name: string
    phone: string
  }): Result<CustomerAggregate, Error> {
    // Validate email
    const emailResult = Email.create(props.email)
    if (emailResult.isFailure) {
      return Result.fail(emailResult.error)
    }

    // Validate phone
    const phoneResult = PhoneNumber.create(props.phone)
    if (phoneResult.isFailure) {
      return Result.fail(phoneResult.error)
    }

    // Business rule: name must be at least 2 characters
    if (props.name.trim().length < 2) {
      return Result.fail(new Error('Name must be at least 2 characters'))
    }

    const customer = new CustomerAggregate(
      crypto.randomUUID(),
      emailResult.value,
      props.name,
      phoneResult.value,
      new Date()
    )

    // Emit domain event
    customer.addDomainEvent(
      new CustomerCreated(customer.id, customer._email.value, customer._name, customer._phone.value)
    )

    return Result.ok(customer)
  }

  // Getters
  get email(): Email {
    return this._email
  }
  get name(): string {
    return this._name
  }
  get phone(): PhoneNumber {
    return this._phone
  }

  // Business methods
  updateEmail(newEmail: string): Result<void, Error> {
    const emailResult = Email.create(newEmail)
    if (emailResult.isFailure) {
      return Result.fail(emailResult.error)
    }

    this._email = emailResult.value
    // Emit CustomerEmailUpdated event
    return Result.ok()
  }
}
```

### Example 2: Value Object (Email)

```typescript
// src/core/customer/domain/value-objects/Email.ts
import { ValueObject } from '@/core/shared/domain/ValueObject'
import { Result } from '@/core/shared/types/Result'

interface EmailProps {
  value: string
}

export class Email extends ValueObject<EmailProps> {
  private constructor(props: EmailProps) {
    super(props)
  }

  static create(email: string): Result<Email, Error> {
    if (!email || email.trim().length === 0) {
      return Result.fail(new Error('Email cannot be empty'))
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return Result.fail(new Error('Invalid email format'))
    }

    return Result.ok(new Email({ value: email.toLowerCase() }))
  }

  get value(): string {
    return this.props.value
  }
}
```

### Example 3: Repository Interface

```typescript
// src/core/customer/domain/repositories/ICustomerRepository.ts
import { CustomerAggregate } from '../entities/CustomerAggregate'
import { Result } from '@/core/shared/types/Result'

export interface ICustomerRepository {
  save(customer: CustomerAggregate): Promise<Result<void, Error>>
  findById(id: string): Promise<Result<CustomerAggregate | null, Error>>
  findByEmail(email: string): Promise<Result<CustomerAggregate | null, Error>>
  delete(id: string): Promise<Result<void, Error>>
}
```

### Example 4: Supabase Repository Implementation

```typescript
// src/infrastructure/persistence/supabase/repositories/SupabaseCustomerRepository.ts
import { ICustomerRepository } from '@/core/customer/domain/repositories/ICustomerRepository'
import { CustomerAggregate } from '@/core/customer/domain/entities/CustomerAggregate'
import { supabase } from '../client'
import { CustomerInsert } from '../types'
import { Result } from '@/core/shared/types/Result'

export class SupabaseCustomerRepository implements ICustomerRepository {
  async save(customer: CustomerAggregate): Promise<Result<void, Error>> {
    try {
      const data: CustomerInsert = {
        id: customer.id,
        email: customer.email.value,
        name: customer.name,
        phone: customer.phone.value,
        created_at: new Date().toISOString(),
      }

      const { error } = await supabase.from('customers').upsert(data)

      if (error) {
        return Result.fail(new Error(error.message))
      }

      return Result.ok()
    } catch (error) {
      return Result.fail(error as Error)
    }
  }

  async findById(id: string): Promise<Result<CustomerAggregate | null, Error>> {
    try {
      const { data, error } = await supabase.from('customers').select('*').eq('id', id).single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Not found
          return Result.ok(null)
        }
        return Result.fail(new Error(error.message))
      }

      // Map to domain entity
      const customerResult = CustomerAggregate.create({
        email: data.email,
        name: data.name,
        phone: data.phone,
      })

      if (customerResult.isFailure) {
        return Result.fail(customerResult.error)
      }

      return Result.ok(customerResult.value)
    } catch (error) {
      return Result.fail(error as Error)
    }
  }

  async findByEmail(email: string): Promise<Result<CustomerAggregate | null, Error>> {
    // Similar implementation
  }

  async delete(id: string): Promise<Result<void, Error>> {
    // Implementation
  }
}
```

### Example 5: Command Handler

```typescript
// src/application/customer/commands/CreateCustomerHandler.ts
import { ICustomerRepository } from '@/core/customer/domain/repositories/ICustomerRepository'
import { CustomerAggregate } from '@/core/customer/domain/entities/CustomerAggregate'
import { CreateCustomerCommand } from './CreateCustomerCommand'
import { IEventBus } from '@/infrastructure/event-bus/IEventBus'
import { Result } from '@/core/shared/types/Result'
import { CustomerDTO } from '../dto/CustomerDTO'

export class CreateCustomerHandler {
  constructor(
    private readonly customerRepository: ICustomerRepository,
    private readonly eventBus: IEventBus
  ) {}

  async execute(command: CreateCustomerCommand): Promise<Result<CustomerDTO, Error>> {
    // 1. Check if customer already exists
    const existingResult = await this.customerRepository.findByEmail(command.data.email)
    if (existingResult.isFailure) {
      return Result.fail(existingResult.error)
    }

    if (existingResult.value !== null) {
      return Result.fail(new Error('Customer with this email already exists'))
    }

    // 2. Create domain entity
    const customerResult = CustomerAggregate.create({
      email: command.data.email,
      name: command.data.name,
      phone: command.data.phone,
    })

    if (customerResult.isFailure) {
      return Result.fail(customerResult.error)
    }

    const customer = customerResult.value

    // 3. Persist
    const saveResult = await this.customerRepository.save(customer)
    if (saveResult.isFailure) {
      return Result.fail(saveResult.error)
    }

    // 4. Publish domain events
    await this.eventBus.publishAll(customer.getDomainEvents())
    customer.clearDomainEvents()

    // 5. Return DTO
    return Result.ok({
      id: customer.id,
      email: customer.email.value,
      name: customer.name,
      phone: customer.phone.value,
    })
  }
}
```

### Example 6: Query Handler (Optimized Read)

```typescript
// src/application/customer/queries/ListCustomersHandler.ts
import { supabase } from '@/infrastructure/persistence/supabase/client'
import { CustomerDTO } from '../dto/CustomerDTO'
import { Result } from '@/core/shared/types/Result'

export class ListCustomersHandler {
  async execute(query: ListCustomersQuery): Promise<Result<CustomerDTO[], Error>> {
    try {
      // Direct database query - bypassing domain layer for read performance
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })
        .range(query.offset, query.offset + query.limit - 1)

      if (error) {
        return Result.fail(new Error(error.message))
      }

      const dtos = data.map((row) => ({
        id: row.id,
        email: row.email,
        name: row.name,
        phone: row.phone,
        createdAt: row.created_at,
      }))

      return Result.ok(dtos)
    } catch (error) {
      return Result.fail(error as Error)
    }
  }
}
```

### Example 7: Next.js API Route (CQRS Endpoint)

```typescript
// app/api/commands/customers/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { CreateCustomerHandler } from '@/application/customer/commands/CreateCustomerHandler'
import { CreateCustomerCommand } from '@/application/customer/commands/CreateCustomerCommand'
import { z } from 'zod'
import { container } from '@/infrastructure/config/di-container'

const createCustomerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  phone: z.string().min(10),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validationResult = createCustomerSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error.errors }, { status: 400 })
    }

    // Execute command
    const handler = container.get<CreateCustomerHandler>('CreateCustomerHandler')
    const command = new CreateCustomerCommand(validationResult.data)
    const result = await handler.execute(command)

    if (result.isFailure) {
      return NextResponse.json({ error: result.error.message }, { status: 400 })
    }

    return NextResponse.json(result.value, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### Example 8: React Hook for Commands

```typescript
// src/presentation/hooks/useCreateCustomer.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CreateCustomerDTO } from '@/application/customer/dto/CreateCustomerDTO'

export function useCreateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateCustomerDTO) => {
      const response = await fetch('/api/commands/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error)
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate customers query
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}
```

### Example 9: Event Handler (Appointment Reminder)

```typescript
// src/infrastructure/event-bus/event-handlers/AppointmentReminderHandler.ts
import { IEventHandler } from '@/application/shared/IEventHandler'
import { AppointmentScheduled } from '@/core/appointment/domain/events/AppointmentScheduled'
import { ISmsService } from '@/infrastructure/messaging/sms/ISmsService'

export class AppointmentReminderHandler implements IEventHandler<AppointmentScheduled> {
  constructor(private readonly smsService: ISmsService) {}

  async handle(event: AppointmentScheduled): Promise<void> {
    // Schedule SMS reminder 24 hours before appointment
    const reminderTime = new Date(event.appointmentTime)
    reminderTime.setHours(reminderTime.getHours() - 24)

    // Use Supabase Edge Function or pg_cron for scheduling
    await this.scheduleReminder(event, reminderTime)
  }

  private async scheduleReminder(event: AppointmentScheduled, time: Date): Promise<void> {
    // Implementation using Supabase Edge Functions
  }
}
```

### Example 10: Environment Configuration (Type-safe)

```typescript
// src/infrastructure/config/env.ts
import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  TWILIO_ACCOUNT_SID: z.string(),
  TWILIO_AUTH_TOKEN: z.string(),
  TWILIO_PHONE_NUMBER: z.string(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
})

export const env = envSchema.parse(process.env)
```

## Implementation Roadmap

### Phase 1: Foundation Setup

1. Configure Supabase type generation
2. Set up base domain classes (Entity, ValueObject, AggregateRoot)
3. Implement Result type for error handling
4. Configure dependency injection
5. Set up environment configuration with Zod

### Phase 2: First Bounded Context (Customer)

1. Define Customer domain model
2. Implement Customer repository
3. Create CQRS commands/queries
4. Build API routes
5. Create UI components

### Phase 3: Event Infrastructure

1. Set up Event Store
2. Implement Event Bus (Supabase Realtime)
3. Create event handlers

### Phase 4: Additional Contexts

1. Appointment management
2. Notification system
3. Analytics/Reporting

## Additional Recommendations

### Required Dependencies

```bash
npm install zod @tanstack/react-query inversify reflect-metadata
npm install -D @supabase/supabase-js
```

### Supabase Type Generation Script

Add to `package.json`:

```json
{
  "scripts": {
    "types:generate": "supabase gen types typescript --local > src/infrastructure/persistence/supabase/types.ts"
  }
}
```

### Database Migration Strategy

- Use Supabase migrations for schema changes
- Event store table for event sourcing
- Separate read models (materialized views) for CQRS queries

### Testing Strategy

- **Unit tests**: Domain entities and value objects (pure logic)
- **Integration tests**: Repositories with Supabase
- **E2E tests**: Full user flows

## Architecture Benefits

- **Scalable**: Easy to add new bounded contexts
- **Testable**: Domain logic isolated from infrastructure
- **Maintainable**: Clear separation of concerns
- **Type-safe**: Full TypeScript coverage with generated Supabase types
- **Event-driven**: Ready for SMS notifications, analytics, and integrations
- **SOLID Principles**: Single responsibility, open/closed, dependency inversion
- **Clean Code**: Self-documenting, minimal cognitive load
