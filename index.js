const http = require('http')
const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan');
const cors = require('cors')
const app = express()
require('dotenv').config()
const Phone = require('./models/phone')

app.use(bodyParser.json())
var loggerFormat = ':method :url :status - :response-time ms :person';

morgan.token('person', function getPerson(req) {
  return req.body
});
app.use(morgan(loggerFormat));


app.use(cors())
app.use(express.static('build'))

let persons = []

const requestLogger = (request, response, next) => {
  console.log("**********************")
  console.log("Method: ", request.method)
  console.log("Path:  ", request.path)
  console.log("Body: ", request.body)
  console.log("---")
  next()
}
app.use(requestLogger)

app.get('/api/persons', (req, res) => {
  Phone.find({}).then(phones => {
    res.json(phones.map(phone => phone.toJSON()))
  })
})

app.get('/api/persons/:id', (req, res) => {
  Phone.findById(req.params.id).then(phone => {
    res.json(phone.toJSON())
  })
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  persons = persons.filter(p => p.id !== id)

  res.status(204).end()
})

app.post('/api/persons', (req, res) => {
  const body = req.body

  if (body.name === undefined || body.number === undefined) {
    return res.status(400).json({ error: 'content missing' })
  }

  const phone = new Phone({
    name: body.name,
    number: body.number,
  })

  phone.save().then(savedPhone => {
    res.json(savedPhone.toJSON())
  })
})


app.get('/info', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('Phonebook has info for ' + persons.length + ' people. \r\r' + new Date())
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})