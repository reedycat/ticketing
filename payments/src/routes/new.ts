import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import {
	requireAuth,
	validateRequest,
	BadRequestError,
	NotFoundError,
	OrderStatus,
	NotAuthorizedError
} from '@reedytickets/common'
import { Order } from '../models/order'
import { Payment } from '../models/payment'
import { stripe } from '../stripe'
import { natsWrapper } from '../nats-wrapper'
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher'

const router = express.Router()

router.post(
	'/api/payments',
	requireAuth,
	[
		body('token').not().isEmpty().withMessage('Token must be provided'),
		body('orderId').not().isEmpty().withMessage('Order ID must be provided')
	],
	validateRequest,
	async (req: Request, res: Response) => {
		const { token, orderId } = req.body
		const order = await Order.findById(orderId)

		if (!order) {
			throw new NotFoundError()
		}

		if (order.userId !== req.currentUser!.id) {
			throw new NotAuthorizedError()
		}

		if (order.status === OrderStatus.Cancelled) {
			throw new BadRequestError('Cannot pay for an cancelled order')
		}

		const charge = await stripe.charges.create({
			amount: order.price * 100,
			currency: 'usd',
			source: token
		})

		const { id: stripeId } = charge

		const payment = Payment.build({
			orderId,
			stripeId
		})

		await payment.save()

		// 'await' if we want to send success response only after publishing the event!
		await new PaymentCreatedPublisher(natsWrapper.client).publish({
			id: payment.id,
			orderId: payment.orderId,
			stripeId: payment.stripeId
		})

		res.status(201).send({ id: payment.id })
	}
)

export { router as createChargeRouter }
