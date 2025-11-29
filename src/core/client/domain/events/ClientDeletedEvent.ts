import { DomainEvent } from '@/core/shared/domain/DomainEvent'

export interface ClientDeletedEventPayload {
  clientId: string
  entityId: string
  displayNumber: number
}

/**
 * Event emitted when a client is deleted/archived
 */
export class ClientDeletedEvent extends DomainEvent {
  public static readonly EVENT_TYPE = 'client.deleted'

  constructor(private readonly payload: ClientDeletedEventPayload) {
    super()
  }

  public get eventType(): string {
    return ClientDeletedEvent.EVENT_TYPE
  }

  public get aggregateId(): string {
    return this.payload.clientId
  }

  public get data(): ClientDeletedEventPayload {
    return this.payload
  }

  public get entityId(): string {
    return this.payload.entityId
  }
}
