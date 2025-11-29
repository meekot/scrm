export interface PhoneDTO {
  value: string
  formatted: string
  countryCode?: string
}

export interface InstagramDTO {
  handle: string
  url: string
}

export interface ClientDTO {
  id: string
  entityId: string
  name: string
  displayNumber: number
  leadSource: string
  phone: PhoneDTO | null
  instagram: InstagramDTO | null
  createdAt: string
  updatedAt: string
  isDeleted: boolean
}
