import { Listener, OrderCreatedEvent, Subjects } from '@reedytickets/common'
import { queueGroupName } from './queue-group-name'
import { Message } from 'node-nats-streaming'
import { Order } from '../../models/order'

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
	subject: Subjects.OrderCreated = Subjects.OrderCreated
	queueGroupName = queueGroupName

	async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
		const { id, version, userId, status, ticket } = data

		const order = Order.build({
			id,
			status,
			userId,
			version,
			price: ticket.price
		})

		await order.save()

		// Ack the message
		msg.ack()
	}
}
