import { Result } from '@/core/shared/types/Result'
import { User } from '../entities/User'

/**
 * User Repository Interface
 */
export interface IUserRepository {
  /**
   * Find user by ID
   */
  findById(id: string): Promise<Result<User | null, Error>>

  /**
   * Find user by email
   */
  findByEmail(email: string): Promise<Result<User | null, Error>>

  /**
   * Save user
   */
  save(user: User): Promise<Result<void, Error>>

  /**
   * Delete user
   */
  delete(id: string): Promise<Result<void, Error>>
}
