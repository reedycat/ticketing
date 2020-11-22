import { Subjects } from './subjects'

export interface TicketCreatedEvent {
  readonly subject: Subjects.TicketCreated
  data: {
    id: string
    title: string
    price: number
  }
}
