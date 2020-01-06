const http = require('http')
const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan');
const cors = require('cors')
const app = express()
require('dotenv').config()
const Phone = require('./models/phone')

var loggerFormat = ':method :url :status - :response-time ms :person';

morgan.token('person', function getPerson(req) {
  return req.body
});


app.use(cors())
app.use(express.static('build'))
app.use(bodyParser.json())
app.use(morgan(loggerFormat));

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

app.get('/api/persons/:id', (req, res, next) => {
  Phone.findById(req.params.id)
  .then(phone => {
    if (phone) {
      res.json(phone.toJSON())
    } else {
      res.status(404).end()
    }
  })
  .catch(error => next(error))
})


app.delete('/api/persons/:id', (req, res, next) => {
  Phone.findByIdAndRemove(req.params.id)
  .then(result => {
    res.status(204).end()
  })
  .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
  const body = req.body

  console.log('******* +++++ ******** &&&&&&& HOLA2!!!')

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
  .catch(error => next(error))
})


app.get('/info', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('Phonebook has info for ' + persons.length + ' people. \r\r' + new Date())
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.name, '--->', error.message)
 
  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})