import request from 'supertest'
import { app } from '../../app'
import { Ticket } from '../../models/ticket'
// Actually jest imports the fake natsWrapper from __mocks__:
import { natsWrapper } from '../../nats-wrapper'

it('has a route handler listening to /api/tickets for post request', async () => {
	const response = await request(app).post('/api/tickets').send({})

	expect(response.status).not.toEqual(404)
})

it('can only be accessed if the user is signed in', async () => {
	await request(app).post('/api/tickets').send({}).expect(401)
})

it('return a status other than 401 if the user is signed in', async () => {
	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', global.signup())
		.send({})

	// console.log(response.status)

	expect(response.status).not.toEqual(401)
})

it('returns an error if an invalid title is provided', async () => {
	await request(app)
		.post('/api/tickets')
		.set('Cookie', global.signup())
		.send({
			title: '',
			price: 10
		})
		.expect(400)

	await request(app)
		.post('/api/tickets')
		.set('Cookie', global.signup())
		.send({
			price: 10
		})
		.expect(400)
})

it('returns an error if an invalid price is provided', async () => {
	await request(app)
		.post('/api/tickets')
		.set('Cookie', global.signup())
		.send({
			title: 'This is a valid title',
			price: -10
		})
		.expect(400)

	await request(app)
		.post('/api/tickets')
		.set('Cookie', global.signup())
		.send({
			title: 'This is a valid title'
		})
		.expect(400)
})

it('creates a ticket with valid inputs', async () => {
	let tickets = await Ticket.find({})
	expect(tickets.length).toEqual(0)

	const title = 'This is a valid title'
	const price = 10.99

	await request(app)
		.post('/api/tickets')
		.set('Cookie', global.signup())
		.send({
			title,
			price
		})
		.expect(201)

	tickets = await Ticket.find({})
	expect(tickets.length).toEqual(1)
	expect(tickets[0].title).toEqual(title)
	expect(tickets[0].price).toEqual(price)
})

it('publishes an event', async () => {
	const title = 'This is a valid title'
	const price = 10.99

	await request(app)
		.post('/api/tickets')
		.set('Cookie', global.signup())
		.send({
			title,
			price
		})
		.expect(201)

	expect(natsWrapper.client.publish).toHaveBeenCalled()
})
