import { injectable } from 'inversify'
import type { SupabaseClient } from '@supabase/supabase-js'
import { Result } from '@/core/shared/types/Result'
import type {
  IAuthService,
  LoginCredentials,
  RegisterCredentials,
  AuthSession,
} from '@/core/auth/domain/services/IAuthService'
import { User } from '@/core/auth/domain/entities/User'
import { EntityMember } from '@/core/auth/domain/entities/EntityMember'
import { Email } from '@/core/auth/domain/value-objects/Email'
import { Role, UserRole } from '@/core/auth/domain/value-objects/Role'

/**
 * Supabase Auth Service Implementation
 */
@injectable()
export class SupabaseAuthService implements IAuthService {
  constructor(private readonly supabase: SupabaseClient) {}

  async register(credentials: RegisterCredentials): Promise<Result<User, Error>> {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            full_name: credentials.fullName,
          },
        },
      })

      if (error) {
        return Result.fail(error)
      }

      if (!data.user) {
        return Result.fail(new Error('Failed to create user'))
      }

      const emailResult = Email.create(data.user.email!)
      if (emailResult.isFailure) {
        return Result.fail(emailResult.error)
      }

      const user = User.create({
        id: data.user.id,
        email: emailResult.value,
        metadata: data.user.user_metadata,
      })

      return Result.ok(user)
    } catch (error) {
      return Result.fail(error as Error)
    }
  }

  async login(credentials: LoginCredentials): Promise<Result<AuthSession, Error>> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (error) {
        return Result.fail(error)
      }

      if (!data.user || !data.session) {
        return Result.fail(new Error('Invalid credentials'))
      }

      const emailResult = Email.create(data.user.email!)
      if (emailResult.isFailure) {
        return Result.fail(emailResult.error)
      }

      // Check for platform role in user metadata
      const platformRole = data.user.user_metadata?.platform_role as UserRole | undefined

      const user = User.create({
        id: data.user.id,
        email: emailResult.value,
        platformRole,
        metadata: data.user.user_metadata,
      })

      const session: AuthSession = {
        user,
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
      }

      return Result.ok(session)
    } catch (error) {
      return Result.fail(error as Error)
    }
  }

  async logout(): Promise<Result<void, Error>> {
    try {
      const { error } = await this.supabase.auth.signOut()

      if (error) {
        return Result.fail(error)
      }

      return Result.ok()
    } catch (error) {
      return Result.fail(error as Error)
    }
  }

  async getCurrentUser(): Promise<Result<User | null, Error>> {
    try {
      const {
        data: { user },
        error,
      } = await this.supabase.auth.getUser()

      if (error) {
        return Result.fail(error)
      }

      if (!user) {
        return Result.ok(null)
      }

      const emailResult = Email.create(user.email!)
      if (emailResult.isFailure) {
        return Result.fail(emailResult.error)
      }

      const platformRole = user.user_metadata?.platform_role as UserRole | undefined

      const domainUser = User.create({
        id: user.id,
        email: emailResult.value,
        platformRole,
        metadata: user.user_metadata,
      })

      return Result.ok(domainUser)
    } catch (error) {
      return Result.fail(error as Error)
    }
  }

  async getUserMemberships(userId: string): Promise<Result<EntityMember[], Error>> {
    try {
      const { data, error } = await this.supabase
        .from('entity_members')
        .select('*')
        .eq('user_id', userId)

      if (error) {
        return Result.fail(error)
      }

      const members = data.map((row) => {
        const roleResult = Role.create(row.role)
        if (roleResult.isFailure) {
          throw roleResult.error
        }

        return EntityMember.create({
          entityId: row.entity_id,
          userId: row.user_id,
          role: roleResult.value,
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at),
        })
      })

      return Result.ok(members)
    } catch (error) {
      return Result.fail(error as Error)
    }
  }

  async hasPermissionInEntity(
    userId: string,
    entityId: string,
    requiredRole: string
  ): Promise<Result<boolean, Error>> {
    try {
      const { data, error } = await this.supabase
        .from('entity_members')
        .select('role')
        .eq('user_id', userId)
        .eq('entity_id', entityId)
        .single()

      if (error || !data) {
        return Result.ok(false)
      }

      const currentRoleResult = Role.create(data.role)
      const requiredRoleResult = Role.create(requiredRole)

      if (currentRoleResult.isFailure || requiredRoleResult.isFailure) {
        return Result.ok(false)
      }

      const hasPermission = currentRoleResult.value.hasPermissionLevel(
        requiredRoleResult.value.value
      )

      return Result.ok(hasPermission)
    } catch (error) {
      return Result.fail(error as Error)
    }
  }
}
