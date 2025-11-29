import { DomainEvent } from '@/core/shared/domain/DomainEvent'

export type ClientUpdatedEventChanges = Partial<{
  name: string
  phone: string | null
  instagram: string | null
  leadSource: string
}>

export interface ClientUpdatedEventPayload {
  clientId: string
  entityId: string
  changes: ClientUpdatedEventChanges
}

/**
 * Event emitted when a client's details change
 */
export class ClientUpdatedEvent extends DomainEvent {
  public static readonly EVENT_TYPE = 'client.updated'

  constructor(private readonly payload: ClientUpdatedEventPayload) {
    super()
  }

  public get eventType(): string {
    return ClientUpdatedEvent.EVENT_TYPE
  }

  public get aggregateId(): string {
    return this.payload.clientId
  }

  public get data(): ClientUpdatedEventPayload {
    return this.payload
  }

  public get entityId(): string {
    return this.payload.entityId
  }
}
