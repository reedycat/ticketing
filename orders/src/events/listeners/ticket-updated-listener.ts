import { Message } from 'node-nats-streaming'
import {
	Subjects,
	Listener,
	TicketUpdatedEvent,
	NotFoundError
} from '@reedytickets/common'
import { Ticket } from '../../models/ticket'
import { queueGroupName } from './queue-group-name'

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
	subject: Subjects.TicketUpdated = Subjects.TicketUpdated
	queueGroupName = queueGroupName

	async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
		// Custom static method directly in the Ticket model
		const ticket = await Ticket.findByEvent(data)

		if (!ticket) {
			throw new NotFoundError()
		}

		const { title, price } = data
		ticket.set({ title, price })
		await ticket.save()

		msg.ack()
	}
}
