import express from 'express'
import 'express-async-errors'
import cookieSession from 'cookie-session'
import { errorHandler, NotFoundError, currentUser } from '@reedytickets/common'

import { indexTicketRouter } from './routes'
import { createTicketRouter } from './routes/new'
import { showTicketRouter } from './routes/show'
import { updateTicketRouter } from './routes/update'

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
app.use(currentUser)

app.use(indexTicketRouter)
app.use(createTicketRouter)
app.use(showTicketRouter)
app.use(updateTicketRouter)

// Handle wrong routes
app.all('*', async (req, res) => {
	throw new NotFoundError()
})

app.use(errorHandler)

// {} because we are doing a NAMED export
export { app }
