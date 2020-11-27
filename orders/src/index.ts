import mongoose from 'mongoose'
import { app } from './app'
import { natsWrapper } from './nats-wrapper'
import { TicketCreatedListener } from './events/listeners/ticket-created-listener'
import { TicketUpdatedListener } from './events/listeners/ticket-updated-listener'
import { ExpirationCompleteListener } from './events/listeners/expiration-complete-listener'
import { PaymentCreatedListener } from './events/listeners/payment-created-listener'

const start = async () => {
	console.log('Starting...')

	if (!process.env.JWT_KEY) {
		throw new Error('JWT_KEY must be defined')
	}

	if (!process.env.MONGO_URI) {
		throw new Error('MONGO_URI must be defined')
	}

	if (!process.env.NATS_CLUSTER_ID) {
		throw new Error('NATS_CLUSTER_ID must be defined')
	}

	if (!process.env.NATS_CLIENT_ID) {
		throw new Error('NATS_CLIENT_ID must be defined')
	}

	if (!process.env.NATS_URI) {
		throw new Error('NATS_URI must be defined')
	}

	try {
		await natsWrapper.connect(
			process.env.NATS_CLUSTER_ID,
			process.env.NATS_CLIENT_ID,
			process.env.NATS_URI
		)

		// Graceful Client Shutdown
		natsWrapper.client.on('close', () => {
			console.log('Nats connection closed')
			process.exit()
		})

		// On interrupted signals
		process.on('SIGINT', () => natsWrapper.client.close())
		// On terminated signals
		process.on('SIGTERM', () => natsWrapper.client.close())

		// Initialize listeners
		new TicketCreatedListener(natsWrapper.client).listen()
		new TicketUpdatedListener(natsWrapper.client).listen()
		new ExpirationCompleteListener(natsWrapper.client).listen()
		new PaymentCreatedListener(natsWrapper.client).listen()

		// Connect to MongoDB
		await mongoose.connect(process.env.MONGO_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true
		})

		console.log('Orders Connected to MongoDB')
	} catch (err) {
		console.error(err.message)
	}

	app.listen(3000, () => {
		console.log('Orders App listening on port 3000!!!')
	})
}

start()
