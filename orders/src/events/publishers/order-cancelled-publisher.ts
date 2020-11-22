import { Publisher, Subjects, OrderCancelledEvent } from '@reedytickets/common'

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
	subject: Subjects.OrderCancelled = Subjects.OrderCancelled
}
