import { AppError } from './AppError'

/**
 * Domain Error - represents business rule violations
 */
export class DomainError extends AppError {
  constructor(message: string) {
    super(message, 400, true)
    Object.setPrototypeOf(this, DomainError.prototype)
  }
}
