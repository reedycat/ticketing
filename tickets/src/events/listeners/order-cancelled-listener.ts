import {
	Listener,
	OrderCancelledEvent,
	Subjects,
	NotFoundError
} from '@reedytickets/common'
import { Message } from 'node-nats-streaming'
import { queueGroupName } from './queue-group-name'
import { Ticket } from '../../models/ticket'
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher'

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
	subject: Subjects.OrderCancelled = Subjects.OrderCancelled
	queueGroupName = queueGroupName

	async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
		const ticket = await Ticket.findById(data.ticket.id)

		// If no ticket throw  error
		if (!ticket) {
			throw new NotFoundError()
		}

		// Remove 'orderId' prop to mark ticket being UNreserved
		// make it 'undefined' (instead of 'null') for correct typescript checking (orderId?: ...)
		ticket.set({
			orderId: undefined
		})

		// Save the ticket
		await ticket.save()

		// Publish an event (listening in order service and payment service)
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
