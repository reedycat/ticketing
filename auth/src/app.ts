import express from 'express'
import 'express-async-errors'
import cookieSession from 'cookie-session'

import { signinRouter } from './routes/signin'
import { signupRouter } from './routes/signup'
import { signoutRouter } from './routes/signout'
import { currentUserRouter } from './routes/current-user'

import { errorHandler, NotFoundError } from '@reedytickets/common'

const app = express()
// allow ingress nginx as a proxy
// (consider traffic as secure even it comes from a proxy)
app.set('trust proxy', true)
app.use(express.json())
app.use(
	cookieSession({
		signed: false,
		secure: process.env.NODE_ENV !== 'test'
	})
)

app.use(signinRouter)
app.use(signupRouter)
app.use(signoutRouter)
app.use(currentUserRouter)

// Handle wrong routes
app.all('*', async (req, res) => {
	throw new NotFoundError()
})

app.use(errorHandler)

// {} because we are doing a NAMED export
export { app }
