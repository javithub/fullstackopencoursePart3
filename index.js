const http = require('http')
const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan');
const cors = require('cors')

const app = express()
app.use(bodyParser.json())
var loggerFormat = ':method :url :status - :response-time ms :person';

morgan.token('person', function getPerson(req) {
  return req.body
});
app.use(morgan(loggerFormat));


app.use(cors())
app.use(express.static('build'))

let persons = [
  {
    "name": "Arto Hellas",
    "number": "040-123456",
    "id": 1
  },
  {
    "name": "Ada Lovelace",
    "number": "39-44-5323523",
    "id": 2
  },
  {
    "name": "Dan Abramov",
    "number": "12-43-234345",
    "id": 3
  },
  {
    "name": "Mary Poppendieck",
    "number": "39-23-6423122",
    "id": 4
  }
]


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
  res.json(persons)
})

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  const person = persons.find(p => p.id === id)
  if (person) {
    res.json(person)
  } else {
    res.status(404).end()
  }
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  persons = persons.filter(p => p.id !== id)

  res.status(204).end()
})

app.post('/api/persons', (req, res) => {
  const person = req.body

  // Both name and number should be informed
  if (person.name && person.number) {

    // Control to check duplicate names
    const duplicated = persons.find(p => p.name === person.name)
    if (duplicated) {
      return res.status(400).json({ 
        error: 'name must be unique'
      })
    } 

    // At this point, both name and number are informed and also there's no other entry with the same name
    const personId = Math.floor(Math.random() * 10000)
    person.id = personId

    persons = persons.concat(person)

    res.json(person)
  } else {
    // Return message depending on name and number (if they are missing)
    var message = (person.name   === undefined || person.name  === "")?"Name is missing. ":"";
    message += (person.number === undefined || person.number === "")?"Number is missing":"";
    return res.status(400).json({ 
      error: message
    })
  }
})

app.get('/info', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('Phonebook has info for ' + persons.length + ' people. \r\r' + new Date())
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})