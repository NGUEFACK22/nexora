import { ExceptionFilter, ArgumentsHost, HttpException } from '@nestjs/common';
export declare class HttpForbiddenException extends HttpException {
    constructor();
}
export declare class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpForbiddenException, host: ArgumentsHost): any;
}
