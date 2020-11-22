export const natsWrapper = {
	// Fake function for NATS client
	// client: {
	//   publish: (subject: string, data: string, callback: () => void) => {
	//     callback()
	//   }
	// }

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
