import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import {
  IMailSender,
  SendMailOptions,
} from '../../application/services/mail-sender.interface';

@Injectable()
export class NodemailerMailSender implements IMailSender {
  private readonly logger = new Logger(NodemailerMailSender.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('MAIL_HOST');
    const port = Number(this.config.get<number>('MAIL_PORT') ?? 1025);
    const user = this.config.get<string>('MAIL_USER');
    const pass = this.config.get<string>('MAIL_PASS');

    if (host) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: false,
        ...(user && pass ? { auth: { user, pass } } : {}),
      });
      this.logger.log(`📬 Serveur SMTP connecté à ${host}:${port}`);
    } else {
      this.logger.warn(
        '⚠️ Aucun serveur SMTP configuré (MAIL_HOST). Les emails seront affichés dans la console.',
      );
    }
  }

  async sendMail(options: SendMailOptions): Promise<void> {
    if (this.transporter) {
      await this.transporter.sendMail({
        from:
          this.config.get<string>('MAIL_FROM') ?? '"Homee-z" <noreply@homeez.fr>',
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
    } else {
      this.logger.log(`\n📧 [EMAIL MAGIQUE ENVOYÉ]
-------------------------------------------
Destinataire : ${options.to}
Objet        : ${options.subject}
Contenu HTML :
${options.html}
-------------------------------------------\n`);
    }
  }
}

