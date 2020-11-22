import request from 'supertest'
import { app } from '../../app'

// https://www.npmjs.com/package/supertest

it('returns a 201 on successful signup', async () => {
	return request(app)
		.post('/api/users/signup')
		.send({
			email: 'test@test.com',
			password: 'testpassword'
		})
		.expect(201)
})

it('returns a 400 with invalid email', async () => {
	return request(app)
		.post('/api/users/signup')
		.send({
			email: 'test@test',
			password: 'testpassword'
		})
		.expect(400)
})

it('returns a 400 with invalid password', async () => {
	return request(app)
		.post('/api/users/signup')
		.send({
			email: 'test@test.com',
			password: '123'
		})
		.expect(400)
})

// вместо return можно использовать await
it('returns a 400 with missing email and password', async () => {
	await request(app)
		.post('/api/users/signup')
		.send({
			email: 'test@test.com'
		})
		.expect(400)

	await request(app)
		.post('/api/users/signup')
		.send({
			password: '123456'
		})
		.expect(400)
})

it('disallows duplicate emails', async () => {
	await request(app)
		.post('/api/users/signup')
		.send({
			email: 'test@test.com',
			password: '123456'
		})
		.expect(201)

	await request(app)
		.post('/api/users/signup')
		.send({
			email: 'test@test.com',
			password: '123456'
		})
		.expect(400)
})

it('sets cookie after successful signup', async () => {
	const response = await request(app)
		.post('/api/users/signup')
		.send({
			email: 'test@test.com',
			password: '123456'
		})
		.expect(201)

	expect(response.get('Set-Cookie')).toBeDefined()
})
