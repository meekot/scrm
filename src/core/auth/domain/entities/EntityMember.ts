import { Entity } from '@/core/shared/domain/Entity'
import { Role } from '../value-objects/Role'
import { Result } from '@/core/shared/types/Result'
import { DomainError } from '@/lib/errors'

interface EntityMemberProps {
  entityId: string
  userId: string
  role: Role
  createdAt?: Date
  updatedAt?: Date
}

/**
 * EntityMember Entity
 * Represents a user's membership in an entity with a specific role
 */
export class EntityMember extends Entity<string> {
  private readonly _entityId: string
  private readonly _userId: string
  private _role: Role

  private constructor(props: EntityMemberProps) {
    super(`${props.entityId}-${props.userId}`, props.createdAt, props.updatedAt)
    this._entityId = props.entityId
    this._userId = props.userId
    this._role = props.role
  }

  public static create(props: EntityMemberProps): EntityMember {
    return new EntityMember(props)
  }

  public get entityId(): string {
    return this._entityId
  }

  public get userId(): string {
    return this._userId
  }

  public get role(): Role {
    return this._role
  }

  /**
   * Change the member's role
   * Only allowed if the role change is valid
   */
  public changeRole(newRole: Role, changedBy: Role): Result<void, DomainError> {
    // Check if the person making the change has permission
    if (!changedBy.canManageRole(this._role)) {
      return Result.fail(new DomainError('You do not have permission to change this member role'))
    }

    // Check if the new role can be assigned
    if (!changedBy.canManageRole(newRole)) {
      return Result.fail(new DomainError('You do not have permission to assign this role'))
    }

    this._role = newRole
    this.touch()

    return Result.ok()
  }

  /**
   * Check if this member has at least the required permission level
   */
  public hasPermission(requiredRole: Role): boolean {
    return this._role.hasPermissionLevel(requiredRole.value)
  }

  public isOwner(): boolean {
    return this._role.isOwner()
  }

  public isAdmin(): boolean {
    return this._role.isAdmin()
  }

  public isStaff(): boolean {
    return this._role.isStaff()
  }
}
