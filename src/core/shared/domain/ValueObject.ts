/**
 * Base Value Object class
 * Value Objects are immutable objects that are defined by their attributes
 * rather than their identity
 */
export abstract class ValueObject<T> {
  protected readonly props: T

  protected constructor(props: T) {
    this.props = Object.freeze(props)
  }

  /**
   * Value Objects are equal if all their properties are equal
   */
  public equals(vo?: ValueObject<T>): boolean {
    if (vo === null || vo === undefined) {
      return false
    }

    if (vo.props === undefined) {
      return false
    }

    return JSON.stringify(this.props) === JSON.stringify(vo.props)
  }
}
