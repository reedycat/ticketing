import mongoose from 'mongoose'
import { updateIfCurrentPlugin } from 'mongoose-update-if-current'
import { idText } from 'typescript'
import { Order, OrderStatus } from './order'

interface TicketAttrs {
	id: string
	title: string
	price: number
}

export interface TicketDoc extends mongoose.Document {
	title: string
	price: number
	version: number
	isReserved(): Promise<boolean>
}

interface TicketModel extends mongoose.Model<TicketDoc> {
	build(attrs: TicketAttrs): TicketDoc
	findByEvent(event: { id: string; version: number }): Promise<TicketDoc | null>
}

const ticketSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true
		},
		price: {
			type: Number,
			required: true,
			min: 0
		}
	},
	{
		toJSON: {
			transform(doc, ret) {
				ret.id = ret._id
				delete ret._id
			}
		}
	}
)

// Changing '__v' key for just 'version'
ticketSchema.set('versionKey', 'version')

// OCC plugin connection to the schema
ticketSchema.plugin(updateIfCurrentPlugin)

// 'Static' - methods we add to Model:
ticketSchema.statics.findByEvent = (event: { id: string; version: number }) => {
	return Ticket.findOne({
		_id: event.id,
		version: event.version - 1
	})
}

ticketSchema.statics.build = (attrs: TicketAttrs) => {
	return new Ticket({
		_id: attrs.id,
		title: attrs.title,
		price: attrs.price
	})
}

// 'Methods' - methods we add to Document.
// Keyword 'function' is required here!
ticketSchema.methods.isReserved = async function () {
	// this === the ticket document
	const existingOrder = await Order.findOne({
		ticket: this,
		status: {
			$in: [
				OrderStatus.Created,
				OrderStatus.AwaitingPayment,
				OrderStatus.Complete
			]
		}
	})

	return !!existingOrder
}

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema)

export { Ticket }
