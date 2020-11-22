import request from 'supertest'
import { app } from '../../app'
import mongoose from 'mongoose'
import { Ticket } from '../../models/ticket'
// Actually jest imports the fake natsWrapper:
import { natsWrapper } from '../../nats-wrapper'

it('returns a 404 if provided id does not exist', async () => {
	const id = new mongoose.Types.ObjectId().toHexString()
	const title = 'Concert'
	const price = 20

	await request(app)
		.put(`/api/tickets/${id}`)
		.set('Cookie', global.signup())
		.send({ title, price })
		.expect(404)
})

it('returns a 401 if the user is not authenticated', async () => {
	const id = new mongoose.Types.ObjectId().toHexString()
	const title = 'Concert'
	const price = 20

	await request(app)
		.put(`/api/tickets/${id}`)
		.send({ title, price })
		.expect(401)
})

// TO DO: here must be 403 forbidden
it('returns a 401 if the user does not own the ticket', async () => {
	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', global.signup())
		.send({
			title: 'adfasf',
			price: 20
		})

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', global.signup())
		.send({ title: 'asdfasfaf', price: 15 })
		.expect(401)
})

it('returns a 400 if the user provided invalid title or price', async () => {
	const cookie = global.signup()
	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({
			title: 'Concert',
			price: 20
		})

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({ title: '', price: 20 })
		.expect(400)

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({ title: 'Film', price: -20 })
		.expect(400)
})

it('update the ticket provided valid inputs', async () => {
	const newTitle = 'Film'
	const newPrice = 12.99
	const cookie = global.signup()

	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({
			title: 'Concert',
			price: 20
		})

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({ title: newTitle, price: newPrice })
		.expect(200)

	const ticketResponse = await request(app)
		.get(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send()
		.expect(200)

	expect(ticketResponse.body.title).toEqual(newTitle)
	expect(ticketResponse.body.price).toEqual(newPrice)
})

it('publishes an event', async () => {
	const newTitle = 'Film'
	const newPrice = 12.99
	const cookie = global.signup()

	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({
			title: 'Concert',
			price: 20
		})

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({ title: newTitle, price: newPrice })
		.expect(200)

	expect(natsWrapper.client.publish).toHaveBeenCalled()
})

it('rejects updates if the ticket is reserved', async () => {
	const cookie = global.signup()

	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({
			title: 'Concert',
			price: 20
		})

	const ticket = await Ticket.findById(response.body.id)
	const orderId = new mongoose.Types.ObjectId().toHexString()

	ticket!.set({ orderId })

	await ticket!.save()

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({ title: 'newTitle', price: 100 })
		.expect(400)
})
