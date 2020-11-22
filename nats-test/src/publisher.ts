import nats from 'node-nats-streaming'
import { TicketCreatedPublisher } from './events/ticket-created-publisher'

console.clear()

// "stan" - is just a term for a "client" by convention
const stan = nats.connect('ticketing', 'abc', {
  url: 'http://localhost:4222'
})

stan.on('connect', async () => {
  console.log('Publisher connected to NATS')

  const publisher = new TicketCreatedPublisher(stan)

  try {
    await publisher.publish({
      id: '123',
      title: 'Concert',
      price: 25
    })
  } catch (err) {
    console.log(err)
  }

  // // In Nats we can transmit plane strings only,
  // // so, convert an object to JSON, which is actually a string
  // const data = JSON.stringify({
  //   id: '123',
  //   title: 'Concert',
  //   price: 20
  // })

  // // The callback function is optional here
  // stan.publish('ticket:created', data, (err, guid) => {
  //   if (err) {
  //     console.log('Publish failed: ' + err)
  //   } else {
  //     console.log('Message published with guid: ' + guid)
  //   }
  // })



})
