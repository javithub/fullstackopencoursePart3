const mongoose = require('mongoose')
var uniqueValidator = require('mongoose-unique-validator');
require('dotenv').config()

const url = process.env.MONGODB_URI
console.log('connecting to', url)

mongoose.connect(url, { useNewUrlParser: true })
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

  const phoneSchema = new mongoose.Schema({

    name: {
      type: String,
      minlength: 3,
      required: true,
      unique: true
    },
    number: { 
      type: String,
      minlength: 8,
      required: true
    },   
  })

  // Apply the uniqueValidator plugin to phoneSchema.
  phoneSchema.plugin(uniqueValidator);

  phoneSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Phone', phoneSchema)