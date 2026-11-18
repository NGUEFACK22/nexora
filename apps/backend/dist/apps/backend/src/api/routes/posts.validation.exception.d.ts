import { ArgumentsHost, ExceptionFilter, HttpException } from '@nestjs/common';
export type PostValidationError = {
    provider: string;
    name: string;
    error: string;
};
export declare class PostValidationException extends HttpException {
    constructor(message: PostValidationError);
}
export declare class PostValidationExceptionFilter implements ExceptionFilter {
    catch(exception: PostValidationException, host: ArgumentsHost): void;
}
