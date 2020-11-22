import mongoose from 'mongoose'
import request from 'supertest'
import { app } from '../../app'
import { Ticket } from '../../models/ticket'

it('fetches the particular order', async () => {
	// Create a ticket
	const ticket = Ticket.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		title: 'concert',
		price: 20
	})

	await ticket.save()

	// Authorize a user
	const user = global.signup()

	// Make a request to build an order with this ticket
	const { body: order } = await request(app)
		.post('/api/orders')
		.set('Cookie', user)
		.send({ ticketId: ticket.id })
		.expect(201)

	// Make a request to fetch the order
	// (The user must be the same who created this order - e.i. the 'buyer')
	const { body: fetchedOrder } = await request(app)
		.get(`/api/orders/${order.id}`)
		.set('Cookie', user)
		.expect(200)

	expect(fetchedOrder.id).toEqual(order.id)
})

it('returns `Unauthorized` error if user try to fetch not own order', async () => {
	// Create a ticket
	const ticket = Ticket.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		title: 'concert',
		price: 20
	})

	await ticket.save()

	// Authorize a user
	const user = global.signup()

	// Make a request to build an order with this ticket
	const { body: order } = await request(app)
		.post('/api/orders')
		.set('Cookie', user)
		.send({ ticketId: ticket.id })
		.expect(201)

	// Make a request to fetch the order
	// (The user must be different (not the one who created this order))
	await request(app)
		.get(`/api/orders/${order.id}`)
		.set('Cookie', global.signup())
		.expect(401)
})
