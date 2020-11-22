import {
	Listener,
	NotFoundError,
	OrderCreatedEvent,
	Subjects
} from '@reedytickets/common'
import { Ticket } from '../../models/ticket'
import { queueGroupName } from './queue-group-name'
import { Message } from 'node-nats-streaming'
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher'

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
	subject: Subjects.OrderCreated = Subjects.OrderCreated
	queueGroupName = queueGroupName

	async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
		// Find the ticket that the order is reserving
		const ticket = await Ticket.findById(data.ticket.id)

		// If no ticket throw  error
		if (!ticket) {
			throw new NotFoundError()
		}

		// Mark the ticket with 'orderId' prop as being reserved
		ticket.set({
			orderId: data.id
		})

		// Save the ticket
		await ticket.save()

		// 'await' is required here to be sure that msg.ack invokes
		// only if the event publishing is successful
		await new TicketUpdatedPublisher(this.client).publish({
			id: ticket.id,
			title: ticket.title,
			price: ticket.price,
			userId: ticket.userId,
			version: ticket.version,
			orderId: ticket.orderId
		})

		// Ack the message
		msg.ack()
	}
}
