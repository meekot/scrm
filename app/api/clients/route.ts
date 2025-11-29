import { NextResponse } from 'next/server'
import { container, configureContainer, TYPES } from '@/infrastructure/config/di-container'
import type {
  CreateClientCommand,
  CreateClientHandler,
} from '@/application/client/commands/CreateClientCommand'
import type {
  ListClientsHandler,
  ListClientsQuery,
} from '@/application/client/queries/ListClientsQuery'
import { AppError } from '@/lib/errors'

configureContainer()

export async function GET(request: Request) {
  const entityId = resolveEntityId(request)
  if (!entityId) {
    return NextResponse.json({ error: 'Missing entityId' }, { status: 400 })
  }

  const searchParams = new URL(request.url).searchParams
  const query: ListClientsQuery = {
    entityId,
    search: searchParams.get('search') ?? undefined,
    phone: searchParams.get('phone') ?? undefined,
    instagram: searchParams.get('instagram') ?? undefined,
  }

  const leadSources = collectLeadSources(searchParams)
  if (leadSources.length > 0) {
    query.leadSources = leadSources
  }

  const limit = searchParams.get('limit')
  if (limit) {
    const parsed = Number(limit)
    if (!Number.isNaN(parsed)) {
      query.limit = parsed
    }
  }

  const offset = searchParams.get('offset')
  if (offset) {
    const parsed = Number(offset)
    if (!Number.isNaN(parsed)) {
      query.offset = parsed
    }
  }

  const handler = container.get<ListClientsHandler>(TYPES.ClientListHandler)
  const result = await handler.execute(query)

  if (result.isFailure) {
    return errorResponse(result.error)
  }

  return NextResponse.json({ data: result.value })
}

export async function POST(request: Request) {
  const entityId = resolveEntityId(request)
  if (!entityId) {
    return NextResponse.json({ error: 'Missing entityId' }, { status: 400 })
  }

  let payload: Record<string, unknown>
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const name = typeof payload.name === 'string' ? payload.name.trim() : ''
  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  const command: CreateClientCommand = {
    entityId,
    name,
    phone: typeof payload.phone === 'string' ? payload.phone : null,
    instagram: typeof payload.instagram === 'string' ? payload.instagram : null,
    leadSource: typeof payload.leadSource === 'string' ? payload.leadSource : undefined,
  }

  const handler = container.get<CreateClientHandler>(TYPES.ClientCreateHandler)
  const result = await handler.execute(command)

  if (result.isFailure) {
    return errorResponse(result.error)
  }

  return NextResponse.json({ data: result.value }, { status: 201 })
}

function resolveEntityId(request: Request): string | null {
  const header = request.headers.get('x-entity-id')
  if (header && header.trim().length > 0) {
    return header.trim()
  }

  const url = new URL(request.url)
  const fromQuery = url.searchParams.get('entityId')
  if (fromQuery && fromQuery.trim().length > 0) {
    return fromQuery.trim()
  }

  return null
}

function collectLeadSources(searchParams: URLSearchParams): string[] {
  const multiValues = searchParams.getAll('leadSource')
  const csv = searchParams.get('leadSources')
  const values = [...multiValues]

  if (csv) {
    values.push(...csv.split(','))
  }

  return values
    .map((value) => value.trim())
    .filter((value, index, arr) => value.length > 0 && arr.indexOf(value) === index)
}

function errorResponse(error: Error) {
  const status = error instanceof AppError ? error.statusCode : 500
  const message = status >= 500 ? 'Internal server error' : error.message
  return NextResponse.json({ error: message }, { status })
}
