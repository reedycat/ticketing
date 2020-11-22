export const natsWrapper = {
	// Mock function to test expectations
	client: {
		publish: jest
			.fn()
			.mockImplementation(
				(subject: string, data: string, callback: () => void) => {
					callback()
				}
			)
	}
}
