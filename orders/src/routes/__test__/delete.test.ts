import mongoose from 'mongoose'
import request from 'supertest'
import { app } from '../../app'
import { OrderStatus } from '../../models/order'
import { Ticket } from '../../models/ticket'
import { natsWrapper } from '../../nats-wrapper'

it('marks an order as cancelled', async () => {
	// Create a ticket with Ticket model
	const ticket = Ticket.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		title: 'concert',
		price: 20
	})

	await ticket.save()

	// Authorize a user
	const user = global.signup()

	// Make a request to create an order
	const { body: order } = await request(app)
		.post('/api/orders')
		.set('Cookie', user)
		.send({ ticketId: ticket.id })
		.expect(201)

	// Make a request to cancel the order
	await request(app)
		.delete(`/api/orders/${order.id}`)
		.set('Cookie', user)
		.expect(204)

	// Make a request to fetch cancelled order
	const { body: cancelledOrder } = await request(app)
		.get(`/api/orders/${order.id}`)
		.set('Cookie', user)
		.expect(200)

	// Expectation the order is cancelled
	expect(cancelledOrder.status).toEqual(OrderStatus.Cancelled)
})

it('emits an order cancelled event', async () => {
	// Create a ticket with Ticket model
	const ticket = Ticket.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		title: 'concert',
		price: 20
	})

	await ticket.save()

	// Authorize a user
	const user = global.signup()

	// Make a request to create an order
	const { body: order } = await request(app)
		.post('/api/orders')
		.set('Cookie', user)
		.send({ ticketId: ticket.id })
		.expect(201)

	// Make a request to cancel the order
	await request(app)
		.delete(`/api/orders/${order.id}`)
		.set('Cookie', user)
		.expect(204)

	// Make a request to fetch cancelled order
	const { body: cancelledOrder } = await request(app)
		.get(`/api/orders/${order.id}`)
		.set('Cookie', user)
		.expect(200)

	// Expectation the order is cancelled
	expect(cancelledOrder.status).toEqual(OrderStatus.Cancelled)

	expect(natsWrapper.client.publish).toHaveBeenCalled()
})
