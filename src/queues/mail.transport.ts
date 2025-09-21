import { IEmailLocals, winstonLogger } from "@binh040105/jobber-shared";
import { config } from "@notification/config";
import { emailTemplates } from "@notification/helpers";
import { Logger } from "winston";

const log : Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, "emailConsumer", "debug")

export const sendEmail = async (template: string, receiverEmail : string, locals: IEmailLocals) : Promise<void> => {
  try {
    //send email
    emailTemplates(template, receiverEmail, locals)

    //log
    log.info("Email sent successfully")
  } catch (error) {
    log.log("error", "NotificationService MailTransport sendEmail() method error: ", error)
  }
}