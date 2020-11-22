import request from 'supertest'
import { app } from '../../app'
import mongoose from 'mongoose'
import { Order, OrderStatus } from '../../models/order'
import { Payment } from '../../models/payment'
import { stripe } from '../../stripe'

// jest.mock('../../stripe')

it('returns a 404 if purchasing order not found', async () => {
	await request(app)
		.post('/api/payments')
		.set('Cookie', global.signup())
		.send({
			token: 'adfafsadfasf',
			orderId: new mongoose.Types.ObjectId().toHexString()
		})
		.expect(404)
})

it('returns a 401 if purchasing order does not belong to the user', async () => {
	const order = Order.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		version: 0,
		userId: new mongoose.Types.ObjectId().toHexString(),
		price: 10,
		status: OrderStatus.Created
	})

	await order.save()

	await request(app)
		.post('/api/payments')
		.set('Cookie', global.signup())
		.send({
			token: 'adfafsadfasf',
			orderId: order.id
		})
		.expect(401)
})

it('returns a 400 when purchasing a cancelled order', async () => {
	const userId = new mongoose.Types.ObjectId().toHexString()

	const order = Order.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		version: 0,
		userId,
		price: 10,
		status: OrderStatus.Cancelled
	})

	await order.save()

	await request(app)
		.post('/api/payments')
		.set('Cookie', global.signup(userId))
		.send({
			token: 'adfafsadfasf',
			orderId: order.id
		})
		.expect(400)
})

// *** Mock testing stripe without reaching real API *** /
// it('returns a 201 with valid inputs', async () => {
// 	const userId = new mongoose.Types.ObjectId().toHexString()

// 	const order = Order.build({
// 		id: new mongoose.Types.ObjectId().toHexString(),
// 		version: 0,
// 		userId,
// 		price: 20,
// 		status: OrderStatus.Created
// 	})

// 	await order.save()

// 	await request(app)
// 		.post('/api/payments')
// 		.set('Cookie', global.signup(userId))
// 		.send({
// 			token: 'tok_visa',
// 			orderId: order.id
// 		})
// 		.expect(201)

// 	const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0]
// 	// console.log(chargeOptions)

// 	expect(chargeOptions.source).toEqual('tok_visa')
// 	expect(chargeOptions.amount).toEqual(order.price * 100)
// 	expect(chargeOptions.currency).toEqual('usd')
// })

// *** Realistic test reaching real Stripe API *** /
it('returns a 201 with valid inputs', async () => {
	const userId = new mongoose.Types.ObjectId().toHexString()

	// Using unique price to identify the charge
	const price = Math.floor(Math.random() * 100000)

	const order = Order.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		version: 0,
		userId,
		price,
		status: OrderStatus.Created
	})

	await order.save()

	await request(app)
		.post('/api/payments')
		.set('Cookie', global.signup(userId))
		.send({
			token: 'tok_visa',
			orderId: order.id
		})
		.expect(201)

	const stripeCharges = await stripe.charges.list({ limit: 50 })

	const stripeCharge = stripeCharges.data.find((charge) => {
		return charge.amount === price * 100
	})

	// console.log(stripeCharge)

	expect(stripeCharge).toBeDefined()
	expect(stripeCharge!.amount).toEqual(order.price * 100)
	expect(stripeCharge!.currency).toEqual('usd')

	const payment = await Payment.findOne({
		orderId: order.id,
		stripeId: stripeCharge!.id
	})

	expect(payment).not.toBeNull()
})
