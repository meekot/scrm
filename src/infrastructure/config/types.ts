/**
 * Dependency Injection Types
 * Used as identifiers for inversify container
 */
import { CLIENT_TOKENS } from '@/application/client/tokens'

export const TYPES = {
  ...CLIENT_TOKENS,
  // Repositories
  AppointmentRepository: Symbol.for('AppointmentRepository'),
  ServiceRepository: Symbol.for('ServiceRepository'),
  EntityRepository: Symbol.for('EntityRepository'),

  // Services
  EventBus: Symbol.for('EventBus'),
  EventStore: Symbol.for('EventStore'),
  SmsService: Symbol.for('SmsService'),
  EmailService: Symbol.for('EmailService'),

  // Command Handlers
  CreateAppointmentHandler: Symbol.for('CreateAppointmentHandler'),
  UpdateAppointmentHandler: Symbol.for('UpdateAppointmentHandler'),
  CancelAppointmentHandler: Symbol.for('CancelAppointmentHandler'),
  CompleteAppointmentHandler: Symbol.for('CompleteAppointmentHandler'),

  // Query Handlers
  GetAppointmentHandler: Symbol.for('GetAppointmentHandler'),
  ListAppointmentsHandler: Symbol.for('ListAppointmentsHandler'),
}
