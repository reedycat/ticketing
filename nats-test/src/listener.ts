import nats from 'node-nats-streaming'
import { randomBytes } from 'crypto'
import { TicketCreatedListener } from './events/ticket-created-listener'

console.clear()

// "stan" - is just a term for a "client" by convention
const stan = nats.connect('ticketing', randomBytes(4).toString('hex'), {
  url: 'http://localhost:4222'
})

stan.on('connect', () => {
  console.log('Listener connected to NATS')

  // Graceful Client Shutdown
  // (doesnt work on windows)
  stan.on('close', () => {
    console.log('Nats connection closed')
    process.exit()
  })

  new TicketCreatedListener(stan).listen()
})

// Monitoring clients:
// http://localhost:8222/streaming
// http://localhost:8222/streaming/channelsz?subs=1

// On interrupted signals (doesnt work on windows)
process.on('SIGINT', () => stan.close())
// On terminated signals
process.on('SIGTERM', () => stan.close())
