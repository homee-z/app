import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

function isPaginatedResult(value: unknown): value is PaginatedResult<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'data' in value &&
    'meta' in value
  );
}

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((result: unknown) => {
        // Cas liste paginée : un use case a déjà renvoyé { data, meta }, on ne touche à rien
        if (isPaginatedResult(result)) {
          return result;
        }

        // Cas normal : on enveloppe la valeur brute renvoyée par le controller
        return {
          data: result ?? null,
          message: 'OK',
        };
      }),
    );
  }
}