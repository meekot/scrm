import { DomainEvent } from '@/core/shared/domain/DomainEvent'

export interface ClientCreatedEventPayload {
  clientId: string
  entityId: string
  name: string
  displayNumber: number
  leadSource: string
  phone?: string | null
  instagram?: string | null
  createdAt: Date
  updatedAt: Date
}

/**
 * Event emitted when a client is created
 */
export class ClientCreatedEvent extends DomainEvent {
  public static readonly EVENT_TYPE = 'client.created'

  constructor(private readonly payload: ClientCreatedEventPayload) {
    super()
  }

  public get eventType(): string {
    return ClientCreatedEvent.EVENT_TYPE
  }

  public get aggregateId(): string {
    return this.payload.clientId
  }

  public get data(): ClientCreatedEventPayload {
    return this.payload
  }

  public get entityId(): string {
    return this.payload.entityId
  }
}
