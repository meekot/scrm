import { inject, injectable } from 'inversify'
import { ICommandHandler } from '@/application/shared/ICommandHandler'
import type { IClientRepository } from '@/core/client/domain/repositories/IClientRepository'
import { Result } from '@/core/shared/types/Result'
import { DomainError } from '@/lib/errors'
import { CLIENT_TOKENS } from '../tokens'

export interface DeleteClientCommand {
  entityId: string
  clientId: string
}

@injectable()
export class DeleteClientHandler implements ICommandHandler<DeleteClientCommand, void, DomainError | Error> {
  constructor(@inject(CLIENT_TOKENS.ClientRepository) private readonly repository: IClientRepository) {}

  async execute(command: DeleteClientCommand): Promise<Result<void, DomainError | Error>> {
    const clientResult = await this.repository.findById(command.entityId, command.clientId)
    if (clientResult.isFailure) {
      return Result.fail(clientResult.error)
    }

    const client = clientResult.value
    if (!client) {
      return Result.fail(new DomainError('Client not found'))
    }

    client.markDeleted()

    const deleteResult = await this.repository.delete(command.entityId, command.clientId)
    if (deleteResult.isFailure) {
      return Result.fail(deleteResult.error)
    }

    return Result.ok()
  }
}
