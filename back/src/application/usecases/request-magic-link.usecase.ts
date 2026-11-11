import { Email } from '../../domain/value-objects/email.value-object';
import { IUserRepository } from '../repositories/user.repository.interface';
import { IMailSender } from '../services/mail-sender.interface';
import {
  AccountLockedException,
  UserNotFoundException,
} from '../exceptions/auth.exceptions';

export interface RequestMagicLinkCommand {
  email: string;
  magicLinkUrl: string;
}

export class RequestMagicLinkUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly mailSender: IMailSender,
  ) {}

  public async execute(
    command: RequestMagicLinkCommand,
  ): Promise<{ userId: string; email: string }> {
    const email = new Email(command.email);
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UserNotFoundException(command.email);
    }

    if (user.isLocked()) {
      throw new AccountLockedException(15);
    }

    await this.mailSender.sendMail({
      to: user.email.getValue(),
      subject: 'Connexion à votre espace Homee-z (Lien Magique)',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #111827;">Bonjour ${user.firstName},</h2>
          <p style="color: #374151; font-size: 16px;">Vous avez demandé à vous connecter à votre compte Homee-z sans mot de passe.</p>
          <p style="color: #374151; font-size: 16px;">Cliquez sur le bouton ci-dessous pour vous connecter directement (ce lien est valable pendant 15 minutes) :</p>
          <p style="margin: 30px 0;">
            <a href="${command.magicLinkUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Me connecter à Homee-z
            </a>
          </p>
          <p style="color: #6b7280; font-size: 14px;">Ou copiez ce lien dans votre navigateur :<br /><a href="${command.magicLinkUrl}">${command.magicLinkUrl}</a></p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #9ca3af; font-size: 12px;">Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email en toute sécurité.</p>
        </div>
      `,
    });

    return {
      userId: user.id,
      email: user.email.getValue(),
    };
  }
}

