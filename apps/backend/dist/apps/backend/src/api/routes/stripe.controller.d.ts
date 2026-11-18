import { RawBodyRequest } from '@nestjs/common';
import { PaymentService } from '@gitroom/nestjs-libraries/services/payment/payment.service';
export declare class StripeController {
    private readonly _paymentService;
    constructor(_paymentService: PaymentService);
    stripe(req: RawBodyRequest<Request>): Promise<any>;
}
