import { inject, injectable } from 'inversify'
import { ICommandHandler } from '@/application/shared/ICommandHandler'
import type { ClientDTO } from '../dto/ClientDTO'
import { ClientMapper } from '../mappers/ClientMapper'
import type { IClientRepository } from '@/core/client/domain/repositories/IClientRepository'
import { PhoneNumber } from '@/core/client/domain/value-objects/PhoneNumber'
import { Instagram } from '@/core/client/domain/value-objects/Instagram'
import { LeadSource } from '@/core/client/domain/value-objects/LeadSource'
import { Result } from '@/core/shared/types/Result'
import { DomainError } from '@/lib/errors'
import { CLIENT_TOKENS } from '../tokens'
import type { ClientUpdateProps } from '@/core/client/domain/entities/Client'

export interface UpdateClientCommand {
  entityId: string
  clientId: string
  name?: string
  phone?: string | null
  instagram?: string | null
  leadSource?: string
}

@injectable()
export class UpdateClientHandler
  implements ICommandHandler<UpdateClientCommand, ClientDTO, DomainError | Error>
{
  constructor(@inject(CLIENT_TOKENS.ClientRepository) private readonly repository: IClientRepository) {}

  async execute(command: UpdateClientCommand): Promise<Result<ClientDTO, DomainError | Error>> {
    const clientResult = await this.repository.findById(command.entityId, command.clientId)
    if (clientResult.isFailure) {
      return Result.fail(clientResult.error)
    }

    const existingClient = clientResult.value
    if (!existingClient) {
      return Result.fail(new DomainError('Client not found'))
    }

    const updates: ClientUpdateProps = {}

    if (command.name !== undefined) {
      updates.name = command.name
    }

    if (command.phone !== undefined) {
      const phoneResult = this.parsePhone(command.phone)
      if (phoneResult.isFailure) {
        return Result.fail(phoneResult.error)
      }
      updates.phone = phoneResult.value
    }

    if (command.instagram !== undefined) {
      const instagramResult = this.parseInstagram(command.instagram)
      if (instagramResult.isFailure) {
        return Result.fail(instagramResult.error)
      }
      updates.instagram = instagramResult.value
    }

    if (command.leadSource !== undefined) {
      const leadSourceResult = LeadSource.create(command.leadSource)
      if (leadSourceResult.isFailure) {
        return Result.fail(leadSourceResult.error)
      }
      updates.leadSource = leadSourceResult.value
    }

    const updateResult = existingClient.updateDetails(updates)
    if (updateResult.isFailure) {
      return Result.fail(updateResult.error)
    }

    const saveResult = await this.repository.save(existingClient)
    if (saveResult.isFailure) {
      return Result.fail(saveResult.error)
    }

    return Result.ok(ClientMapper.toDTO(existingClient))
  }

  private parsePhone(phone: string | null): Result<PhoneNumber | null, DomainError> {
    if (phone === null) {
      return Result.ok<PhoneNumber | null, DomainError>(null)
    }

    const trimmed = phone.trim()
    if (!trimmed) {
      return Result.ok<PhoneNumber | null, DomainError>(null)
    }

    const result = PhoneNumber.create(trimmed)
    if (result.isFailure) {
      return Result.fail<PhoneNumber | null, DomainError>(result.error)
    }

    return Result.ok<PhoneNumber | null, DomainError>(result.value)
  }

  private parseInstagram(instagram: string | null): Result<Instagram | null, DomainError> {
    if (instagram === null) {
      return Result.ok<Instagram | null, DomainError>(null)
    }

    const trimmed = instagram.trim()
    if (!trimmed) {
      return Result.ok<Instagram | null, DomainError>(null)
    }

    const result = Instagram.create(trimmed)
    if (result.isFailure) {
      return Result.fail<Instagram | null, DomainError>(result.error)
    }

    return Result.ok<Instagram | null, DomainError>(result.value)
  }
}
