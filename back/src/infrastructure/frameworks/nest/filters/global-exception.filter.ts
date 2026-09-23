import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const isHttpException = exception instanceof HttpException;
    const statusCode = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal server error';
    let errors: string[] | undefined;

    if (isHttpException) {
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (exceptionResponse && typeof exceptionResponse === 'object') {
        const res = exceptionResponse as Record<string, unknown>;

        if (Array.isArray(res.message)) {
          // Cas du ValidationPipe : plusieurs erreurs de validation à la fois
          message = 'Validation failed';
          errors = res.message as string[];
        } else if (typeof res.message === 'string') {
          message = res.message;
        }
      }
    } else {
      // Erreur inattendue (bug, crash) : on ne renvoie jamais le détail au client,
      // mais on log côté serveur pour pouvoir débugger
      console.error(exception);
    }

    response.status(statusCode).json({
      statusCode,
      message,
      ...(errors ? { errors } : {}),
    });
  }
}