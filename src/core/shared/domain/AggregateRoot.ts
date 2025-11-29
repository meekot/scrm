import { Entity } from './Entity'
import { DomainEvent } from './DomainEvent'

/**
 * Aggregate Root
 * An aggregate is a cluster of domain objects that can be treated as a single unit
 * The aggregate root is the only member of the aggregate that outside objects are allowed to hold references to
 */
export abstract class AggregateRoot<TId = string> extends Entity<TId> {
  private _domainEvents: DomainEvent[] = []

  protected constructor(id: TId, createdAt?: Date, updatedAt?: Date) {
    super(id, createdAt, updatedAt)
  }

  /**
   * Get all domain events
   */
  public getDomainEvents(): DomainEvent[] {
    return this._domainEvents
  }

  /**
   * Add a domain event to the aggregate
   */
  protected addDomainEvent(domainEvent: DomainEvent): void {
    this._domainEvents.push(domainEvent)
    this.touch()
  }

  /**
   * Clear all domain events (typically after they've been published)
   */
  public clearDomainEvents(): void {
    this._domainEvents = []
  }
}
