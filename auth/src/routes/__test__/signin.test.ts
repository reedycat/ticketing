import request from 'supertest'
import { app } from '../../app'

// here could be added tests equal to signup flow
// (invalid email, password, etc. that are similar to this flow)

it('fails when supplying email does not exists in DB', async () => {
	await request(app)
		.post('/api/users/signin')
		.send({
			email: 'test@test.com',
			password: 'testpassword'
		})
		.expect(400)
})

it('fails if incorrect password is supplied to existing account', async () => {
	await request(app)
		.post('/api/users/signup')
		.send({
			email: 'test@test.com',
			password: 'testpassword'
		})
		.expect(201)

	await request(app)
		.post('/api/users/signin')
		.send({
			email: 'test@test.com',
			password: 'wrongpassword'
		})
		.expect(400)
})

it('responds with a cookie when given valid credentials', async () => {
	await request(app)
		.post('/api/users/signup')
		.send({
			email: 'test@test.com',
			password: '123456'
		})
		.expect(201)

	const response = await request(app)
		.post('/api/users/signin')
		.send({
			email: 'test@test.com',
			password: '123456'
		})
		.expect(200)

	expect(response.get('Set-Cookie')).toBeDefined()
})
