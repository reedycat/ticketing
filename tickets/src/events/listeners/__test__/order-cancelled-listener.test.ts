import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { OrderCancelledEvent, OrderStatus } from '@reedytickets/common'
import { OrderCancelledListener } from '../order-cancelled-listener'
import { natsWrapper } from '../../../nats-wrapper'
import { Ticket } from '../../../models/ticket'

const setup = async () => {
	//  Create an instance of the listener
	const listener = new OrderCancelledListener(natsWrapper.client)

	const orderId = new mongoose.Types.ObjectId().toHexString()

	// Create and save ticket
	const ticket = Ticket.build({
		title: 'concert',
		price: 99,
		userId: 'owner_123'
	})

	ticket.set({ orderId })

	await ticket.save()

	// Create the fake data event
	const data: OrderCancelledEvent['data'] = {
		id: orderId,
		version: 0,
		ticket: {
			id: ticket.id
		}
	}

	// @ts-ignore
	const msg: Message = {
		ack: jest.fn()
	}

	return { listener, ticket, data, msg }
}

it('updates the ticket, publishes an event and acks the message', async () => {
	const { listener, ticket, data, msg } = await setup()

	await listener.onMessage(data, msg)

	const updatedTicket = await Ticket.findById(ticket.id)

	expect(updatedTicket!.orderId).not.toBeDefined()
	expect(msg.ack).toHaveBeenCalled()
	expect(natsWrapper.client.publish).toHaveBeenCalled()
})
