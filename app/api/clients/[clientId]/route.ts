import { NextResponse } from 'next/server'
import { container, configureContainer, TYPES } from '@/infrastructure/config/di-container'
import type { GetClientHandler, GetClientQuery } from '@/application/client/queries/GetClientQuery'
import type {
  UpdateClientCommand,
  UpdateClientHandler,
} from '@/application/client/commands/UpdateClientCommand'
import type {
  DeleteClientCommand,
  DeleteClientHandler,
} from '@/application/client/commands/DeleteClientCommand'
import { AppError } from '@/lib/errors'

configureContainer()

interface RouteParams {
  params: {
    clientId: string
  }
}

export async function GET(request: Request, { params }: RouteParams) {
  const entityId = resolveEntityId(request)
  if (!entityId) {
    return NextResponse.json({ error: 'Missing entityId' }, { status: 400 })
  }

  const handler = container.get<GetClientHandler>(TYPES.ClientGetHandler)
  const query: GetClientQuery = { entityId, clientId: params.clientId }
  const result = await handler.execute(query)

  if (result.isFailure) {
    return errorResponse(result.error)
  }

  if (!result.value) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  return NextResponse.json({ data: result.value })
}

export async function PATCH(request: Request, { params }: RouteParams) {
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

  const command: UpdateClientCommand = {
    entityId,
    clientId: params.clientId,
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'name') && typeof payload.name === 'string') {
    command.name = payload.name
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'phone')) {
    command.phone = typeof payload.phone === 'string' ? payload.phone : null
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'instagram')) {
    command.instagram = typeof payload.instagram === 'string' ? payload.instagram : null
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'leadSource') && typeof payload.leadSource === 'string') {
    command.leadSource = payload.leadSource
  }

  const handler = container.get<UpdateClientHandler>(TYPES.ClientUpdateHandler)
  const result = await handler.execute(command)

  if (result.isFailure) {
    return errorResponse(result.error)
  }

  return NextResponse.json({ data: result.value })
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const entityId = resolveEntityId(request)
  if (!entityId) {
    return NextResponse.json({ error: 'Missing entityId' }, { status: 400 })
  }

  const command: DeleteClientCommand = {
    entityId,
    clientId: params.clientId,
  }

  const handler = container.get<DeleteClientHandler>(TYPES.ClientDeleteHandler)
  const result = await handler.execute(command)

  if (result.isFailure) {
    return errorResponse(result.error)
  }

  return NextResponse.json({ success: true })
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

function errorResponse(error: Error) {
  const status = error instanceof AppError ? error.statusCode : 500
  const message = status >= 500 ? 'Internal server error' : error.message
  return NextResponse.json({ error: message }, { status })
}
