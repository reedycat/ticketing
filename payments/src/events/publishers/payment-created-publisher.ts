import { Subjects, Publisher, PaymentCreatedEvent } from '@reedytickets/common'

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
	subject: Subjects.PaymentCreated = Subjects.PaymentCreated
}
