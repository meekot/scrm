import { Client } from '@/core/client/domain/entities/Client'
import { ClientDTO, InstagramDTO, PhoneDTO } from '../dto/ClientDTO'

/**
 * Maps Client aggregate roots to transport DTOs
 */
export class ClientMapper {
  public static toDTO(client: Client): ClientDTO {
    return {
      id: client.id,
      entityId: client.entityId,
      name: client.name,
      displayNumber: client.displayNumber,
      leadSource: client.leadSource.value,
      phone: ClientMapper.toPhoneDTO(client),
      instagram: ClientMapper.toInstagramDTO(client),
      createdAt: client.createdAt.toISOString(),
      updatedAt: client.updatedAt.toISOString(),
      isDeleted: client.isDeleted,
    }
  }

  private static toPhoneDTO(client: Client): PhoneDTO | null {
    const phone = client.phone
    if (!phone) {
      return null
    }

    return {
      value: phone.value,
      formatted: phone.formatted,
      countryCode: phone.countryCode,
    }
  }

  private static toInstagramDTO(client: Client): InstagramDTO | null {
    const instagram = client.instagram
    if (!instagram) {
      return null
    }

    return {
      handle: instagram.handle,
      url: instagram.url,
    }
  }
}
