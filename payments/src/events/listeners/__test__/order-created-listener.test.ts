import { OrderCreatedEvent, OrderStatus } from '@reedytickets/common'
import { natsWrapper } from '../../../nats-wrapper'
import { Message } from 'node-nats-streaming'
import { OrderCreatedListener } from '../order-created-listener'
import { Order } from '../../../models/order'
import mongoose from 'mongoose'

const setup = async () => {
	const listener = new OrderCreatedListener(natsWrapper.client)

	const data: OrderCreatedEvent['data'] = {
		id: new mongoose.Types.ObjectId().toHexString(),
		version: 0,
		expiresAt: 'asdfasff',
		status: OrderStatus.Created,
		userId: 'asdfasf',
		ticket: {
			id: new mongoose.Types.ObjectId().toHexString(),
			price: 25
		}
	}

	// @ts-ignore
	const msg: Message = {
		ack: jest.fn()
	}

	return { listener, data, msg }
}

it('replicates order info', async () => {
	const { listener, data, msg } = await setup()
	await listener.onMessage(data, msg)

	const order = await Order.findById(data.id)

	expect(order!.price).toEqual(data.ticket.price)
})

it('acks the message', async () => {
	const { listener, data, msg } = await setup()
	await listener.onMessage(data, msg)

	expect(msg.ack).toHaveBeenCalled()
})
