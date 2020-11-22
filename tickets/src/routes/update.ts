import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import { Ticket } from '../models/ticket'
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher'
import { natsWrapper } from '../nats-wrapper'
import {
	validateRequest,
	NotFoundError,
	requireAuth,
	NotAuthorizedError,
	BadRequestError
} from '@reedytickets/common'

const router = express.Router()

router.put(
	'/api/tickets/:id',
	requireAuth,
	[
		body('title').trim().not().isEmpty().withMessage('Title is required'),
		body('price')
			.isFloat({ gt: 0 })
			.withMessage('Price must be provided and must be greater than zero')
	],
	validateRequest,
	async (req: Request, res: Response) => {
		const { title, price } = req.body

		const ticket = await Ticket.findById(req.params.id)

		if (!ticket) {
			throw new NotFoundError()
		}

		if (ticket.orderId) {
			throw new BadRequestError('Cannot edit a reserved ticket')
		}

		if (ticket.userId !== req.currentUser!.id) {
			throw new NotAuthorizedError()
		}

		ticket.set({
			title,
			price
		})

		await ticket.save()

		// What if event sending fails???...
		await new TicketUpdatedPublisher(natsWrapper.client).publish({
			id: ticket.id,
			title: ticket.title,
			price: ticket.price,
			userId: ticket.userId,
			version: ticket.version
		})

		res.send(ticket)
	}
)

export { router as updateTicketRouter }