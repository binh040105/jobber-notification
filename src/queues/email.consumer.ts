import { IEmailLocals, winstonLogger } from '@binh040105/jobber-shared'
import { config } from '@notification/config'
import {Channel, ConsumeMessage} from 'amqplib'
import { Logger } from 'winston'
import { createConnection } from './connection'
import { sendEmail } from './mail.transport'

const log : Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'emailConsumer', 'debug')



export const consumeAuthEmailMessages = async (channel : Channel) : Promise<void> => {
  try {
    if(!channel){
      channel = await createConnection() as Channel
    }

    const exchangeName = "jobber-email-notification"
    const routingKey = "auth-email"
    const queueName = "auth-email-name"

    await channel.assertExchange(exchangeName, "direct")
    const jobberQueue = await channel.assertQueue(queueName, {durable: true, autoDelete: false})
    await channel.bindQueue(jobberQueue.queue, exchangeName, routingKey)

    channel.consume(jobberQueue.queue, async (msg : ConsumeMessage | null) => {
      const {receiverEmail, username, verifyLink, resetLink, template} = JSON.parse(msg?.content.toString() as string) 
      const locals : IEmailLocals = {
        appLink : `${config.CLIENT_URL}`,
        appIcon: 'https://ibb.co/Xr7GB98X',
        username,
        verifyLink,
        resetLink,
      }

      //Send email
      await sendEmail(template, receiverEmail, locals)
      //Acknowledge
      channel.ack(msg!)
    })
  } catch (error) {
    log.log("error", "NotificationService EmailConsumer consumeAuthEmailMessage() method error:", error)
  }
}

export const consumeOrderEmailMessages = async (channel : Channel) : Promise<void> => {
  try {
    if(!channel){
      channel = await createConnection() as Channel
    }

    const exchangeName = "jobber-order-notification"
    const routingKey = "order-email"
    const queueName = "order-email-name"

    await channel.assertExchange(exchangeName, "direct")
    const jobberQueue = await channel.assertQueue(queueName, {durable: true, autoDelete: false})
    await channel.bindQueue(jobberQueue.queue, exchangeName, routingKey)
    
    channel.consume(jobberQueue.queue, async (msg : ConsumeMessage | null) => {
    

    const {
      receiverEmail,
      username,
      template,
      sender,
      offerLink,
      amount,
      buyerUsername,
      sellerUsername,
      title,
      description,
      deliveryDays,
      orderId,
      orderDue,
      requirements,
      orderUrl,
      originalDate,
      newDate,
      reason,
      subject,
      header,
      type,
      message,
      serviceFee,
      total
    } = JSON.parse(msg?.content.toString() as string) 

    const locals: IEmailLocals = {
      appLink: `${config.CLIENT_URL}`,
      appIcon: 'https://ibb.co/Xr7GB98X',
      username,
      sender,
      offerLink,
      amount,
      buyerUsername,
      sellerUsername,
      title,
      description,
      deliveryDays,
      orderId,
      orderDue,
      requirements,
      orderUrl,
      originalDate,
      newDate,
      reason,
      subject,
      header,
      type,
      message,
      serviceFee,
      total
    }


      //Send email
      if(template === 'orderPlaced'){
        await sendEmail('orderPlaced', receiverEmail, locals)
        await sendEmail('orderReceipt', receiverEmail, locals)
      }else{
        await sendEmail(template, receiverEmail, locals)
      }
      //Acknowledge
      channel.ack(msg!)
    })
  } catch (error) {
    log.log("error", "NotificationService EmailConsumer consumeOrderEmailMessage() method error:", error)
  }
}