import mongoose from 'mongoose'
import { app } from './app'

const start = async () => {
	if (!process.env.JWT_KEY) {
		throw new Error('JWT_KEY must be defined')
	}

	if (!process.env.MONGO_URI) {
		throw new Error('MONGO_URI must be defined')
	}

	// await mongoose
	// 	.connect('mongodb://auth-mongo-srv:27017/auth', {
	// 		useNewUrlParser: true,
	// 		useUnifiedTopology: true,
	// 		useCreateIndex: true
	// 	})
	// 	.then((res) => {
	// 		console.log('Auth Connected to MongoDB')
	// 	})
	// 	.catch((err) => {
	// 		console.log(Error, err.message)
	// 	})

	try {
		// !!!
		// https://docs.mongodb.com/kubernetes-operator/master/tutorial/create-operator-credentials/
		await mongoose.connect(process.env.MONGO_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true
		})
		// .then((res) => {
		// 	console.log('Auth Connected to MongoDB')
		// })
		// .catch((err) => {
		// 	console.log(Error, err.message)
		// })

		console.log('Auth Connected to MongoDB')
	} catch (error) {
		console.error(error.message)
	}

	app.listen(3000, () => {
		console.log('Auth App listening on port 3000!!!')
	})
}

start()

// How to install and run Typescript locally in npm?
// https://stackoverflow.com/questions/38030078/how-to-install-and-run-typescript-locally-in-npm/54053816#54053816
