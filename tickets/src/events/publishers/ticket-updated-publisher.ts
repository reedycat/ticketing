import { Publisher, Subjects, TicketUpdatedEvent } from '@reedytickets/common'

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
	subject: Subjects.TicketUpdated = Subjects.TicketUpdated
}
