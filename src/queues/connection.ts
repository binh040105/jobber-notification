import { winstonLogger } from '@binh040105/jobber-shared'
import { config } from '@notification/config'
import client, {Channel, ChannelModel, Connection} from 'amqplib'
import { Logger } from 'winston'

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, "notificationQueueConnection", "debug")

export const createConnection = async () : Promise<Channel|undefined> => {
  try {
    const connection : ChannelModel = await client.connect(`${config.RABBITMQ_ENDPOINT}`)
    const channel : Channel = await connection.createChannel()
    log.info("Notification server connected to queue successfully...")
    closeConnection(channel, connection)
    return channel
  } catch (error) {
    log.log("error", "NotificationService createConnection() method", error)
    return undefined
  }
}

const closeConnection = (channel: Channel, connection: ChannelModel) : void => {
  process.once('SIGINT', async () => {
    await channel.close()
    await connection.close()
  })
}