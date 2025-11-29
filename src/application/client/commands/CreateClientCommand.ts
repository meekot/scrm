import { inject, injectable } from 'inversify'
import { ICommandHandler } from '@/application/shared/ICommandHandler'
import type { ClientDTO } from '../dto/ClientDTO'
import { ClientMapper } from '../mappers/ClientMapper'
import type { IClientRepository } from '@/core/client/domain/repositories/IClientRepository'
import { PhoneNumber } from '@/core/client/domain/value-objects/PhoneNumber'
import { Instagram } from '@/core/client/domain/value-objects/Instagram'
import { LeadSource } from '@/core/client/domain/value-objects/LeadSource'
import { Client } from '@/core/client/domain/entities/Client'
import { Result } from '@/core/shared/types/Result'
import { DomainError } from '@/lib/errors'
import { CLIENT_TOKENS } from '../tokens'

export interface CreateClientCommand {
  entityId: string
  name: string
  phone?: string | null
  instagram?: string | null
  leadSource?: string
}

@injectable()
export class CreateClientHandler
  implements ICommandHandler<CreateClientCommand, ClientDTO, DomainError | Error>
{
  constructor(@inject(CLIENT_TOKENS.ClientRepository) private readonly repository: IClientRepository) {}

  public async execute(command: CreateClientCommand): Promise<Result<ClientDTO, DomainError | Error>> {
    const phoneResult = this.maybeCreatePhone(command.phone)
    if (phoneResult.isFailure) {
      return Result.fail(phoneResult.error)
    }

    const instagramResult = this.maybeCreateInstagram(command.instagram)
    if (instagramResult.isFailure) {
      return Result.fail(instagramResult.error)
    }

    const leadSourceResult = LeadSource.create(command.leadSource ?? '')
    if (leadSourceResult.isFailure) {
      return Result.fail(leadSourceResult.error)
    }

    const nextDisplayNumberResult = await this.repository.getNextDisplayNumber(command.entityId)
    if (nextDisplayNumberResult.isFailure) {
      return Result.fail(nextDisplayNumberResult.error)
    }

    const clientResult = Client.create({
      entityId: command.entityId,
      name: command.name,
      displayNumber: nextDisplayNumberResult.value,
      leadSource: leadSourceResult.value,
      phone: phoneResult.value,
      instagram: instagramResult.value,
    })

    if (clientResult.isFailure) {
      return Result.fail(clientResult.error)
    }

    const saveResult = await this.repository.save(clientResult.value)
    if (saveResult.isFailure) {
      return Result.fail(saveResult.error)
    }

    return Result.ok(ClientMapper.toDTO(clientResult.value))
  }

  private maybeCreatePhone(phone: string | null | undefined): Result<PhoneNumber | undefined, DomainError> {
    if (phone === undefined || phone === null) {
      return Result.ok<PhoneNumber | undefined, DomainError>(undefined)
    }

    const trimmed = phone.trim()
    if (!trimmed) {
      return Result.ok<PhoneNumber | undefined, DomainError>(undefined)
    }

    const result = PhoneNumber.create(trimmed)
    if (result.isFailure) {
      return Result.fail<PhoneNumber | undefined, DomainError>(result.error)
    }

    return Result.ok<PhoneNumber | undefined, DomainError>(result.value)
  }

  private maybeCreateInstagram(
    instagram: string | null | undefined
  ): Result<Instagram | undefined, DomainError> {
    if (instagram === undefined || instagram === null) {
      return Result.ok<Instagram | undefined, DomainError>(undefined)
    }

    const trimmed = instagram.trim()
    if (!trimmed) {
      return Result.ok<Instagram | undefined, DomainError>(undefined)
    }

    const result = Instagram.create(trimmed)
    if (result.isFailure) {
      return Result.fail<Instagram | undefined, DomainError>(result.error)
    }

    return Result.ok<Instagram | undefined, DomainError>(result.value)
  }
}
