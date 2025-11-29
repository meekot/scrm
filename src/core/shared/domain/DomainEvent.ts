/**
 * Base Domain Event class
 * Domain Events represent something that happened in the domain that domain experts care about
 */
export abstract class DomainEvent {
  public readonly occurredOn: Date
  public readonly eventId: string

  protected constructor() {
    this.occurredOn = new Date()
    this.eventId = crypto.randomUUID()
  }

  /**
   * The type/name of the event
   */
  public abstract get eventType(): string

  /**
   * The aggregate ID this event belongs to
   */
  public abstract get aggregateId(): string
}
