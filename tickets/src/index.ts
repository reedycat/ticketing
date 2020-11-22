import mongoose from 'mongoose'
import { app } from './app'
import { natsWrapper } from './nats-wrapper'
import { OrderCreatedListener } from './events/listeners/order-created-listener'
import { OrderCancelledListener } from './events/listeners/order-cancelled-listener'

const start = async () => {
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

		// Start listeners
		new OrderCreatedListener(natsWrapper.client).listen()
		new OrderCancelledListener(natsWrapper.client).listen()

		// Connect to MongoDB
		await mongoose.connect(process.env.MONGO_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true
		})

		console.log('Tickets Connected to MongoDB')
	} catch (err) {
		console.error(err.message)
	}

	app.listen(3000, () => {
		console.log('Tickets App listening on port 3000!!!')
	})
}

start()
