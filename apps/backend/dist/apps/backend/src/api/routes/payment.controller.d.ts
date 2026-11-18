import { RawBodyRequest } from '@nestjs/common';
import { PaymentService } from '@gitroom/nestjs-libraries/services/payment/payment.service';
export declare class PaymentController {
    private readonly _paymentService;
    constructor(_paymentService: PaymentService);
    webhook(provider: string, req: RawBodyRequest<Request>): Promise<any>;
}
