import { AppError } from './AppError'

/**
 * Validation Error - represents input validation failures
 */
export class ValidationError extends AppError {
  public readonly fields?: Record<string, string[]>

  constructor(message: string, fields?: Record<string, string[]>) {
    super(message, 422, true)
    this.fields = fields
    Object.setPrototypeOf(this, ValidationError.prototype)
  }
}
