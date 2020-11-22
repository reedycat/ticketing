import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { OrderCreatedEvent, OrderStatus } from '@reedytickets/common'
import { OrderCreatedListener } from '../order-created-listener'
import { natsWrapper } from '../../../nats-wrapper'
import { Ticket } from '../../../models/ticket'

const setup = async () => {
	//  Create an instance of the listener
	const listener = new OrderCreatedListener(natsWrapper.client)

	// Create and save ticket
	const ticket = Ticket.build({
		title: 'concert',
		price: 99,
		userId: 'owner_123'
	})

	await ticket.save()

	// Create the fake data event
	const data: OrderCreatedEvent['data'] = {
		id: new mongoose.Types.ObjectId().toHexString(),
		version: 0,
		status: OrderStatus.Created,
		userId: 'buyer_adsfasf',
		expiresAt: 'inseveralseconds',
		ticket: {
			id: ticket.id,
			price: ticket.price
		}
	}

	// @ts-ignore
	const msg: Message = {
		ack: jest.fn()
	}

	return { listener, ticket, data, msg }
}

it('sets the orderId of the ticket', async () => {
	const { listener, ticket, data, msg } = await setup()
	await listener.onMessage(data, msg)
	const updatedTicket = await Ticket.findById(ticket.id)

	expect(updatedTicket!.orderId).toEqual(data.id)
})

it('acks the message', async () => {
	const { listener, data, msg } = await setup()
	await listener.onMessage(data, msg)

	expect(msg.ack).toHaveBeenCalled()
})

it('publishes a ticket updated event', async () => {
	const { listener, data, msg } = await setup()

	await listener.onMessage(data, msg)

	expect(natsWrapper.client.publish).toHaveBeenCalled()

	// @ts-ignore
	// const ticketUpdatedData = JSON.parse(natsWrapper.client.publish.mock.calls[0][1])
	// console.log(natsWrapper.client.publish.mock.calls)

	// to not use ts-ignore:
	const ticketUpdatedData = JSON.parse(
		(natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
	)

	expect(ticketUpdatedData.id).toEqual(data.ticket.id)
	expect(ticketUpdatedData.orderId).toEqual(data.id)
})
