require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const databaseConfig = require('./config/database')
const validate = require('express-validation')
const Youch = require('youch')
const Sentry = require('@sentry/node')
const sentryConfig = require('./config/sentry')
class App {
  constructor () {
    this.express = express()
    this.isDev = process.env.NODE_ENV !== 'production'

    this.sentry()
    this.database()
    this.middlewares()
    this.routes()
    this.exception()
  }

  sentry () {
    Sentry.init(sentryConfig)
  }

  database () {
    mongoose.connect(databaseConfig.uri, {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
  }

  // CONFIGURAÇÃO DOS MIDDLEWARES
  middlewares () {
    this.express.use(express.json())
    this.express.use(Sentry.Handlers.requestHandler())
  }

  // CONFIGURAÇÕES DE ROTAS
  routes () {
    this.express.use(require('./routes'))
  }

  // TRATATIVAS DE ERROS
  exception () {
    // if (process.env.NODE_ENV === 'production') {
    this.express.use(Sentry.Handlers.errorHandler())
    // }
    this.express.use(async (err, req, res, next) => {
      if (err instanceof validate.ValidationError) {
        return res.status(err.status).json(err)
      }

      if (process.env.NODE_ENV !== 'production') {
        const youch = new Youch(err, req)

        return res.json(await youch.toJSON())
      }
      return res
        .status(err.status || 500)
        .json({ error: 'Internal Server Error' })
    })
  }
}

module.exports = new App().express
