import mongoose from 'mongoose'
import request from 'supertest'
import { app } from '../../app'
import { Order, OrderStatus } from '../../models/order'
import { Ticket } from '../../models/ticket'
// Actually jest imports the fake natsWrapper from __mocks__:
import { natsWrapper } from '../../nats-wrapper'

it('returns an error if the ticket does not exist', async () => {
	const ticketId = new mongoose.Types.ObjectId().toHexString()
	await request(app)
		.post('/api/orders')
		.set('Cookie', global.signup())
		.send({ ticketId })
		.expect(404)
})

it('returns en error if the ticket is already reserved', async () => {
	const ticket = Ticket.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		title: 'Concert',
		price: 30
	})

	await ticket.save()

	const order = Order.build({
		userId: 'dfghdfhdhh',
		status: OrderStatus.Created,
		expiresAt: new Date(),
		ticket
	})

	await order.save()

	await request(app)
		.post('/api/orders')
		.set('Cookie', global.signup())
		.send({ ticketId: ticket.id })
		.expect(400)
})

it('reserves ticket', async () => {
	const ticket = Ticket.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		title: 'Nascar',
		price: 300
	})

	await ticket.save()

	await request(app)
		.post('/api/orders')
		.set('Cookie', global.signup())
		.send({ ticketId: ticket.id })
		.expect(201)

	// would be better to check the returning order body also!
	// ...
})

it('emits an order created event', async () => {
	const ticket = Ticket.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		title: 'Nascar',
		price: 300
	})

	await ticket.save()

	await request(app)
		.post('/api/orders')
		.set('Cookie', global.signup())
		.send({ ticketId: ticket.id })
		.expect(201)

	expect(natsWrapper.client.publish).toHaveBeenCalled()
})
