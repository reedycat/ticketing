import express, { Request, Response } from 'express'
const router = express.Router()

import { body } from 'express-validator'
import { validateRequest, BadRequestError } from '@reedytickets/common'
import { User } from '../models/user'
import { Password } from '../services/Password'
import jwt from 'jsonwebtoken'

router.post(
	'/api/users/signin',
	[
		body('email').isEmail().withMessage('Email must be valid'),
		body('password').trim().notEmpty().withMessage('You must supply a password')
	],
	validateRequest,
	async (req: Request, res: Response) => {
		const { email, password } = req.body

		const existingUser = await User.findOne({ email })

		if (!existingUser) {
			throw new BadRequestError('Invalid credentials')
		}

		const passwordsMatch = await Password.compare(
			existingUser.password,
			password
		)

		if (!passwordsMatch) {
			throw new BadRequestError('Invalid credentials')
		}

		// Generate JWT
		const userJwt = jwt.sign(
			{
				id: existingUser.id,
				email: existingUser.email
			},
			process.env.JWT_KEY!
		)

		// Store JWT on session object
		req.session = {
			jwt: userJwt
		}

		res.status(200).send(existingUser)
	}
)

export { router as signinRouter }
