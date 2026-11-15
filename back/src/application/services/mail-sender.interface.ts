export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

export const MAIL_SENDER = Symbol('MAIL_SENDER');

export interface IMailSender {
  sendMail(options: SendMailOptions): Promise<void>;
}

