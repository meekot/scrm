import 'reflect-metadata'
import { Container } from 'inversify'
import { TYPES } from './types'
import { SupabaseClientRepository } from '@/infrastructure/persistence/supabase/repositories/SupabaseClientRepository'
import { CreateClientHandler } from '@/application/client/commands/CreateClientCommand'
import { UpdateClientHandler } from '@/application/client/commands/UpdateClientCommand'
import { DeleteClientHandler } from '@/application/client/commands/DeleteClientCommand'
import { GetClientHandler } from '@/application/client/queries/GetClientQuery'
import { ListClientsHandler } from '@/application/client/queries/ListClientsQuery'

/**
 * Dependency Injection Container
 * Configured using InversifyJS
 */
const container = new Container({
  defaultScope: 'Singleton',
  autoBindInjectable: true,
})

/**
 * Configure container bindings
 * This will be expanded as we implement repositories and services
 */
export function configureContainer(): Container {
  // Client bounded context
  if (!container.isBound(TYPES.ClientRepository)) {
    container.bind(TYPES.ClientRepository).to(SupabaseClientRepository)
  }

  if (!container.isBound(TYPES.ClientCreateHandler)) {
    container.bind(TYPES.ClientCreateHandler).to(CreateClientHandler)
  }

  if (!container.isBound(TYPES.ClientUpdateHandler)) {
    container.bind(TYPES.ClientUpdateHandler).to(UpdateClientHandler)
  }

  if (!container.isBound(TYPES.ClientDeleteHandler)) {
    container.bind(TYPES.ClientDeleteHandler).to(DeleteClientHandler)
  }

  if (!container.isBound(TYPES.ClientGetHandler)) {
    container.bind(TYPES.ClientGetHandler).to(GetClientHandler)
  }

  if (!container.isBound(TYPES.ClientListHandler)) {
    container.bind(TYPES.ClientListHandler).to(ListClientsHandler)
  }

  return container
}

export { container, TYPES }
