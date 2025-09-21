import { winstonLogger } from "@binh040105/jobber-shared";
import { Logger } from "winston";
import { config } from "./config";
import express, {Express} from 'express'
import { start } from "./server";


const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'notificationApp', 'debug')

const initialize = () : void => {
  const app : Express = express()
  start(app)
  log.info("Notification Service Initialize")
}

initialize()

