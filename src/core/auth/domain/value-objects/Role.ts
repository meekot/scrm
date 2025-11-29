import { ValueObject } from '@/core/shared/domain/ValueObject'
import { Result } from '@/core/shared/types/Result'
import { DomainError } from '@/lib/errors'

export enum UserRole {
  SUPERADMIN = 'superadmin',
  OWNER = 'owner',
  ADMIN = 'admin',
  STAFF = 'staff',
}

interface RoleProps {
  value: UserRole
}

/**
 * Role Value Object
 * Represents user roles with validation and hierarchy
 */
export class Role extends ValueObject<RoleProps> {
  private constructor(props: RoleProps) {
    super(props)
  }

  public get value(): UserRole {
    return this.props.value
  }

  public static create(role: string): Result<Role, DomainError> {
    if (!Object.values(UserRole).includes(role as UserRole)) {
      return Result.fail(
        new DomainError(
          `Invalid role: ${role}. Must be one of: ${Object.values(UserRole).join(', ')}`
        )
      )
    }

    return Result.ok(new Role({ value: role as UserRole }))
  }

  public static superadmin(): Role {
    return new Role({ value: UserRole.SUPERADMIN })
  }

  public static owner(): Role {
    return new Role({ value: UserRole.OWNER })
  }

  public static admin(): Role {
    return new Role({ value: UserRole.ADMIN })
  }

  public static staff(): Role {
    return new Role({ value: UserRole.STAFF })
  }

  /**
   * Check if this role is SUPERADMIN
   */
  public isSuperAdmin(): boolean {
    return this.props.value === UserRole.SUPERADMIN
  }

  /**
   * Check if this role is OWNER
   */
  public isOwner(): boolean {
    return this.props.value === UserRole.OWNER
  }

  /**
   * Check if this role is ADMIN
   */
  public isAdmin(): boolean {
    return this.props.value === UserRole.ADMIN
  }

  /**
   * Check if this role is STAFF
   */
  public isStaff(): boolean {
    return this.props.value === UserRole.STAFF
  }

  /**
   * Check if this role has at least the specified permission level
   * Hierarchy: SUPERADMIN > OWNER > ADMIN > STAFF
   */
  public hasPermissionLevel(requiredRole: UserRole): boolean {
    const hierarchy = {
      [UserRole.SUPERADMIN]: 4,
      [UserRole.OWNER]: 3,
      [UserRole.ADMIN]: 2,
      [UserRole.STAFF]: 1,
    }

    return hierarchy[this.props.value] >= hierarchy[requiredRole]
  }

  /**
   * Check if this role can manage another role
   */
  public canManageRole(targetRole: Role): boolean {
    // SUPERADMIN can manage all
    if (this.isSuperAdmin()) return true

    // OWNER can manage ADMIN and STAFF
    if (this.isOwner()) {
      return targetRole.isAdmin() || targetRole.isStaff()
    }

    // ADMIN can manage STAFF
    if (this.isAdmin()) {
      return targetRole.isStaff()
    }

    return false
  }
}
