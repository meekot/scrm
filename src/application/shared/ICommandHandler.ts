import { Result } from '@/core/shared/types/Result'

/**
 * Command Handler Interface
 * All command handlers should implement this interface
 */
export interface ICommandHandler<TCommand, TResult = void, TError = Error> {
  execute(command: TCommand): Promise<Result<TResult, TError>>
}
