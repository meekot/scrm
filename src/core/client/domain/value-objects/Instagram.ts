import { ValueObject } from '@/core/shared/domain/ValueObject'
import { Result } from '@/core/shared/types/Result'
import { DomainError } from '@/lib/errors'

interface InstagramProps {
  handle: string
}

/**
 * Instagram Value Object
 * Represents an Instagram handle/username
 */
export class Instagram extends ValueObject<InstagramProps> {
  private constructor(props: InstagramProps) {
    super(props)
  }

  public get handle(): string {
    return this.props.handle
  }

  public get url(): string {
    return `https://instagram.com/${this.props.handle}`
  }

  public static create(instagram: string): Result<Instagram, DomainError> {
    if (!instagram || instagram.trim().length === 0) {
      return Result.fail(new DomainError('Instagram handle cannot be empty'))
    }

    // Remove @ if present
    let handle = instagram.trim()
    if (handle.startsWith('@')) {
      handle = handle.substring(1)
    }

    // Instagram username validation
    // 1-30 characters, alphanumeric, dots, underscores
    const instagramRegex = /^[a-zA-Z0-9._]{1,30}$/

    if (!instagramRegex.test(handle)) {
      return Result.fail(
        new DomainError(
          'Invalid Instagram handle. Must be 1-30 characters (letters, numbers, dots, underscores)'
        )
      )
    }

    return Result.ok(new Instagram({ handle }))
  }
}
