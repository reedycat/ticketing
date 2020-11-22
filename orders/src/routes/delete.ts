import express, { Request, Response } from 'express'
import mongoose from 'mongoose'
import { Order } from '../models/order'
import {
	NotFoundError,
	BadRequestError,
	NotAuthorizedError,
	requireAuth,
	OrderStatus
} from '@reedytickets/common'
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher'
import { natsWrapper } from '../nats-wrapper'

const router = express.Router()

// Actually we are not deleting the order but just changing it`s status to 'Cancelled'
router.delete(
	'/api/orders/:orderId',
	requireAuth,
	async (req: Request, res: Response) => {
		const { orderId } = req.params

		if (!mongoose.Types.ObjectId.isValid(orderId)) {
			throw new BadRequestError('Not valid order ID')
		}

		const order = await Order.findById(orderId).populate('ticket')

		if (!order) {
			throw new NotFoundError()
		}

		if (order.userId !== req.currentUser!.id) {
			throw new NotAuthorizedError()
		}

		order.status = OrderStatus.Cancelled

		await order.save()

		// Publishing an event saying the order was cancelled
		await new OrderCancelledPublisher(natsWrapper.client).publish({
			id: order.id,
			version: order.version,
			ticket: {
				id: order.ticket.id
			}
		})

		res.status(204).send(order)
	}
)

export { router as deleteOrderRouter }
