import { Result } from '@/core/shared/types/Result'
import { User } from '../entities/User'
import { EntityMember } from '../entities/EntityMember'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  fullName?: string
}

export interface AuthSession {
  user: User
  accessToken: string
  refreshToken: string
}

/**
 * Auth Service Interface
 * Defines authentication operations
 */
export interface IAuthService {
  /**
   * Register a new user
   */
  register(credentials: RegisterCredentials): Promise<Result<User, Error>>

  /**
   * Login user
   */
  login(credentials: LoginCredentials): Promise<Result<AuthSession, Error>>

  /**
   * Logout user
   */
  logout(): Promise<Result<void, Error>>

  /**
   * Get current authenticated user
   */
  getCurrentUser(): Promise<Result<User | null, Error>>

  /**
   * Get user's entity memberships
   */
  getUserMemberships(userId: string): Promise<Result<EntityMember[], Error>>

  /**
   * Check if user has permission in entity
   */
  hasPermissionInEntity(
    userId: string,
    entityId: string,
    requiredRole: string
  ): Promise<Result<boolean, Error>>
}
