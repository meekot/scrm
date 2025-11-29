import { injectable } from 'inversify'
import { supabaseAdmin } from '../admin'
import type { Database } from '../types'
import { Result } from '@/core/shared/types/Result'
import type { Client } from '@/core/client/domain/entities/Client'
import type {
  ClientSearchFilters,
  IClientRepository,
} from '@/core/client/domain/repositories/IClientRepository'
import { ClientFactory } from '@/core/client/domain/services/ClientFactory'
import { DomainError } from '@/lib/errors'

type ClientRow = Database['public']['Tables']['clients']['Row']

@injectable()
export class SupabaseClientRepository implements IClientRepository {
  async findById(entityId: string, clientId: string): Promise<Result<Client | null, Error>> {
    try {
      const { data, error } = await supabaseAdmin
        .from('clients')
        .select('*')
        .eq('entity_id', entityId)
        .eq('id', clientId)
        .maybeSingle()

      if (error) {
        return Result.fail(error)
      }

      if (!data) {
        return Result.ok(null)
      }

      const domainResult = this.toDomain(data)
      if (domainResult.isFailure) {
        return Result.fail(domainResult.error)
      }

      return Result.ok(domainResult.value)
    } catch (error) {
      return Result.fail(error as Error)
    }
  }

  async findByDisplayNumber(
    entityId: string,
    displayNumber: number
  ): Promise<Result<Client | null, Error>> {
    try {
      const { data, error } = await supabaseAdmin
        .from('clients')
        .select('*')
        .eq('entity_id', entityId)
        .eq('display_number', displayNumber)
        .maybeSingle()

      if (error) {
        return Result.fail(error)
      }

      if (!data) {
        return Result.ok(null)
      }

      const domainResult = this.toDomain(data)
      if (domainResult.isFailure) {
        return Result.fail(domainResult.error)
      }

      return Result.ok(domainResult.value)
    } catch (error) {
      return Result.fail(error as Error)
    }
  }

  async search(entityId: string, filters?: ClientSearchFilters): Promise<Result<Client[], Error>> {
    try {
      let queryBuilder = supabaseAdmin
        .from('clients')
        .select('*')
        .eq('entity_id', entityId)
        .order('display_number', { ascending: true })

      if (filters?.query) {
        queryBuilder = queryBuilder.ilike('name', `%${filters.query}%`)
      }

      if (filters?.leadSources && filters.leadSources.length > 0) {
        queryBuilder = queryBuilder.in(
          'lead_source',
          filters.leadSources.map((source) => source.value)
        )
      }

      if (filters?.phone) {
        queryBuilder = queryBuilder.eq('phone', filters.phone.value)
      }

      if (filters?.instagram) {
        queryBuilder = queryBuilder.eq('instagram', filters.instagram.handle)
      }

      if (typeof filters?.offset === 'number' && typeof filters?.limit === 'number') {
        queryBuilder = queryBuilder.range(
          filters.offset,
          filters.offset + Math.max(filters.limit - 1, 0)
        )
      } else if (typeof filters?.limit === 'number') {
        queryBuilder = queryBuilder.limit(filters.limit)
      }

      const { data, error } = await queryBuilder

      if (error) {
        return Result.fail(error)
      }

      const clients: Client[] = []
      for (const row of data) {
        const domainResult = this.toDomain(row)
        if (domainResult.isFailure) {
          return Result.fail(domainResult.error)
        }
        clients.push(domainResult.value)
      }

      return Result.ok(clients)
    } catch (error) {
      return Result.fail(error as Error)
    }
  }

  async save(client: Client): Promise<Result<void, Error>> {
    try {
      const dto = ClientFactory.toPersistence(client)
      const { error } = await supabaseAdmin.from('clients').upsert(
        {
          id: dto.id,
          entity_id: dto.entityId,
          name: dto.name,
          display_number: dto.displayNumber,
          lead_source: dto.leadSource,
          phone: dto.phone,
          instagram: dto.instagram,
          created_at: this.toTimestamp(dto.createdAt),
          updated_at: this.toTimestamp(dto.updatedAt),
        },
        { onConflict: 'id' }
      )

      if (error) {
        return Result.fail(error)
      }

      return Result.ok()
    } catch (error) {
      return Result.fail(error as Error)
    }
  }

  async delete(entityId: string, clientId: string): Promise<Result<void, Error>> {
    try {
      const { error } = await supabaseAdmin
        .from('clients')
        .delete()
        .eq('entity_id', entityId)
        .eq('id', clientId)

      if (error) {
        return Result.fail(error)
      }

      return Result.ok()
    } catch (error) {
      return Result.fail(error as Error)
    }
  }

  async getNextDisplayNumber(entityId: string): Promise<Result<number, Error>> {
    try {
      const { data, error } = await supabaseAdmin
        .from('clients')
        .select('display_number')
        .eq('entity_id', entityId)
        .order('display_number', { ascending: false })
        .limit(1)

      if (error) {
        return Result.fail(error)
      }

      const next = data && data.length > 0 ? data[0].display_number + 1 : 1
      return Result.ok(next)
    } catch (error) {
      return Result.fail(error as Error)
    }
  }

  private toDomain(row: ClientRow): Result<Client, DomainError> {
    return ClientFactory.fromPersistence({
      id: row.id,
      entityId: row.entity_id,
      name: row.name,
      displayNumber: row.display_number,
      leadSource: row.lead_source,
      phone: row.phone,
      instagram: row.instagram,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      isDeleted: false,
    })
  }

  private toTimestamp(value?: string | Date): string | undefined {
    if (!value) {
      return undefined
    }

    if (value instanceof Date) {
      return value.toISOString()
    }

    return value
  }
}
