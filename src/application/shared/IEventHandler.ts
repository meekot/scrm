import { DomainEvent } from '@/core/shared/domain/DomainEvent'

/**
 * Event Handler Interface
 * All event handlers should implement this interface
 */
export interface IEventHandler<TEvent extends DomainEvent> {
  handle(event: TEvent): Promise<void>
}
