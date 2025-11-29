import { Result } from '@/core/shared/types/Result'
import { DomainError } from '@/lib/errors'
import { Client } from '../entities/Client'
import { LeadSource } from '../value-objects/LeadSource'
import { PhoneNumber } from '../value-objects/PhoneNumber'
import { Instagram } from '../value-objects/Instagram'

export interface ClientPersistenceDTO {
  id: string
  entityId: string
  name: string
  displayNumber: number
  leadSource?: string | null
  phone?: string | null
  instagram?: string | null
  createdAt?: string | Date
  updatedAt?: string | Date
  isDeleted?: boolean
}

/**
 * Factory to convert raw persistence records to domain aggregates and back
 */
export class ClientFactory {
  public static fromPersistence(dto: ClientPersistenceDTO): Result<Client, DomainError> {
    const leadSourceResult = LeadSource.create(dto.leadSource ?? '')
    if (leadSourceResult.isFailure) {
      return Result.fail(leadSourceResult.error)
    }

    let phone: PhoneNumber | undefined
    if (dto.phone) {
      const phoneResult = PhoneNumber.create(dto.phone)
      if (phoneResult.isFailure) {
        return Result.fail(phoneResult.error)
      }
      phone = phoneResult.value
    }

    let instagram: Instagram | undefined
    if (dto.instagram) {
      const igResult = Instagram.create(dto.instagram)
      if (igResult.isFailure) {
        return Result.fail(igResult.error)
      }
      instagram = igResult.value
    }

    const client = Client.restore({
      id: dto.id,
      entityId: dto.entityId,
      name: dto.name,
      displayNumber: dto.displayNumber,
      leadSource: leadSourceResult.value,
      phone,
      instagram,
      createdAt: dto.createdAt ? new Date(dto.createdAt) : undefined,
      updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : undefined,
      isDeleted: dto.isDeleted ?? false,
    })

    return Result.ok(client)
  }

  public static toPersistence(client: Client): ClientPersistenceDTO {
    const snapshot = client.toPrimitives()

    return {
      id: snapshot.id,
      entityId: snapshot.entityId,
      name: snapshot.name,
      displayNumber: snapshot.displayNumber,
      leadSource: snapshot.leadSource,
      phone: snapshot.phone ?? null,
      instagram: snapshot.instagram ?? null,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
      isDeleted: snapshot.isDeleted,
    }
  }
}
