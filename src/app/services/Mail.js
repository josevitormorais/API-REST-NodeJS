const path = require('path')
const nodemailer = require('nodemailer')
const mailConfig = require('../../config/mail')
const hbs = require('nodemailer-express-handlebars')
const exphbs = require('express-handlebars')
const transport = nodemailer.createTransport(mailConfig)

const viewPath = path.resolve(__dirname, '..', 'views', 'emails')

transport.use(
  'compile',
  hbs({
    viewEngine: exphbs.create({
      partialsDir: path.resolve(viewPath, 'partials'),
      defaultLayout: null
    }),
    viewPath,
    extName: '.hbs'
  })
)

module.exports = transport
