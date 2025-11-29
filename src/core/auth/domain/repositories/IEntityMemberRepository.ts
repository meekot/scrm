import { Result } from '@/core/shared/types/Result'
import { EntityMember } from '../entities/EntityMember'

/**
 * EntityMember Repository Interface
 */
export interface IEntityMemberRepository {
  /**
   * Find member by user ID and entity ID
   */
  findByUserAndEntity(userId: string, entityId: string): Promise<Result<EntityMember | null, Error>>

  /**
   * Find all members of an entity
   */
  findByEntity(entityId: string): Promise<Result<EntityMember[], Error>>

  /**
   * Find all memberships of a user
   */
  findByUser(userId: string): Promise<Result<EntityMember[], Error>>

  /**
   * Save entity member
   */
  save(member: EntityMember): Promise<Result<void, Error>>

  /**
   * Delete entity member
   */
  delete(userId: string, entityId: string): Promise<Result<void, Error>>
}
