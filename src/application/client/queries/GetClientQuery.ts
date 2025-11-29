import { inject, injectable } from 'inversify'
import { IQueryHandler } from '@/application/shared/IQueryHandler'
import type { ClientDTO } from '../dto/ClientDTO'
import { ClientMapper } from '../mappers/ClientMapper'
import type { IClientRepository } from '@/core/client/domain/repositories/IClientRepository'
import { Result } from '@/core/shared/types/Result'
import { CLIENT_TOKENS } from '../tokens'

export interface GetClientQuery {
  entityId: string
  clientId: string
}

@injectable()
export class GetClientHandler implements IQueryHandler<GetClientQuery, ClientDTO | null, Error> {
  constructor(@inject(CLIENT_TOKENS.ClientRepository) private readonly repository: IClientRepository) {}

  async execute(query: GetClientQuery): Promise<Result<ClientDTO | null, Error>> {
    const clientResult = await this.repository.findById(query.entityId, query.clientId)
    if (clientResult.isFailure) {
      return Result.fail(clientResult.error)
    }

    const client = clientResult.value
    if (!client) {
      return Result.ok(null)
    }

    return Result.ok(ClientMapper.toDTO(client))
  }
}
