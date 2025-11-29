import { Result } from '@/core/shared/types/Result'

/**
 * Query Handler Interface
 * All query handlers should implement this interface
 */
export interface IQueryHandler<TQuery, TResult, TError = Error> {
  execute(query: TQuery): Promise<Result<TResult, TError>>
}
