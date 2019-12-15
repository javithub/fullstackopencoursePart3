const mongoose = require('mongoose')

if (process.argv.length != 3 && process.argv.length != 5) {
  console.log('Wrong sintax: \n  1) node mongo.js pwd (read entries)\n  2) node mongo.js pwd name phone (add entries)')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://fullstack:${password}@cluster0-wvqaa.mongodb.net/phonebook-app?retryWrites=true`

mongoose.connect(url, { useNewUrlParser: true })

const phoneSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Phone = mongoose.model('Phone', phoneSchema)


// In case we are reading entries, we display the information
if (process.argv.length == 3) {
  Phone.find({}).then(result => {
    result.forEach(phone => {
      console.log(phone)
    })
    mongoose.connection.close()
  })
  // We are adding entries
} else {
  const phone = new Phone({
    name: process.argv[3],
    number: process.argv[4],
  })
  
  phone.save().then(response => {
    console.log('phone saved!')
    mongoose.connection.close()
  })
  
}
