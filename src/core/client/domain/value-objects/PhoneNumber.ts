import { ValueObject } from '@/core/shared/domain/ValueObject'
import { Result } from '@/core/shared/types/Result'
import { DomainError } from '@/lib/errors'
import { isValidPhoneNumber, parsePhoneNumberWithError } from 'libphonenumber-js'

interface PhoneNumberProps {
  value: string
  formatted: string
  countryCode?: string
}

/**
 * PhoneNumber Value Object
 * Validates and formats phone numbers
 */
export class PhoneNumber extends ValueObject<PhoneNumberProps> {
  private constructor(props: PhoneNumberProps) {
    super(props)
  }

  public get value(): string {
    return this.props.value
  }

  public get formatted(): string {
    return this.props.formatted
  }

  public get countryCode(): string | undefined {
    return this.props.countryCode
  }

  public static create(phone: string): Result<PhoneNumber, DomainError> {
    if (!phone || phone.trim().length === 0) {
      return Result.fail(new DomainError('Phone number cannot be empty'))
    }

    const cleanPhone = phone.trim()

    // Basic validation without country code
    if (!isValidPhoneNumber(cleanPhone)) {
      return Result.fail(new DomainError('Invalid phone number format'))
    }

    try {
      const parsed = parsePhoneNumberWithError(cleanPhone)

      return Result.ok(
        new PhoneNumber({
          value: cleanPhone,
          formatted: parsed.formatInternational(),
          countryCode: parsed.country,
        })
      )
    } catch {
      // Fallback: store as-is if parsing fails but basic validation passed
      return Result.ok(
        new PhoneNumber({
          value: cleanPhone,
          formatted: cleanPhone,
        })
      )
    }
  }
}
