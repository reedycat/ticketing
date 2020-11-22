import { Ticket } from '../ticket'

it('implements optimistic concurrency control', async (done) => {
	// Create an instance of ticket
	const ticket = Ticket.build({
		title: 'concert',
		price: 5,
		userId: '123'
	})

	// Save the ticket to the database
	await ticket.save()

	// Fetch the ticket twice
	const firstInstance = await Ticket.findById(ticket.id)
	const secondInstance = await Ticket.findById(ticket.id)

	// Make changes to each of the tickets we`ve fetched
	firstInstance!.set({ price: 10 })
	secondInstance!.set({ price: 15 })

	// Save the first fetched ticket
	await firstInstance!.save()

	// Save the second fetched ticket (must be an error of the unapropriate version)
	try {
		await secondInstance!.save()
	} catch (error) {
		return done()
	}

	throw new Error('Should not reach this poin')
})

it('increment the number of version on multiple saves', async () => {
	// Create an instance of ticket
	const ticket = Ticket.build({
		title: 'concert',
		price: 5,
		userId: '123'
	})

	// Save the ticket to the database
	await ticket.save()
	expect(ticket.version).toEqual(0)

	await ticket.save()
	expect(ticket.version).toEqual(1)

	await ticket.save()
	expect(ticket.version).toEqual(2)
})
