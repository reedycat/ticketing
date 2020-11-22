import { Publisher, Subjects, TicketCreatedEvent } from '@reedytickets/common'

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated
}
