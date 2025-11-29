import { Entity } from '@/core/shared/domain/Entity'
import { Email } from '../value-objects/Email'
import { UserRole } from '../value-objects/Role'

interface UserProps {
  id: string
  email: Email
  platformRole?: UserRole
  metadata?: Record<string, unknown>
  createdAt?: Date
  updatedAt?: Date
}

/**
 * User Entity
 * Represents an authenticated user in the system
 */
export class User extends Entity<string> {
  private readonly _email: Email
  private readonly _platformRole?: UserRole
  private readonly _metadata: Record<string, unknown>

  private constructor(props: UserProps) {
    super(props.id, props.createdAt, props.updatedAt)
    this._email = props.email
    this._platformRole = props.platformRole
    this._metadata = props.metadata || {}
  }

  public static create(props: UserProps): User {
    return new User(props)
  }

  public get email(): Email {
    return this._email
  }

  public get platformRole(): UserRole | undefined {
    return this._platformRole
  }

  public get metadata(): Record<string, unknown> {
    return this._metadata
  }

  public isSuperAdmin(): boolean {
    return this._platformRole === UserRole.SUPERADMIN
  }
}
