import { inject, injectable } from 'inversify'
import { IQueryHandler } from '@/application/shared/IQueryHandler'
import type { ClientDTO } from '../dto/ClientDTO'
import { ClientMapper } from '../mappers/ClientMapper'
import type {
  ClientSearchFilters,
  IClientRepository,
} from '@/core/client/domain/repositories/IClientRepository'
import { LeadSource } from '@/core/client/domain/value-objects/LeadSource'
import { PhoneNumber } from '@/core/client/domain/value-objects/PhoneNumber'
import { Instagram } from '@/core/client/domain/value-objects/Instagram'
import { Result } from '@/core/shared/types/Result'
import { DomainError } from '@/lib/errors'
import { CLIENT_TOKENS } from '../tokens'

export interface ListClientsQuery {
  entityId: string
  search?: string
  leadSources?: string[]
  phone?: string
  instagram?: string
  limit?: number
  offset?: number
}

@injectable()
export class ListClientsHandler
  implements IQueryHandler<ListClientsQuery, ClientDTO[], DomainError | Error>
{
  constructor(@inject(CLIENT_TOKENS.ClientRepository) private readonly repository: IClientRepository) {}

  async execute(query: ListClientsQuery): Promise<Result<ClientDTO[], DomainError | Error>> {

    const filtersResult = this.buildFilters(query)
    if (filtersResult.isFailure) {
      return Result.fail(filtersResult.error)
    }



    const clientsResult = await this.repository.search(query.entityId, filtersResult.value)

    console.dir({clientsResult}, {deth: null})

    if (clientsResult.isFailure) {
      return Result.fail(clientsResult.error)
    }

    const dtos = clientsResult.value.map((client) => ClientMapper.toDTO(client))
    return Result.ok(dtos)
  }

  private buildFilters(query: ListClientsQuery): Result<ClientSearchFilters, DomainError> {
    const filters: ClientSearchFilters = {}

    if (query.search) {
      const trimmed = query.search.trim()
      if (trimmed) {
        filters.query = trimmed
      }
    }

    if (query.leadSources && query.leadSources.length > 0) {
      const mappedSources: LeadSource[] = []
      for (const source of query.leadSources) {
        const result = LeadSource.create(source)
        if (result.isFailure) {
          return Result.fail(result.error)
        }
        mappedSources.push(result.value)
      }
      filters.leadSources = mappedSources
    }

    if (query.phone) {
      const phoneResult = PhoneNumber.create(query.phone.trim())
      if (phoneResult.isFailure) {
        return Result.fail(phoneResult.error)
      }
      filters.phone = phoneResult.value
    }

    if (query.instagram) {
      const instagramResult = Instagram.create(query.instagram.trim())
      if (instagramResult.isFailure) {
        return Result.fail(instagramResult.error)
      }
      filters.instagram = instagramResult.value
    }

    if (typeof query.limit === 'number') {
      filters.limit = query.limit
    }

    if (typeof query.offset === 'number') {
      filters.offset = query.offset
    }

    return Result.ok<ClientSearchFilters, DomainError>(filters)
  }
}
