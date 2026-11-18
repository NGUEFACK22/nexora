"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeService = void 0;
const tslib_1 = require("tslib");
const stripe_1 = tslib_1.__importDefault(require("stripe"));
const common_1 = require("@nestjs/common");
const subscription_service_1 = require("@gitroom/nestjs-libraries/database/prisma/subscriptions/subscription.service");
const organization_service_1 = require("@gitroom/nestjs-libraries/database/prisma/organizations/organization.service");
const make_is_1 = require("@gitroom/nestjs-libraries/services/make.is");
const lodash_1 = require("lodash");
const dayjs_1 = tslib_1.__importDefault(require("dayjs"));
const pricing_1 = require("@gitroom/nestjs-libraries/database/prisma/subscriptions/pricing");
const auth_service_1 = require("@gitroom/helpers/auth/auth.service");
const track_service_1 = require("@gitroom/nestjs-libraries/track/track.service");
const users_service_1 = require("@gitroom/nestjs-libraries/database/prisma/users/users.service");
const track_enum_1 = require("@gitroom/nestjs-libraries/user/track.enum");
const payment_provider_interface_1 = require("@gitroom/nestjs-libraries/services/payment/payment.provider.interface");
const payment_providers_1 = require("@gitroom/nestjs-libraries/services/payment/payment.providers");
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || 'sk_nothing');
let StripeService = class StripeService extends payment_provider_interface_1.PaymentProviderAbstract {
    constructor(_subscriptionService, _organizationService, _userService, _trackService) {
        super();
        this._subscriptionService = _subscriptionService;
        this._organizationService = _organizationService;
        this._userService = _userService;
        this._trackService = _trackService;
        this.platform = 'web';
    }
    validateRequest(rawBody, signature, endpointSecret) {
        return stripe.webhooks.constructEvent(rawBody, signature, endpointSecret);
    }
    validateWebhook(rawBody, headers) {
        return this.validateRequest(rawBody, headers['stripe-signature'], process.env.STRIPE_SIGNING_KEY);
    }
    async processWebhook(event) {
        if (event?.data?.object?.metadata?.service !== 'gitroom' &&
            event.type !== 'invoice.payment_succeeded') {
            return { ok: true };
        }
        switch (event.type) {
            case 'invoice.payment_succeeded':
                return this.paymentSucceeded(event);
            case 'customer.subscription.created':
                return this.createSubscription(event);
            case 'customer.subscription.updated':
                return this.updateSubscription(event);
            case 'customer.subscription.deleted':
                return this.deleteSubscription(event);
            default:
                return { ok: true };
        }
    }
    async checkValidCard(event) {
        if (event.data.object.status === 'incomplete') {
            return false;
        }
        const getOrgFromCustomer = await this._organizationService.getOrgByCustomerId(event.data.object.customer);
        if (!getOrgFromCustomer?.allowTrial) {
            return true;
        }
        console.log('Checking card');
        const paymentMethods = await stripe.paymentMethods.list({
            customer: event.data.object.customer,
        });
        const latestMethod = paymentMethods.data.reduce((prev, current) => {
            if (prev.created < current.created) {
                return current;
            }
            return prev;
        }, { created: -100 });
        if (!latestMethod.id) {
            return false;
        }
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: 100,
                currency: 'usd',
                payment_method: latestMethod.id,
                customer: event.data.object.customer,
                off_session: true,
                capture_method: 'manual',
                confirm: true,
            });
            if (paymentIntent.status === 'requires_capture') {
                await stripe.paymentIntents.cancel(paymentIntent.id);
                return true;
            }
            console.error('Cant charge', {
                stripe_event_id: event.id,
                stripe_subscription_id: event.data.object.id,
                stripe_payment_intent_status: paymentIntent.status,
            });
        }
        catch (err) {
            console.error('stripe_card_check_failed', {
                stripe_event_id: event.id,
                stripe_subscription_id: event.data.object.id,
            }, err);
        }
        try {
            await stripe.subscriptions.cancel(event.data.object.id);
        }
        catch (err) {
            console.error('stripe_card_check_cancel_failed', {
                stripe_event_id: event.id,
                stripe_subscription_id: event.data.object.id,
            }, err);
        }
        try {
            await stripe.paymentMethods.detach(paymentMethods.data[0].id);
        }
        catch (err) {
            console.error('stripe_card_check_detach_failed', {
                stripe_event_id: event.id,
                stripe_subscription_id: event.data.object.id,
            }, err);
        }
        return false;
    }
    async createSubscription(event) {
        const { uniqueId, billing, period } = event.data.object.metadata;
        const liveSubscriptions = await this.getLiveSubscriptions(event.data.object.customer);
        const isDuplicate = liveSubscriptions.some((f) => f.id !== event.data.object.id &&
            (f.created < event.data.object.created ||
                (f.created === event.data.object.created &&
                    f.id < event.data.object.id)));
        if (isDuplicate) {
            if (liveSubscriptions.some((f) => f.id === event.data.object.id)) {
                await stripe.subscriptions.cancel(event.data.object.id);
            }
            console.log('stripe_duplicate_subscription_cancelled', {
                stripe_event_type: event.type,
                stripe_event_id: event.id,
                stripe_subscription_id: event.data.object.id,
            });
            return { ok: true };
        }
        try {
            const check = await this.checkValidCard(event);
            if (!check) {
                return { ok: false };
            }
        }
        catch (err) {
            return { ok: false };
        }
        const result = await this._subscriptionService.createOrUpdateSubscription(payment_providers_1.STRIPE_PROVIDER, event.data.object.status !== 'active', uniqueId, event.data.object.customer, pricing_1.pricing[billing].channel, billing, period, event.data.object.cancel_at);
        if (event.data.object.status === 'trialing') {
            this.trackSubscription(event.data.object.metadata, event.data.object.id, track_enum_1.TrackEnum.StartTrial, {
                value: pricing_1.pricing[billing][period === 'YEARLY' ? 'year_price' : 'month_price'],
            }).catch((err) => { });
        }
        return result;
    }
    async updateSubscription(event) {
        const { uniqueId, billing, period } = event.data.object.metadata;
        const check = await this.checkValidCard(event);
        if (!check) {
            return { ok: false };
        }
        return this._subscriptionService.createOrUpdateSubscription(payment_providers_1.STRIPE_PROVIDER, event.data.object.status !== 'active', uniqueId, event.data.object.customer, pricing_1.pricing[billing].channel, billing, period, event.data.object.cancel_at);
    }
    async deleteSubscription(event) {
        this.keepCardOfUnpaidInvoices(event.data.object.id).catch((err) => { });
        const customer = event.data.object.customer;
        const [survivor] = await this.getLiveSubscriptions(customer);
        if (!survivor) {
            await this._subscriptionService.deleteSubscription(customer, payment_providers_1.STRIPE_PROVIDER);
            return;
        }
        const { uniqueId, billing, period } = survivor.metadata;
        console.log('stripe_subscription_deleted_survivor_kept', {
            stripe_event_type: event.type,
            stripe_event_id: event.id,
            stripe_subscription_id: event.data.object.id,
            stripe_survivor_id: survivor.id,
            outcome: pricing_1.pricing[billing] && period ? 'resynced' : 'metadata_missing',
        });
        if (!pricing_1.pricing[billing] || !period) {
            return;
        }
        return this._subscriptionService.createOrUpdateSubscription(payment_providers_1.STRIPE_PROVIDER, survivor.status !== 'active', uniqueId, customer, pricing_1.pricing[billing].channel, billing, period, survivor.cancel_at);
    }
    async getInvoicePaymentIntents(invoiceId) {
        try {
            const invoice = await stripe.invoices.retrieve(invoiceId, {
                expand: ['payments.data.payment.payment_intent'],
            });
            return (invoice.payments?.data || [])
                .map((p) => p.payment.payment_intent)
                .filter((p) => typeof p === 'object' && !!p);
        }
        catch (err) {
            console.error('stripe_invoice_payment_intents_failed', { stripe_invoice_id: invoiceId }, err);
            return [];
        }
    }
    async keepCardOfUnpaidInvoices(subscriptionId) {
        try {
            const invoices = await stripe.invoices.list({
                subscription: subscriptionId,
                limit: 100,
            });
            for (const invoice of invoices.data) {
                if (invoice.status !== 'open' && invoice.status !== 'uncollectible') {
                    continue;
                }
                const paymentIntents = await this.getInvoicePaymentIntents(invoice.id);
                for (const paymentIntent of paymentIntents) {
                    if (paymentIntent.setup_future_usage ||
                        ![
                            'requires_payment_method',
                            'requires_confirmation',
                            'requires_action',
                        ].includes(paymentIntent.status)) {
                        continue;
                    }
                    try {
                        await stripe.paymentIntents.update(paymentIntent.id, {
                            setup_future_usage: 'off_session',
                        });
                    }
                    catch (err) {
                        console.error('stripe_keep_card_of_unpaid_invoices_failed', {
                            stripe_subscription_id: subscriptionId,
                            stripe_invoice_id: invoice.id,
                        }, err);
                    }
                }
            }
        }
        catch (err) {
            console.error('stripe_keep_card_of_unpaid_invoices_failed', { stripe_subscription_id: subscriptionId }, err);
        }
    }
    async syncCustomerEmailsAfterSwitch(accounts) {
        if (!process.env.STRIPE_PUBLISHABLE_KEY) {
            return;
        }
        const emailByCustomer = new Map();
        for (const account of accounts) {
            const organizations = await this._organizationService.getOrgsByUserId(account.id);
            for (const org of organizations) {
                if (org.users?.[0]?.role === 'SUPERADMIN' &&
                    org.paymentId?.startsWith('cus_') &&
                    !emailByCustomer.has(org.paymentId)) {
                    emailByCustomer.set(org.paymentId, account.email);
                }
            }
        }
        await Promise.all([...emailByCustomer].map(([customerId, email]) => stripe.customers
            .update(customerId, {
            email: email.indexOf('@') > -1 ? email : `${email}@postiz.com`,
        })
            .catch(() => { })));
    }
    async createOrGetCustomer(organization) {
        if (organization.paymentId) {
            return organization.paymentId;
        }
        const users = await this._organizationService.getTeam(organization.id);
        const customer = await stripe.customers.create({
            email: users.users[0].user.email.indexOf('@') > -1
                ? users.users[0].user.email
                : `${users.users[0].user.email}@postiz.com`,
            name: organization.name,
        });
        await this._subscriptionService.updateCustomerId(organization.id, customer.id);
        return customer.id;
    }
    async getPackages() {
        const products = await stripe.prices.list({
            active: true,
            expand: ['data.tiers', 'data.product'],
            lookup_keys: [
                'standard_monthly',
                'standard_yearly',
                'pro_monthly',
                'pro_yearly',
            ],
        });
        const productsList = (0, lodash_1.groupBy)(products.data.map((p) => ({
            name: p.product?.name,
            recurring: p?.recurring?.interval,
            price: p?.tiers?.[0]?.unit_amount / 100,
        })), 'recurring');
        return { ...productsList };
    }
    async prorate(organizationId, body) {
        const org = await this._organizationService.getOrgById(organizationId);
        const customer = await this.createOrGetCustomer(org);
        const priceData = pricing_1.pricing[body.billing];
        const allProducts = await stripe.products.list({
            active: true,
            expand: ['data.prices'],
        });
        const findProduct = allProducts.data.find((product) => product.name.toUpperCase() === body.billing.toUpperCase()) ||
            (await stripe.products.create({
                active: true,
                name: body.billing,
            }));
        const pricesList = await stripe.prices.list({
            active: true,
            product: findProduct.id,
        });
        const findPrice = pricesList.data.find((p) => p?.recurring?.interval?.toLowerCase() ===
            (body.period === 'MONTHLY' ? 'month' : 'year') &&
            p?.nickname === body.billing + ' ' + body.period &&
            p?.unit_amount ===
                (body.period === 'MONTHLY'
                    ? priceData.month_price
                    : priceData.year_price) *
                    100) ||
            (await stripe.prices.create({
                active: true,
                product: findProduct.id,
                currency: 'usd',
                nickname: body.billing + ' ' + body.period,
                unit_amount: (body.period === 'MONTHLY'
                    ? priceData.month_price
                    : priceData.year_price) * 100,
                recurring: {
                    interval: body.period === 'MONTHLY' ? 'month' : 'year',
                },
            }));
        const currentUserSubscription = {
            data: (await stripe.subscriptions.list({
                customer,
                status: 'all',
            })).data.filter((f) => f.status === 'active' || f.status === 'trialing'),
        };
        try {
            const price = await stripe.invoices.createPreview({
                customer,
                subscription: currentUserSubscription?.data?.[0]?.id,
                subscription_details: {
                    proration_behavior: 'always_invoice',
                    items: [
                        {
                            id: currentUserSubscription?.data?.[0]?.items?.data?.[0]?.id,
                            price: findPrice?.id,
                            quantity: 1,
                        },
                    ],
                },
            });
            return {
                price: price?.amount_due ? price?.amount_due / 100 : 0,
            };
        }
        catch (err) {
            console.error('Error calculating proration:', err);
            return { price: 0 };
        }
    }
    async getCustomerSubscriptions(organizationId) {
        const org = (await this._organizationService.getOrgById(organizationId));
        const customer = org.paymentId;
        return stripe.subscriptions.list({
            customer: customer,
            status: 'all',
        });
    }
    async getLiveSubscriptions(customer) {
        if (!customer || !customer.startsWith('cus_')) {
            return [];
        }
        return (await stripe.subscriptions.list({
            customer,
            status: 'all',
            expand: ['data.latest_invoice'],
        })).data.filter((f) => f.status !== 'canceled' &&
            f.status !== 'incomplete' &&
            f.status !== 'incomplete_expired');
    }
    async setToCancel(organizationId, cancel) {
        const id = (0, make_is_1.makeId)(10);
        const org = await this._organizationService.getOrgById(organizationId);
        const customer = await this.createOrGetCustomer(org);
        const subscriptions = await this.getLiveSubscriptions(customer);
        const sub = subscriptions[0];
        if (!sub) {
            throw new common_1.BadRequestException('No active subscription found');
        }
        if (sub.cancel_at_period_end) {
            if (cancel) {
                return {
                    id,
                    cancel_at: sub.cancel_at ? new Date(sub.cancel_at * 1000) : undefined,
                    unchanged: true,
                };
            }
            let cancel_at = null;
            for (const s of subscriptions) {
                const updated = await stripe.subscriptions.update(s.id, {
                    cancel_at_period_end: false,
                    metadata: { service: 'gitroom', id },
                });
                cancel_at = cancel_at || updated.cancel_at;
            }
            await this._subscriptionService.updateCancelAt(organizationId, cancel_at);
            return {
                id,
                cancel_at: cancel_at ? new Date(cancel_at * 1000) : undefined,
            };
        }
        if (cancel === false) {
            return { id, cancel_at: undefined, unchanged: true };
        }
        const latestInvoice = sub.latest_invoice;
        const hasFailedPayment = sub.status === 'past_due' ||
            latestInvoice?.status === 'open' ||
            latestInvoice?.status === 'uncollectible';
        if (hasFailedPayment) {
            for (const s of subscriptions) {
                await stripe.subscriptions.cancel(s.id);
            }
            await this.voidUnpaidInvoices(customer);
            await this._subscriptionService.deleteSubscription(customer, payment_providers_1.STRIPE_PROVIDER);
            return {
                id,
                cancel_at: new Date(),
            };
        }
        let cancel_at = null;
        for (const s of subscriptions) {
            const updated = await stripe.subscriptions.update(s.id, {
                cancel_at_period_end: true,
                metadata: { service: 'gitroom', id },
            });
            if (updated.cancel_at && (!cancel_at || updated.cancel_at < cancel_at)) {
                cancel_at = updated.cancel_at;
            }
        }
        await this._subscriptionService.updateCancelAt(organizationId, cancel_at);
        return {
            id,
            cancel_at: cancel_at ? new Date(cancel_at * 1000) : undefined,
        };
    }
    async cancelAllSubscriptions(organizationId) {
        if (!process.env.STRIPE_PUBLISHABLE_KEY) {
            return;
        }
        const org = await this._organizationService.getOrgById(organizationId);
        if (!org?.paymentId) {
            return;
        }
        const subscriptions = await stripe.subscriptions.list({
            customer: org.paymentId,
            status: 'all',
            limit: 100,
        });
        for (const subscription of subscriptions.data.filter((f) => f.status !== 'canceled')) {
            await stripe.subscriptions.cancel(subscription.id);
        }
        await this.voidUnpaidInvoices(org.paymentId);
        await this._subscriptionService.deleteSubscription(org.paymentId, payment_providers_1.STRIPE_PROVIDER);
    }
    async getCustomerByOrganizationId(organizationId) {
        const org = (await this._organizationService.getOrgById(organizationId));
        return org.paymentId;
    }
    async createBillingPortalLink(customer) {
        return stripe.billingPortal.sessions.create({
            customer,
            return_url: process.env['FRONTEND_URL'] + '/billing',
        });
    }
    async findAutoApplyPromotionCode() {
        try {
            const promotionCodes = await stripe.promotionCodes.list({
                active: true,
                limit: 100,
            });
            const now = Math.floor(Date.now() / 1000);
            for (const promoCode of promotionCodes.data) {
                const coupon = typeof promoCode.promotion.coupon === 'string'
                    ? null
                    : promoCode.promotion.coupon;
                const autoApply = Object.assign({}, promoCode.metadata, coupon?.metadata)?.autoapply;
                if (autoApply !== 'true')
                    continue;
                if (promoCode.expires_at && promoCode.expires_at < now)
                    continue;
                if (coupon?.redeem_by && coupon.redeem_by < now)
                    continue;
                if (promoCode.max_redemptions &&
                    promoCode.times_redeemed >= promoCode.max_redemptions)
                    continue;
                return promoCode.code;
            }
            return null;
        }
        catch (err) {
            console.error('Error finding auto-apply promotion code:', err);
            return null;
        }
    }
    async createEmbeddedCheckout(ud, uniqueId, customer, body, price, userId, allowTrial) {
        const user = await this._userService.getUserById(userId);
        try {
            await stripe.customers.update(customer, {
                email: user.email.indexOf('@') > -1
                    ? user.email
                    : `${user.email}@postiz.com`,
                ...(body.dub
                    ? {
                        metadata: {
                            dubCustomerExternalId: userId,
                            dubClickId: body.dub,
                        },
                    }
                    : {}),
            });
        }
        catch (err) { }
        let autoApplyPromoCode = null;
        if (body.period === 'MONTHLY') {
            autoApplyPromoCode = await this.findAutoApplyPromotionCode();
        }
        const isUtm = body.utm ? `&utm_source=${body.utm}` : '';
        const { client_secret } = await stripe.checkout.sessions.create({
            ui_mode: 'custom',
            customer,
            return_url: process.env['FRONTEND_URL'] +
                `/launches?onboarding=true&trialStart=true&check=${uniqueId}${isUtm}`,
            mode: 'subscription',
            subscription_data: {
                ...(allowTrial ? { trial_period_days: 7 } : {}),
                metadata: {
                    service: 'gitroom',
                    ...body,
                    userId,
                    uniqueId,
                    ud,
                },
            },
            ...(body.datafast_session_id && body.datafast_visitor_id
                ? {
                    metadata: {
                        datafast_visitor_id: body.datafast_visitor_id,
                        datafast_session_id: body.datafast_session_id,
                    },
                }
                : {}),
            allow_promotion_codes: body.period === 'MONTHLY',
            line_items: [
                {
                    price,
                    quantity: 1,
                },
            ],
        });
        return {
            client_secret,
            ...(autoApplyPromoCode ? { auto_apply_coupon: autoApplyPromoCode } : {}),
        };
    }
    async createCheckoutSession(ud, uniqueId, customer, body, price, userId, allowTrial) {
        const isUtm = body.utm ? `&utm_source=${body.utm}` : '';
        if (body.dub) {
            await stripe.customers.update(customer, {
                metadata: {
                    dubCustomerExternalId: userId,
                    dubClickId: body.dub,
                },
            });
        }
        const { url } = await stripe.checkout.sessions.create({
            customer,
            cancel_url: process.env['FRONTEND_URL'] + `/billing?cancel=true${isUtm}`,
            success_url: process.env['FRONTEND_URL'] +
                `/launches?onboarding=true&trialStart=true&check=${uniqueId}${isUtm}`,
            mode: 'subscription',
            subscription_data: {
                ...(allowTrial ? { trial_period_days: 7 } : {}),
                metadata: {
                    service: 'gitroom',
                    ...body,
                    userId,
                    uniqueId,
                    ud,
                },
            },
            allow_promotion_codes: body.period === 'MONTHLY',
            line_items: [
                {
                    price,
                    quantity: 1,
                },
            ],
        });
        return { url };
    }
    async portalLink(organizationId) {
        const customer = await this.getCustomerByOrganizationId(organizationId);
        return this.createBillingPortalLink(customer);
    }
    async getRenewalDate(organizationId) {
        const customer = await this.getCustomerByOrganizationId(organizationId);
        const [sub] = await this.getLiveSubscriptions(customer);
        const trialing = sub?.status === 'trialing';
        return {
            renewsAt: (trialing ? sub.trial_end : sub?.items.data[0]?.current_period_end) ||
                null,
            trialing,
        };
    }
    async getInvoices(organizationId) {
        const customer = await this.getCustomerByOrganizationId(organizationId);
        if (!customer || !customer.startsWith('cus_')) {
            return [];
        }
        const invoices = await stripe.invoices.list({
            customer,
            limit: 100,
        });
        return invoices.data
            .filter((invoice) => invoice.status !== 'draft')
            .map((invoice) => {
            const metadata = invoice.parent?.subscription_details?.metadata;
            return {
                id: invoice.id,
                number: invoice.number,
                tier: metadata?.billing || null,
                period: metadata?.period || null,
                description: invoice.lines.data[0]?.description || null,
                amount: invoice.total,
                currency: invoice.currency,
                created: invoice.created,
                periodEnd: Math.max(invoice.period_end, ...invoice.lines.data.map((line) => line.period.end)),
                status: invoice.status === 'paid'
                    ? 'paid'
                    : invoice.status === 'void'
                        ? 'void'
                        : invoice.status === 'uncollectible' || invoice.attempted
                            ? 'failed'
                            : 'pending',
                downloadUrl: invoice.invoice_pdf || null,
                viewUrl: invoice.hosted_invoice_url || null,
            };
        });
    }
    async finishTrial(organization) {
        const list = (await stripe.subscriptions.list({
            customer: organization.paymentId,
        })).data;
        const trialing = list.find((f) => f.status === 'trialing');
        if (!trialing) {
            const subscription = await stripe.subscriptions.retrieve(list[0].id, {
                expand: ['latest_invoice'],
            });
            const invoice = subscription.latest_invoice;
            if (invoice?.status === 'open' && invoice.id) {
                await stripe.invoices.pay(invoice.id).catch(() => { });
            }
            return this.getRequiredActionFromSubscription(list[0].id);
        }
        await stripe.subscriptions.update(trialing.id, {
            trial_end: 'now',
        });
        return this.getRequiredActionFromSubscription(trialing.id);
    }
    async getRequiredActionFromSubscription(subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
            expand: ['latest_invoice'],
        });
        const latestInvoice = subscription.latest_invoice;
        const invoice = latestInvoice?.id
            ? await stripe.invoices.retrieve(latestInvoice.id, {
                expand: ['payments.data.payment.payment_intent'],
            })
            : null;
        const paymentIntent = invoice?.payments?.data
            .map((p) => p.payment.payment_intent)
            .find((p) => typeof p === 'object' && !!p);
        if (invoice?.status === 'open' &&
            paymentIntent &&
            (paymentIntent.status === 'requires_action' ||
                paymentIntent.status === 'requires_confirmation')) {
            return {
                requiresAction: true,
                clientSecret: paymentIntent.client_secret,
            };
        }
        if (invoice?.status === 'open' &&
            paymentIntent?.status === 'requires_payment_method') {
            throw new Error('The subscription payment failed');
        }
        return { requiresAction: false };
    }
    async checkDiscount(organization) {
        const customer = organization.paymentId;
        if (!process.env.STRIPE_DISCOUNT_ID || !customer) {
            return false;
        }
        const list = await stripe.charges.list({
            customer,
            limit: 1,
        });
        if (!list.data.filter((f) => f.amount > 1000).length) {
            return false;
        }
        const currentUserSubscription = {
            data: (await stripe.subscriptions.list({
                customer,
                status: 'all',
                expand: ['data.discounts'],
            })).data.find((f) => f.status === 'active' || f.status === 'trialing'),
        };
        if (!currentUserSubscription.data) {
            return false;
        }
        if (currentUserSubscription.data?.items.data[0]?.price.recurring?.interval ===
            'year' ||
            currentUserSubscription.data?.discounts.length) {
            return false;
        }
        return true;
    }
    async applyDiscount(organization) {
        const customer = organization.paymentId;
        const check = await this.checkDiscount(organization);
        if (!check) {
            return false;
        }
        const currentUserSubscription = {
            data: (await stripe.subscriptions.list({
                customer,
                status: 'all',
                expand: ['data.discounts'],
            })).data.find((f) => f.status === 'active' || f.status === 'trialing'),
        };
        await stripe.subscriptions.update(currentUserSubscription.data.id, {
            discounts: [
                {
                    coupon: process.env.STRIPE_DISCOUNT_ID,
                },
            ],
        });
        return true;
    }
    async checkSubscription(organizationId, subscriptionId) {
        const orgValue = await this._subscriptionService.checkSubscription(organizationId, subscriptionId);
        if (orgValue) {
            return 2;
        }
        const getCustomerSubscriptions = await this.getCustomerSubscriptions(organizationId);
        if (getCustomerSubscriptions.data.length === 0) {
            return 0;
        }
        if (getCustomerSubscriptions.data.find((p) => p.metadata.uniqueId === subscriptionId)?.canceled_at) {
            return 1;
        }
        return 0;
    }
    async embedded(uniqueId, organizationId, userId, body, allowTrial) {
        const id = (0, make_is_1.makeId)(10);
        const priceData = pricing_1.pricing[body.billing];
        const org = await this._organizationService.getOrgById(organizationId);
        const customer = await this.createOrGetCustomer(org);
        if ((await this.getLiveSubscriptions(customer)).length) {
            return { blocked: true };
        }
        const allProducts = await stripe.products.list({
            active: true,
            expand: ['data.prices'],
        });
        const findProduct = allProducts.data.find((product) => product.name.toUpperCase() === body.billing.toUpperCase()) ||
            (await stripe.products.create({
                active: true,
                name: body.billing,
            }));
        const pricesList = await stripe.prices.list({
            active: true,
            product: findProduct.id,
        });
        const findPrice = pricesList.data.find((p) => p?.recurring?.interval?.toLowerCase() ===
            (body.period === 'MONTHLY' ? 'month' : 'year') &&
            p?.unit_amount ===
                (body.period === 'MONTHLY'
                    ? priceData.month_price
                    : priceData.year_price) *
                    100) ||
            (await stripe.prices.create({
                active: true,
                product: findProduct.id,
                currency: 'usd',
                nickname: body.billing + ' ' + body.period,
                unit_amount: (body.period === 'MONTHLY'
                    ? priceData.month_price
                    : priceData.year_price) * 100,
                recurring: {
                    interval: body.period === 'MONTHLY' ? 'month' : 'year',
                },
            }));
        return this.createEmbeddedCheckout(uniqueId, id, customer, body, findPrice.id, userId, allowTrial);
    }
    async subscribe(uniqueId, organizationId, userId, body, allowTrial) {
        const id = (0, make_is_1.makeId)(10);
        const priceData = pricing_1.pricing[body.billing];
        const org = await this._organizationService.getOrgById(organizationId);
        const customer = await this.createOrGetCustomer(org);
        const allProducts = await stripe.products.list({
            active: true,
            expand: ['data.prices'],
        });
        const findProduct = allProducts.data.find((product) => product.name.toUpperCase() === body.billing.toUpperCase()) ||
            (await stripe.products.create({
                active: true,
                name: body.billing,
            }));
        const pricesList = await stripe.prices.list({
            active: true,
            product: findProduct.id,
        });
        const findPrice = pricesList.data.find((p) => p?.recurring?.interval?.toLowerCase() ===
            (body.period === 'MONTHLY' ? 'month' : 'year') &&
            p?.unit_amount ===
                (body.period === 'MONTHLY'
                    ? priceData.month_price
                    : priceData.year_price) *
                    100) ||
            (await stripe.prices.create({
                active: true,
                product: findProduct.id,
                currency: 'usd',
                nickname: body.billing + ' ' + body.period,
                unit_amount: (body.period === 'MONTHLY'
                    ? priceData.month_price
                    : priceData.year_price) * 100,
                recurring: {
                    interval: body.period === 'MONTHLY' ? 'month' : 'year',
                },
            }));
        const getCurrentSubscriptions = await this._subscriptionService.getSubscription(organizationId);
        if (!getCurrentSubscriptions) {
            return this.createCheckoutSession(uniqueId, id, customer, body, findPrice.id, userId, allowTrial);
        }
        const currentUserSubscription = {
            data: (await stripe.subscriptions.list({
                customer,
                status: 'all',
            })).data.filter((f) => f.status === 'active' || f.status === 'trialing'),
        };
        try {
            await stripe.subscriptions.update(currentUserSubscription.data[0].id, {
                cancel_at_period_end: false,
                metadata: {
                    service: 'gitroom',
                    ...body,
                    userId,
                    id,
                    ud: uniqueId,
                },
                proration_behavior: 'always_invoice',
                items: [
                    {
                        id: currentUserSubscription.data[0].items.data[0].id,
                        price: findPrice.id,
                        quantity: 1,
                    },
                ],
            });
            const action = await this.getRequiredActionFromSubscription(currentUserSubscription.data[0].id);
            if (action.requiresAction) {
                return { id, ...action };
            }
            return { id };
        }
        catch (err) {
            const { url } = await this.createBillingPortalLink(customer);
            return {
                portal: url,
            };
        }
    }
    async paymentSucceeded(event) {
        this.trackConversion(event.data.object).catch((err) => { });
        if (event.data.object.billing_reason === 'subscription_create') {
            await this.voidUnpaidInvoices(event.data.object.customer);
        }
        await this.resubscribeOnLatePayment(event.data.object);
        return { ok: true };
    }
    async resubscribeOnLatePayment(invoice) {
        try {
            const paidAt = invoice.status_transitions?.paid_at;
            const subscriptionId = invoice.parent?.subscription_details?.subscription ||
                invoice.subscription;
            if (invoice.billing_reason !== 'subscription_cycle' ||
                !(invoice.amount_paid > 0) ||
                invoice.amount_remaining > 0 ||
                !paidAt ||
                !subscriptionId) {
                return;
            }
            const subscription = await stripe.subscriptions.retrieve(typeof subscriptionId === 'string' ? subscriptionId : subscriptionId.id, { expand: ['discounts.source.coupon'] });
            if (subscription.metadata?.service !== 'gitroom' ||
                subscription.status !== 'canceled') {
                return;
            }
            const endedAt = subscription.ended_at || subscription.canceled_at;
            if (!endedAt || paidAt <= endedAt) {
                return;
            }
            const customer = subscription.customer;
            const skipped = (reason) => console.log('stripe_late_payment_resubscribe_skipped', {
                stripe_invoice_id: invoice.id,
                stripe_subscription_id: subscription.id,
                stripe_customer_id: customer,
                reason,
            });
            const others = await stripe.subscriptions.list({
                customer,
                status: 'all',
                limit: 100,
            });
            if (others.data.some((f) => f.id !== subscription.id &&
                (f.created >= paidAt ||
                    !['canceled', 'incomplete', 'incomplete_expired'].includes(f.status)))) {
                return skipped('other_subscription');
            }
            const org = await this._organizationService.getOrgByCustomerId(customer);
            if (!org || org.deletedAt) {
                return skipped('organization_missing');
            }
            if (await this._subscriptionService.getSubscriptionByOrganizationId(org.id)) {
                return skipped('organization_has_subscription');
            }
            const team = await this._organizationService.getTeam(org.id);
            for (const { user } of (team?.users || []).filter((u) => u.role === 'SUPERADMIN')) {
                if (await this._userService.getUserWithActiveSubscriptionByEmail(user.email, user.id)) {
                    return skipped('other_account_subscribed');
                }
            }
            const { billing, period } = subscription.metadata;
            if (!pricing_1.pricing[billing] || !period) {
                return skipped('metadata_missing');
            }
            const item = subscription.items.data[0];
            const [line, ...moreLines] = invoice.lines?.data || [];
            const linePrice = line?.pricing?.price_details?.price || line?.price;
            if (!item ||
                !line ||
                moreLines.length ||
                (typeof linePrice === 'string' ? linePrice : linePrice?.id) !==
                    item.price.id ||
                line.quantity !== item.quantity) {
                return skipped('invoice_does_not_match_plan');
            }
            const discounts = subscription.discounts
                .map((d) => (typeof d === 'string' ? null : d))
                .filter((d) => !!d && (!d.end || d.end > paidAt))
                .map((d) => d.source?.coupon)
                .filter((c) => typeof c === 'object' && !!c && c.valid && c.duration !== 'once')
                .map((c) => ({ coupon: c.id }));
            const card = await this.getCardKeptByInvoice(invoice.id, customer);
            const created = await stripe.subscriptions.create({
                customer,
                ...(card ? { default_payment_method: card } : {}),
                items: [{ price: item.price.id, quantity: item.quantity }],
                ...(discounts.length ? { discounts } : {}),
                metadata: (0, lodash_1.omit)(subscription.metadata, ['userId', 'fbc', 'fbp']),
                billing_cycle_anchor: (0, dayjs_1.default)(paidAt * 1000)
                    .add(item.price.recurring.interval_count, item.price.recurring.interval)
                    .unix(),
                proration_behavior: 'none',
            }, { idempotencyKey: `resubscribe_${invoice.id}` });
            console.log('stripe_late_payment_resubscribed', {
                stripe_invoice_id: invoice.id,
                stripe_subscription_id: subscription.id,
                stripe_new_subscription_id: created.id,
                stripe_payment_method_id: card || null,
                stripe_coupon_ids: discounts.map((d) => d.coupon),
            });
            await this.voidUnpaidInvoices(customer);
        }
        catch (err) {
            console.error('stripe_late_payment_resubscribe_failed', {
                stripe_invoice_id: invoice.id,
                stripe_customer_id: typeof invoice.customer === 'string' ? invoice.customer : null,
            }, err);
        }
    }
    async getCardKeptByInvoice(invoiceId, customer) {
        try {
            const paid = (await this.getInvoicePaymentIntents(invoiceId)).find((p) => p.status === 'succeeded');
            const card = typeof paid?.payment_method === 'string'
                ? paid.payment_method
                : paid?.payment_method?.id;
            if (!card) {
                return undefined;
            }
            const owner = (await stripe.paymentMethods.retrieve(card)).customer;
            return (typeof owner === 'string' ? owner : owner?.id) === customer
                ? card
                : undefined;
        }
        catch (err) {
            console.error('stripe_card_kept_by_invoice_failed', { stripe_invoice_id: invoiceId, stripe_customer_id: customer }, err);
            return undefined;
        }
    }
    async voidUnpaidInvoices(customer) {
        try {
            if (!customer || !customer.startsWith('cus_')) {
                return;
            }
            const cancelled = (await stripe.subscriptions.list({
                customer,
                status: 'canceled',
                limit: 100,
            })).data
                .filter((f) => f.metadata?.service === 'gitroom')
                .map((f) => f.id);
            if (!cancelled.length) {
                return;
            }
            for (const status of ['open', 'uncollectible']) {
                const invoices = await stripe.invoices.list({
                    customer,
                    status,
                    limit: 100,
                });
                for (const invoice of invoices.data) {
                    const subscription = invoice.parent?.subscription_details?.subscription;
                    const subscriptionId = typeof subscription === 'string' ? subscription : subscription?.id;
                    if (!subscriptionId || !cancelled.includes(subscriptionId)) {
                        continue;
                    }
                    try {
                        await stripe.invoices.voidInvoice(invoice.id);
                    }
                    catch (err) {
                        console.error('stripe_void_unpaid_invoices_failed', { stripe_customer_id: customer, stripe_invoice_id: invoice.id }, err);
                    }
                }
            }
        }
        catch (err) {
            console.error('stripe_void_unpaid_invoices_failed', { stripe_customer_id: customer }, err);
        }
    }
    async trackConversion(invoice) {
        try {
            const subscriptionId = invoice.parent?.subscription_details?.subscription ||
                invoice.subscription;
            if (!subscriptionId || invoice.amount_paid <= 0) {
                return;
            }
            const subscription = await stripe.subscriptions.retrieve(typeof subscriptionId === 'string' ? subscriptionId : subscriptionId.id);
            if (subscription.metadata?.service !== 'gitroom' ||
                !subscription.metadata?.userId) {
                return;
            }
            const paidInvoices = await stripe.invoices.list({
                subscription: subscription.id,
                status: 'paid',
                limit: 100,
            });
            const paidBefore = paidInvoices.data.some((f) => f.id !== invoice.id &&
                f.amount_paid > 0 &&
                (f.created < invoice.created ||
                    (f.created === invoice.created && f.id < invoice.id)));
            if (paidBefore) {
                return;
            }
            await this.trackSubscription(subscription.metadata, invoice.id, track_enum_1.TrackEnum.Purchase, {
                value: invoice.amount_paid / 100,
                currency: invoice.currency,
            });
        }
        catch (err) {
            console.error('stripe_pixel_conversion_failed', { stripe_invoice_id: invoice.id }, err);
        }
    }
    async trackSubscription(metadata, eventId, tt, additional) {
        try {
            const { userId, fbc, fbp } = metadata || {};
            if (!userId) {
                return;
            }
            const user = await this._userService.getUserById(userId);
            if (!user) {
                return;
            }
            await this._trackService.track(eventId, user.ip, user.agent, tt, additional, fbc, user, fbp);
        }
        catch (err) {
            console.error('stripe_pixel_event_failed', { stripe_object_id: eventId, event: track_enum_1.TrackEnum[tt] }, err);
        }
    }
    async getCharges(organizationId) {
        const org = await this._organizationService.getOrgById(organizationId);
        if (!org?.paymentId) {
            return [];
        }
        const charges = await stripe.charges.list({
            customer: org.paymentId,
            limit: 100,
        });
        const chargeList = charges.data
            .filter((f) => f.status === 'succeeded')
            .map((charge) => ({
            id: charge.id,
            amount: charge.amount,
            currency: charge.currency,
            created: charge.created,
            status: charge.status,
            refunded: charge.refunded,
            amount_refunded: charge.amount_refunded,
            disputed: charge.disputed,
            description: charge.description,
            receipt_url: charge.receipt_url || null,
            invoice: charge.invoice || null,
        }));
        const invoiceIds = chargeList
            .map((c) => c.invoice)
            .filter((id) => !!id && typeof id === 'string');
        const invoicePdfMap = {};
        for (const invoiceId of invoiceIds) {
            try {
                const inv = await stripe.invoices.retrieve(invoiceId);
                if (inv.invoice_pdf) {
                    invoicePdfMap[invoiceId] = inv.invoice_pdf;
                }
            }
            catch {
            }
        }
        const disputedMap = {};
        for (const charge of chargeList.filter((f) => f.disputed)) {
            try {
                disputedMap[charge.id] = await this.hasUnresolvedDispute(charge.id);
            }
            catch {
                disputedMap[charge.id] = true;
            }
        }
        return chargeList.map((charge) => ({
            ...charge,
            disputed: !!disputedMap[charge.id],
            invoice_pdf: charge.invoice && invoicePdfMap[charge.invoice]
                ? invoicePdfMap[charge.invoice]
                : null,
        }));
    }
    async hasUnresolvedDispute(chargeId) {
        const disputes = await stripe.disputes.list({ charge: chargeId });
        return disputes.data.some((f) => f.status !== 'won' && f.status !== 'warning_closed');
    }
    async refundCharges(organizationId, chargeIds) {
        const org = await this._organizationService.getOrgById(organizationId);
        if (!org?.paymentId) {
            throw new Error('No payment customer found for this organization');
        }
        const refunded = [];
        const failed = [];
        let reason = undefined;
        for (const chargeId of chargeIds) {
            try {
                if (await this.hasUnresolvedDispute(chargeId)) {
                    failed.push(chargeId);
                    reason =
                        reason ||
                            `Charge ${chargeId} was disputed and thus cannot be refunded`;
                    continue;
                }
                await stripe.refunds.create({ charge: chargeId });
                refunded.push(chargeId);
            }
            catch (err) {
                console.error('stripe_refund_charge_failed', { organization_id: organizationId, stripe_charge_id: chargeId }, err);
                failed.push(chargeId);
                reason = reason || err?.message;
            }
        }
        return { refunded, failed, reason };
    }
    async cancelSubscription(organizationId) {
        const org = await this._organizationService.getOrgById(organizationId);
        if (!org?.paymentId) {
            throw new Error('No payment customer found for this organization');
        }
        const customer = org.paymentId;
        const subscriptions = await this.getLiveSubscriptions(customer);
        if (!subscriptions.length) {
            throw new Error('No active subscription found');
        }
        for (const subscription of subscriptions) {
            await stripe.subscriptions.cancel(subscription.id);
        }
        await this.voidUnpaidInvoices(customer);
        await this._subscriptionService.deleteSubscription(customer, payment_providers_1.STRIPE_PROVIDER);
        return { cancelled: true };
    }
    mapSubscriptionDiscounts(subscription) {
        return (subscription?.discounts || [])
            .filter((discount) => typeof discount !== 'string')
            .map((discount) => {
            const coupon = typeof discount.source?.coupon === 'string'
                ? null
                : discount.source?.coupon;
            return {
                type: coupon?.percent_off ? 'percentage' : 'amount',
                value: coupon?.percent_off || (coupon?.amount_off || 0) / 100,
                duration: coupon?.duration || 'once',
                durationInMonths: coupon?.duration_in_months || null,
                remainingMonths: discount.end
                    ? Math.max(0, Math.ceil((discount.end - Date.now() / 1000) / (30 * 24 * 60 * 60)))
                    : null,
            };
        });
    }
    async getActiveStripeSubscription(paymentId) {
        if (!paymentId || !paymentId.startsWith('cus_')) {
            return undefined;
        }
        return (await stripe.subscriptions.list({
            customer: paymentId,
            status: 'all',
            expand: ['data.discounts.source.coupon'],
        })).data.find((f) => f.status === 'active' || f.status === 'trialing');
    }
    async getCouponInfo(organizationId) {
        const org = await this._organizationService.getOrgById(organizationId);
        const subscription = await this._subscriptionService.getSubscriptionByOrganizationId(organizationId);
        const stripeSubscription = await this.getActiveStripeSubscription(org?.paymentId);
        const coupons = this.mapSubscriptionDiscounts(stripeSubscription);
        const priceData = subscription
            ? pricing_1.pricing[subscription.subscriptionTier]
            : undefined;
        const monthlyPrice = priceData?.month_price || 0;
        let nextPayment = null;
        if (stripeSubscription) {
            try {
                const preview = await stripe.invoices.createPreview({
                    customer: org.paymentId,
                    subscription: stripeSubscription.id,
                });
                nextPayment = preview.total / 100;
            }
            catch (err) {
            }
        }
        return {
            tier: subscription?.subscriptionTier || null,
            period: subscription?.period || null,
            isLifetime: !!subscription?.isLifetime,
            monthlyPrice,
            planPrice: subscription?.period === 'YEARLY'
                ? priceData?.year_price || 0
                : monthlyPrice,
            nextPayment,
            coupons,
            supported: !!subscription &&
                !!stripeSubscription &&
                subscription.period === 'MONTHLY' &&
                !subscription.isLifetime &&
                !coupons.length,
        };
    }
    async applyCoupon(organizationId, body) {
        const info = await this.getCouponInfo(organizationId);
        if (!info.supported) {
            return {
                applied: false,
                reason: 'Applying a coupon is not supported for this user',
            };
        }
        if (body.type === 'percentage'
            ? body.value < 1 || body.value > 100
            : body.value < 1 || body.value > info.monthlyPrice) {
            return { applied: false, reason: 'Invalid coupon value' };
        }
        const org = await this._organizationService.getOrgById(organizationId);
        const stripeSubscription = await this.getActiveStripeSubscription(org?.paymentId);
        if (!stripeSubscription) {
            return {
                applied: false,
                reason: 'No active subscription found for this customer',
            };
        }
        const coupon = await stripe.coupons.create({
            name: `Admin coupon for ${org.name}`,
            ...(body.type === 'percentage'
                ? { percent_off: body.value }
                : { amount_off: Math.round(body.value * 100), currency: 'usd' }),
            ...(body.months === 1
                ? { duration: 'once' }
                : { duration: 'repeating', duration_in_months: body.months }),
            metadata: { service: 'gitroom', organizationId },
        });
        await stripe.subscriptions.update(stripeSubscription.id, {
            discounts: [
                {
                    coupon: coupon.id,
                },
            ],
        });
        return { applied: true };
    }
    async cancelCoupon(organizationId) {
        const org = await this._organizationService.getOrgById(organizationId);
        const stripeSubscription = await this.getActiveStripeSubscription(org?.paymentId);
        if (!stripeSubscription) {
            return {
                cancelled: false,
                reason: 'No active subscription found for this customer',
            };
        }
        if (!stripeSubscription.discounts.length) {
            return {
                cancelled: false,
                reason: 'No coupon is applied to this subscription',
            };
        }
        await stripe.subscriptions.deleteDiscount(stripeSubscription.id);
        return { cancelled: true };
    }
    async chatbaseRefundPreview(organizationId) {
        const org = await this._organizationService.getOrgById(organizationId);
        if (!org?.paymentId) {
            return {
                eligible: false,
                reason: 'No payment customer found for this organization',
            };
        }
        const customer = org.paymentId;
        const subscriptions = (await stripe.subscriptions.list({
            customer,
            status: 'all',
        })).data.filter((f) => f.status !== 'canceled');
        if (!subscriptions.length) {
            return {
                eligible: false,
                reason: 'No active subscription found for this customer',
            };
        }
        const charges = (await stripe.charges.list({
            customer,
            limit: 100,
        })).data.filter((f) => f.status === 'succeeded');
        if (charges.some((f) => f.refunded || f.amount_refunded > 0)) {
            return {
                eligible: false,
                reason: 'A refund was already issued for this customer',
            };
        }
        let lastCharge = undefined;
        let chargeSubscription = undefined;
        for (const charge of charges) {
            const invoiceId = charge.invoice;
            if (!invoiceId || typeof invoiceId !== 'string') {
                continue;
            }
            try {
                const invoice = await stripe.invoices.retrieve(invoiceId);
                const invoiceSubscription = invoice.parent?.subscription_details?.subscription;
                const subscriptionId = typeof invoiceSubscription === 'string'
                    ? invoiceSubscription
                    : invoiceSubscription?.id;
                chargeSubscription = subscriptions.find((f) => f.id === subscriptionId);
                if (chargeSubscription) {
                    lastCharge = charge;
                    break;
                }
            }
            catch {
            }
        }
        if (!lastCharge || !chargeSubscription) {
            return {
                eligible: false,
                reason: 'No subscription payment found for this customer',
            };
        }
        const sixtyDaysAgo = Math.floor(Date.now() / 1000) - 60 * 24 * 60 * 60;
        if (lastCharge.created < sixtyDaysAgo) {
            return {
                eligible: false,
                reason: 'The last subscription payment is older than 60 days',
            };
        }
        const interval = chargeSubscription.items?.data?.[0]?.price?.recurring?.interval;
        const amount = interval === 'year'
            ? Math.floor(lastCharge.amount / 12)
            : lastCharge.amount;
        const currentSubscription = await this._subscriptionService.getSubscriptionByOrganizationId(organizationId);
        return {
            eligible: true,
            chargeId: lastCharge.id,
            amount: amount / 100,
            currency: lastCharge.currency,
            tier: currentSubscription?.subscriptionTier || null,
            period: currentSubscription?.period || null,
            subscriptionIds: subscriptions.map((f) => f.id),
        };
    }
    async chatbaseRefund(organizationId) {
        const preview = await this.chatbaseRefundPreview(organizationId);
        if (!preview.eligible) {
            return {
                refunded: false,
                reason: preview.reason,
            };
        }
        const org = await this._organizationService.getOrgById(organizationId);
        await stripe.refunds.create({
            charge: preview.chargeId,
            amount: Math.round(preview.amount * 100),
            metadata: {
                reason: 'chatbase_refund',
                organizationId,
            },
        });
        for (const subscriptionId of preview.subscriptionIds) {
            await stripe.subscriptions.cancel(subscriptionId);
        }
        await this.voidUnpaidInvoices(org?.paymentId);
        if (preview.subscriptionIds.length) {
            await this._subscriptionService.deleteSubscription(org?.paymentId, payment_providers_1.STRIPE_PROVIDER);
        }
        return {
            refunded: true,
            amount: preview.amount,
            currency: preview.currency,
            subscriptionCancelled: preview.subscriptionIds.length > 0,
        };
    }
    async lifetimeDeal(organizationId, code) {
        const getCurrentSubscription = await this._subscriptionService.getSubscriptionByOrganizationId(organizationId);
        if (getCurrentSubscription && !getCurrentSubscription?.isLifetime) {
            throw new Error('You already have a non lifetime subscription');
        }
        try {
            const testCode = auth_service_1.AuthService.fixedDecryption(code);
            const findCode = await this._subscriptionService.getCode(testCode);
            if (findCode) {
                return {
                    success: false,
                };
            }
            const nextPackage = !getCurrentSubscription ? 'STANDARD' : 'PRO';
            const findPricing = pricing_1.pricing[nextPackage];
            await this._subscriptionService.createOrUpdateSubscription(payment_providers_1.STRIPE_PROVIDER, false, (0, make_is_1.makeId)(10), organizationId, getCurrentSubscription?.subscriptionTier === 'PRO'
                ? getCurrentSubscription.totalChannels + 5
                : findPricing.channel, nextPackage, 'MONTHLY', null, testCode, organizationId);
            return {
                success: true,
            };
        }
        catch (err) {
            console.log(err);
            return {
                success: false,
            };
        }
    }
};
exports.StripeService = StripeService;
exports.StripeService = StripeService = tslib_1.__decorate([
    (0, payment_provider_interface_1.PaymentProvider)({ provider: payment_providers_1.STRIPE_PROVIDER }),
    tslib_1.__metadata("design:paramtypes", [subscription_service_1.SubscriptionService,
        organization_service_1.OrganizationService,
        users_service_1.UsersService,
        track_service_1.TrackService])
], StripeService);
//# sourceMappingURL=stripe.service.js.map