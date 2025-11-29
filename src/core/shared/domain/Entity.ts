/**
 * Base Entity class
 * Entities are objects that have a distinct identity that runs through time and different states
 */
export abstract class Entity<TId = string> {
  protected readonly _id: TId
  protected readonly _createdAt: Date
  protected _updatedAt: Date

  protected constructor(id: TId, createdAt?: Date, updatedAt?: Date) {
    this._id = id
    this._createdAt = createdAt || new Date()
    this._updatedAt = updatedAt || new Date()
  }

  public get id(): TId {
    return this._id
  }

  public get createdAt(): Date {
    return this._createdAt
  }

  public get updatedAt(): Date {
    return this._updatedAt
  }

  protected touch(): void {
    this._updatedAt = new Date()
  }

  /**
   * Entities are equal if they have the same ID
   */
  public equals(entity?: Entity<TId>): boolean {
    if (entity === null || entity === undefined) {
      return false
    }

    if (this === entity) {
      return true
    }

    if (!(entity instanceof Entity)) {
      return false
    }

    return this._id === entity._id
  }
}
