import { Result } from '@/core/shared/types/Result'
import { Client } from '../entities/Client'
import { PhoneNumber } from '../value-objects/PhoneNumber'
import { Instagram } from '../value-objects/Instagram'
import { LeadSource } from '../value-objects/LeadSource'

export interface ClientSearchFilters {
  query?: string
  leadSources?: LeadSource[]
  phone?: PhoneNumber
  instagram?: Instagram
  limit?: number
  offset?: number
}

/**
 * Client Repository Interface
 * Defines persistence operations for the client aggregate
 */
export interface IClientRepository {
  findById(entityId: string, clientId: string): Promise<Result<Client | null, Error>>

  findByDisplayNumber(
    entityId: string,
    displayNumber: number
  ): Promise<Result<Client | null, Error>>

  search(entityId: string, filters?: ClientSearchFilters): Promise<Result<Client[], Error>>

  save(client: Client): Promise<Result<void, Error>>

  delete(entityId: string, clientId: string): Promise<Result<void, Error>>

  /**
   * Provides the next sequential display number scoped to an entity
   */
  getNextDisplayNumber(entityId: string): Promise<Result<number, Error>>
}
