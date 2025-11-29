import { ValueObject } from '@/core/shared/domain/ValueObject'
import { Result } from '@/core/shared/types/Result'
import { DomainError } from '@/lib/errors'

interface LeadSourceProps {
  value: string
}

/**
 * LeadSource Value Object
 * Represents how a client found the business
 */
export class LeadSource extends ValueObject<LeadSourceProps> {
  // Common lead sources (can be extended)
  public static readonly INSTAGRAM = 'instagram'
  public static readonly REFERRAL = 'referral'
  public static readonly GOOGLE = 'google'
  public static readonly FACEBOOK = 'facebook'
  public static readonly WALK_IN = 'walk_in'
  public static readonly OTHER = 'other'

  private constructor(props: LeadSourceProps) {
    super(props)
  }

  public get value(): string {
    return this.props.value
  }

  public static create(source: string): Result<LeadSource, DomainError> {
    if (!source || source.trim().length === 0) {
      // Default to 'other' if not specified
      return Result.ok(new LeadSource({ value: LeadSource.OTHER }))
    }

    const normalizedSource = source.trim().toLowerCase()

    return Result.ok(new LeadSource({ value: normalizedSource }))
  }

  public static instagram(): LeadSource {
    return new LeadSource({ value: LeadSource.INSTAGRAM })
  }

  public static referral(): LeadSource {
    return new LeadSource({ value: LeadSource.REFERRAL })
  }

  public static google(): LeadSource {
    return new LeadSource({ value: LeadSource.GOOGLE })
  }

  public static facebook(): LeadSource {
    return new LeadSource({ value: LeadSource.FACEBOOK })
  }

  public static walkIn(): LeadSource {
    return new LeadSource({ value: LeadSource.WALK_IN })
  }

  public static other(): LeadSource {
    return new LeadSource({ value: LeadSource.OTHER })
  }
}
