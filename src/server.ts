import { IEmailMessageDetails, winstonLogger } from '@binh040105/jobber-shared'
import 'express-async-errors'
import { Logger } from 'winston'
import { config } from './config'
import { Application } from 'express'
import http from 'http'
import { healthRoutes } from './routes'
import { checkConnection } from './elasticsearch'
import { createConnection } from './queues/connection'
import { Channel } from 'amqplib'
import {consumeAuthEmailMessages, consumeOrderEmailMessages } from './queues/email.consumer'

const SERVER_PORT = 4001

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'notificationServer', 'debug')

export const start = (app: Application) : void => {
  startServer(app)

  // http://localhost:4001/notification-health
  app.use('', healthRoutes)
  startQueues()
  startElasticSearch()
}

const startQueues = async () : Promise<void> => {
  const emailChannel : Channel = await createConnection() as Channel
  await consumeOrderEmailMessages(emailChannel)
  await consumeAuthEmailMessages(emailChannel)

  const verificationLink = `${config.CLIENT_URL}/confirm_email?v_token=1232412ca`
  const messageDetails: IEmailMessageDetails = {
    receiverEmail: `${config.SENDER_EMAIL}`,
    verifyLink: verificationLink,
    template: 'verifyEmail',
  }
}

const startElasticSearch = () : void => {
  checkConnection()
}

const startServer = (app:Application) : void => {
  try {
    const httpServer : http.Server = new http.Server(app)
    log.info(`Worker with process id of ${process.pid} on notification server has started`)
    httpServer.listen(SERVER_PORT, () => {
      log.info(`Notification server running on port: ${SERVER_PORT}`)
    })
  } catch (error) {
    log.log('error', 'NotificationService startServer() method:', error)
  }
}