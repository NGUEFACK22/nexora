import { Response, Request } from 'express';
import { CreateOrgUserDto } from '@gitroom/nestjs-libraries/dtos/auth/create.org.user.dto';
import { LoginUserDto } from '@gitroom/nestjs-libraries/dtos/auth/login.user.dto';
import { AuthService } from '@gitroom/backend/services/auth/auth.service';
import { ForgotReturnPasswordDto } from '@gitroom/nestjs-libraries/dtos/auth/forgot-return.password.dto';
import { ForgotPasswordDto } from '@gitroom/nestjs-libraries/dtos/auth/forgot.password.dto';
import { ResendActivationDto } from '@gitroom/nestjs-libraries/dtos/auth/resend-activation.dto';
import { EmailService } from '@gitroom/nestjs-libraries/services/email.service';
import { AttributionService } from '@gitroom/nestjs-libraries/services/attribution/attribution.service';
export declare class AuthController {
    private _authService;
    private _emailService;
    private _attributionService;
    constructor(_authService: AuthService, _emailService: EmailService, _attributionService: AttributionService);
    canRegister(): Promise<{
        register: boolean;
    }>;
    attribution(): {
        params: string[];
    };
    register(req: Request, body: CreateOrgUserDto, response: Response, ip: string, userAgent: string): Promise<void>;
    login(req: Request, body: LoginUserDto, response: Response, ip: string, userAgent: string): Promise<void>;
    forgot(body: ForgotPasswordDto): Promise<{
        forgot: boolean;
    }>;
    forgotReturn(body: ForgotReturnPasswordDto): Promise<{
        reset: boolean;
    }>;
    mobileCallback(code: string, state: string, response: Response): void;
    oauthLink(provider: string, query: any, response: Response): Promise<string>;
    activate(code: string, datafast_visitor_id: string, response: Response): Promise<Response<any, Record<string, any>>>;
    resendActivation(body: ResendActivationDto): Promise<{
        success: boolean;
        message?: undefined;
    } | {
        success: boolean;
        message: any;
    }>;
    farcasterSigner(): Promise<{
        signerUuid: string;
        approvalUrl: string;
        qrCode: string;
    } | {
        error: any;
    }>;
    farcasterSignerStatus(signerUuid: string): Promise<{
        status: string;
        code?: string;
    } | {
        error: any;
    }>;
    oauthRedirect(provider: string, code: string, state: string, response: Response): void;
    oauthExists(req: Request, code: string, redirect_uri: string, state: string, provider: string, response: Response): Promise<Response<any, Record<string, any>>>;
}
