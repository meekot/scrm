import { AggregateRoot } from '@/core/shared/domain/AggregateRoot'
import { Result } from '@/core/shared/types/Result'
import { DomainError } from '@/lib/errors'
import { Instagram } from '../value-objects/Instagram'
import { LeadSource } from '../value-objects/LeadSource'
import { PhoneNumber } from '../value-objects/PhoneNumber'
import { ClientCreatedEvent, ClientCreatedEventPayload } from '../events/ClientCreatedEvent'
import {
  ClientUpdatedEvent,
  ClientUpdatedEventChanges,
} from '../events/ClientUpdatedEvent'
import { ClientDeletedEvent } from '../events/ClientDeletedEvent'

export interface ClientSnapshot {
  id: string
  entityId: string
  name: string
  displayNumber: number
  leadSource: string
  phone?: string | null
  instagram?: string | null
  createdAt: Date
  updatedAt: Date
  isDeleted: boolean
}

interface ClientProps {
  id: string
  entityId: string
  name: string
  displayNumber: number
  leadSource: LeadSource
  phone?: PhoneNumber
  instagram?: Instagram
  createdAt?: Date
  updatedAt?: Date
  isDeleted?: boolean
}

export interface CreateClientProps {
  entityId: string
  name: string
  displayNumber: number
  leadSource?: LeadSource
  phone?: PhoneNumber
  instagram?: Instagram
  createdAt?: Date
  updatedAt?: Date
  id?: string
}

export interface PersistedClientProps extends Omit<ClientProps, 'phone' | 'instagram'> {
  phone?: PhoneNumber
  instagram?: Instagram
}

export interface ClientUpdateProps {
  name?: string
  phone?: PhoneNumber | null
  instagram?: Instagram | null
  leadSource?: LeadSource
}

/**
 * Client Aggregate Root
 * Represents a CRM client belonging to an entity/tenant
 */
export class Client extends AggregateRoot<string> {
  private readonly _entityId: string
  private _name: string
  private readonly _displayNumber: number
  private _leadSource: LeadSource
  private _phone?: PhoneNumber
  private _instagram?: Instagram
  private _isDeleted: boolean

  private constructor(props: ClientProps) {
    super(props.id, props.createdAt, props.updatedAt)
    this._entityId = props.entityId
    this._name = props.name
    this._displayNumber = props.displayNumber
    this._leadSource = props.leadSource
    this._phone = props.phone
    this._instagram = props.instagram
    this._isDeleted = props.isDeleted ?? false
  }

  /**
   * Create a new client and emit creation event
   */
  public static create(props: CreateClientProps): Result<Client, DomainError> {
    const validation = Client.validate(props)
    if (validation.isFailure) {
      return Result.fail(validation.error)
    }

    const client = new Client({
      id: props.id ?? crypto.randomUUID(),
      entityId: props.entityId,
      name: props.name.trim(),
      displayNumber: props.displayNumber,
      leadSource: props.leadSource ?? LeadSource.other(),
      phone: props.phone,
      instagram: props.instagram,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    })

    client.addDomainEvent(new ClientCreatedEvent(client.toEventSnapshot()))

    return Result.ok(client)
  }

  /**
   * Restore an existing client from persistence without emitting events
   */
  public static restore(props: PersistedClientProps): Client {
    const normalizedName = props.name.trim()
    return new Client({
      ...props,
      name: normalizedName,
      leadSource: props.leadSource ?? LeadSource.other(),
      phone: props.phone,
      instagram: props.instagram,
    })
  }

  private static validate(props: CreateClientProps): Result<void, DomainError> {
    if (!props.entityId || props.entityId.trim().length === 0) {
      return Result.fail(new DomainError('Client must belong to an entity'))
    }

    const nameResult = Client.validateName(props.name)
    if (nameResult.isFailure) {
      return nameResult
    }

    if (!Number.isInteger(props.displayNumber) || props.displayNumber <= 0) {
      return Result.fail(new DomainError('Display number must be a positive integer'))
    }

    return Result.ok()
  }

  private static validateName(name: string): Result<void, DomainError> {
    if (!name || name.trim().length < 2) {
      return Result.fail(new DomainError('Client name must be at least 2 characters'))
    }

    return Result.ok()
  }

  public get entityId(): string {
    return this._entityId
  }

  public get name(): string {
    return this._name
  }

  public get displayNumber(): number {
    return this._displayNumber
  }

  public get phone(): PhoneNumber | undefined {
    return this._phone
  }

  public get instagram(): Instagram | undefined {
    return this._instagram
  }

  public get leadSource(): LeadSource {
    return this._leadSource
  }

  public get isDeleted(): boolean {
    return this._isDeleted
  }

  /**
   * Update mutable client attributes and emit event with changed fields
   */
  public updateDetails(updates: ClientUpdateProps): Result<void, DomainError> {
    const changes: ClientUpdatedEventChanges = {}

    if (updates.name !== undefined) {
      const trimmedName = updates.name.trim()
      const nameResult = Client.validateName(trimmedName)
      if (nameResult.isFailure) {
        return nameResult
      }

      if (trimmedName !== this._name) {
        this._name = trimmedName
        changes.name = trimmedName
      }
    }

    if (Object.prototype.hasOwnProperty.call(updates, 'phone')) {
      const newPhone = updates.phone ?? undefined
      if (!this.arePhonesEqual(newPhone, this._phone)) {
        this._phone = newPhone
        changes.phone = newPhone ? newPhone.value : null
      }
    }

    if (Object.prototype.hasOwnProperty.call(updates, 'instagram')) {
      const newInstagram = updates.instagram ?? undefined
      if (!this.areInstagramsEqual(newInstagram, this._instagram)) {
        this._instagram = newInstagram
        changes.instagram = newInstagram ? newInstagram.handle : null
      }
    }

    if (updates.leadSource && updates.leadSource.value !== this._leadSource.value) {
      this._leadSource = updates.leadSource
      changes.leadSource = updates.leadSource.value
    }

    if (Object.keys(changes).length === 0) {
      return Result.ok()
    }

    this.addDomainEvent(
      new ClientUpdatedEvent({
        clientId: this.id,
        entityId: this._entityId,
        changes,
      })
    )

    return Result.ok()
  }

  /**
   * Soft delete/archival hook that emits event for projections
   */
  public markDeleted(): void {
    if (this._isDeleted) {
      return
    }

    this._isDeleted = true
    this.addDomainEvent(
      new ClientDeletedEvent({
        clientId: this.id,
        entityId: this._entityId,
        displayNumber: this._displayNumber,
      })
    )
  }

  public toPrimitives(): ClientSnapshot {
    return {
      id: this.id,
      entityId: this._entityId,
      name: this._name,
      displayNumber: this._displayNumber,
      leadSource: this._leadSource.value,
      phone: this._phone ? this._phone.value : null,
      instagram: this._instagram ? this._instagram.handle : null,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isDeleted: this._isDeleted,
    }
  }

  private toEventSnapshot(): ClientCreatedEventPayload {
    const snapshot = this.toPrimitives()

    return {
      clientId: snapshot.id,
      entityId: snapshot.entityId,
      name: snapshot.name,
      displayNumber: snapshot.displayNumber,
      leadSource: snapshot.leadSource,
      phone: snapshot.phone,
      instagram: snapshot.instagram,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
    }
  }

  private arePhonesEqual(a?: PhoneNumber, b?: PhoneNumber): boolean {
    if (!a && !b) {
      return true
    }

    if (!a || !b) {
      return false
    }

    return a.equals(b)
  }

  private areInstagramsEqual(a?: Instagram, b?: Instagram): boolean {
    if (!a && !b) {
      return true
    }

    if (!a || !b) {
      return false
    }

    return a.equals(b)
  }
}
