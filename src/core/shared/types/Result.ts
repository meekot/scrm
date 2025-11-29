/**
 * Result Type for Railway-Oriented Programming
 * Represents either a success with a value or a failure with an error
 */
export class Result<T, E = Error> {
  private constructor(
    private readonly _isSuccess: boolean,
    private readonly _value?: T,
    private readonly _error?: E
  ) {}

  public get isSuccess(): boolean {
    return this._isSuccess
  }

  public get isFailure(): boolean {
    return !this._isSuccess
  }

  public get value(): T {
    if (!this._isSuccess) {
      throw new Error('Cannot get value from a failed result')
    }
    return this._value as T
  }

  public get error(): E {
    if (this._isSuccess) {
      throw new Error('Cannot get error from a successful result')
    }
    return this._error as E
  }

  public static ok<T, E = Error>(value?: T): Result<T, E> {
    return new Result<T, E>(true, value, undefined)
  }

  public static fail<T, E = Error>(error: E): Result<T, E> {
    return new Result<T, E>(false, undefined, error)
  }

  public static combine<T, E = Error>(results: Result<T, E>[]): Result<T[], E> {
    const failed = results.find((r) => r.isFailure)
    if (failed) {
      return Result.fail(failed.error)
    }

    return Result.ok(results.map((r) => r.value))
  }

  /**
   * Map the value if the result is successful
   */
  public map<U>(fn: (value: T) => U): Result<U, E> {
    if (this.isFailure) {
      return Result.fail(this._error as E)
    }
    return Result.ok(fn(this._value as T))
  }

  /**
   * FlatMap for chaining operations that return Results
   */
  public flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    if (this.isFailure) {
      return Result.fail(this._error as E)
    }
    return fn(this._value as T)
  }

  /**
   * Map the error if the result is a failure
   */
  public mapError<F>(fn: (error: E) => F): Result<T, F> {
    if (this.isSuccess) {
      return Result.ok(this._value as T)
    }
    return Result.fail(fn(this._error as E))
  }

  /**
   * Get value or a default
   */
  public getOrElse(defaultValue: T): T {
    return this.isSuccess ? (this._value as T) : defaultValue
  }

  /**
   * Execute a side effect if successful
   */
  public onSuccess(fn: (value: T) => void): Result<T, E> {
    if (this.isSuccess) {
      fn(this._value as T)
    }
    return this
  }

  /**
   * Execute a side effect if failed
   */
  public onFailure(fn: (error: E) => void): Result<T, E> {
    if (this.isFailure) {
      fn(this._error as E)
    }
    return this
  }
}
