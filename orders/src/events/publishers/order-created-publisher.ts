import { Publisher, Subjects, OrderCreatedEvent } from '@reedytickets/common'

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
	subject: Subjects.OrderCreated = Subjects.OrderCreated
}
