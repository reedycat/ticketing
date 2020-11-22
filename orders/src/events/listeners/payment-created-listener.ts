import {
	Subjects,
	Listener,
	PaymentCreatedEvent,
	OrderStatus
} from '@reedytickets/common'
import { Message } from 'node-nats-streaming'
import { Order } from '../../models/order'
import { queueGroupName } from './queue-group-name'

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
	subject: Subjects.PaymentCreated = Subjects.PaymentCreated
	queueGroupName = queueGroupName

	async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
		const { orderId } = data

		const order = await Order.findById(orderId)

		if (!order) {
			throw new Error('Order not found')
		}

		order.set({ status: OrderStatus.Complete })

		await order.save()

		// В идеале нужно бы публиковать событие "order:updated",
		// чтобы версия соответствовала версии заказа в зависимых сервисах
		// (если это нужно для конкретного приложения - для этого не нужно)

		msg.ack()
	}
}
