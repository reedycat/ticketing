import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import { validateRequest, BadRequestError } from '@reedytickets/common'
import { User } from '../models/user'
import jwt from 'jsonwebtoken'

const router = express.Router()

// https://express-validator.github.io/docs/

router.post(
	'/api/users/signup',
	[
		body('email').isEmail().withMessage('Email must be valid'),
		body('password')
			.trim()
			.isLength({ min: 6, max: 20 })
			.withMessage('Password must be between 6 and 20 characters')
	],
	validateRequest,
	async (req: Request, res: Response) => {
		const { email, password } = req.body

		const existingUser = await User.findOne({ email })

		if (existingUser) {
			throw new BadRequestError('Email in use')
		}

		const user = User.build({
			email,
			password
		})

		await user.save()

		// Generate JWT
		const userJwt = jwt.sign(
			{
				id: user.id,
				email: user.email
			},
			process.env.JWT_KEY!
		)

		// Store JWT on session object
		req.session = {
			jwt: userJwt
		}

		return res.status(201).send(user)
	}
)

export { router as signupRouter }
