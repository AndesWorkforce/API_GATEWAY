import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Catch(RpcException)
export class RpcExceptionsFilter implements ExceptionFilter {
  catch(exception: RpcException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const rpcError = exception.getError();

    if (rpcError.toString().includes('Empty response')) {
      return response.status(500).json({
        statusCode: 500,
        message: rpcError
          .toString()
          .substring(0, rpcError.toString().indexOf('(')),
      });
    }

    if (
      typeof rpcError === 'object' &&
      rpcError !== null &&
      'status' in rpcError &&
      'message' in rpcError
    ) {
      const raw = (rpcError as { status: unknown }).status;
      let httpStatus = 500;
      if (typeof raw === 'number' && raw >= 400 && raw < 600) {
        httpStatus = raw;
      } else if (typeof raw === 'string' && /^\d{3}$/.test(raw)) {
        const n = parseInt(raw, 10);
        if (n >= 400 && n < 600) httpStatus = n;
      }

      return response.status(httpStatus).json(rpcError);
    }

    return response.status(500).json({
      statusCode: 500,
      message: rpcError.toString(),
    });
  }
}
