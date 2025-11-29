import { DomainEvent } from '@/core/shared/domain/DomainEvent'

/**
 * Event Bus Interface
 * Responsible for publishing and subscribing to domain events
 */
export interface IEventBus {
  /**
   * Publish a single domain event
   */
  publish(event: DomainEvent): Promise<void>

  /**
   * Publish multiple domain events
   */
  publishAll(events: DomainEvent[]): Promise<void>

  /**
   * Subscribe to a specific event type
   */
  subscribe<T extends DomainEvent>(eventType: string, handler: (event: T) => Promise<void>): void
}
