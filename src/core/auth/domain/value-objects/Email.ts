import { ValueObject } from '@/core/shared/domain/ValueObject'
import { Result } from '@/core/shared/types/Result'
import { DomainError } from '@/lib/errors'

interface EmailProps {
  value: string
}

/**
 * Email Value Object
 * Represents a valid email address
 */
export class Email extends ValueObject<EmailProps> {
  private constructor(props: EmailProps) {
    super(props)
  }

  public get value(): string {
    return this.props.value
  }

  public static create(email: string): Result<Email, DomainError> {
    if (!email || email.trim().length === 0) {
      return Result.fail(new DomainError('Email cannot be empty'))
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return Result.fail(new DomainError('Invalid email format'))
    }

    return Result.ok(new Email({ value: email.toLowerCase().trim() }))
  }

  public getDomain(): string {
    return this.props.value.split('@')[1]
  }
}
