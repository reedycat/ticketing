import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'

declare global {
	namespace NodeJS {
		interface Global {
			signup(id?: string): string[]
		}
	}
}

// Fake NATS client
jest.mock('../nats-wrapper')

process.env.STRIPE_KEY = 'sk_test_DTQGxF0gz39aU4obnckptEYl'

let mongo: any

beforeAll(async () => {
	process.env.JWT_KEY = 'asdfasdf'
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

	mongo = new MongoMemoryServer()
	const mongoUri = await mongo.getUri()

	await mongoose.connect(mongoUri, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	})
})

beforeEach(async () => {
	jest.clearAllMocks()

	const collections = await mongoose.connection.db.collections()

	for (let collection of collections) {
		await collection.deleteMany({})
	}
})

afterAll(async () => {
	await mongo.stop()
	await mongoose.connection.close()
})

global.signup = (id?: string) => {
	//  Build a JWT payload
	const payload = {
		id: id || new mongoose.Types.ObjectId().toHexString(),
		email: 'test@test.com'
	}

	// Create the JWT
	const token = jwt.sign(payload, process.env.JWT_KEY!)

	// Build session object
	const session = { jwt: token }

	// Turn session into json
	const sessionJson = JSON.stringify(session)

	// Take json and encode it as base64
	const base64 = Buffer.from(sessionJson).toString('base64')

	// Return a string thats the cookie with the encoded data
	return [`express:sess=${base64}`]
}
