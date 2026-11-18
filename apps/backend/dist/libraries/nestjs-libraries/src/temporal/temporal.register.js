"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemporalRegisterMissingSearchAttributesModule = exports.TemporalRegister = void 0;
const common_1 = require("@nestjs/common");
const nestjs_temporal_core_1 = require("nestjs-temporal-core");
let TemporalRegister = class TemporalRegister {
    constructor(_client) {
        this._client = _client;
    }
    async onModuleInit() {
        if (process.env.TEMPORAL_TLS === 'true') {
            return;
        }
        const connection = this._client?.client?.getRawClient()
            ?.connection;
        const { customAttributes } = await connection.operatorService.listSearchAttributes({
            namespace: process.env.TEMPORAL_NAMESPACE || 'default',
        });
        const neededAttribute = ['organizationId', 'postId'];
        const missingAttributes = neededAttribute.filter((attr) => !customAttributes[attr]);
        if (missingAttributes.length > 0) {
            await connection.operatorService.addSearchAttributes({
                namespace: process.env.TEMPORAL_NAMESPACE || 'default',
                searchAttributes: missingAttributes.reduce((all, current) => {
                    all[current] = 1;
                    return all;
                }, {}),
            });
        }
    }
};
exports.TemporalRegister = TemporalRegister;
exports.TemporalRegister = TemporalRegister = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [nestjs_temporal_core_1.TemporalService])
], TemporalRegister);
let TemporalRegisterMissingSearchAttributesModule = class TemporalRegisterMissingSearchAttributesModule {
};
exports.TemporalRegisterMissingSearchAttributesModule = TemporalRegisterMissingSearchAttributesModule;
exports.TemporalRegisterMissingSearchAttributesModule = TemporalRegisterMissingSearchAttributesModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [],
        controllers: [],
        providers: [TemporalRegister],
        get exports() {
            return this.providers;
        },
    })
], TemporalRegisterMissingSearchAttributesModule);
//# sourceMappingURL=temporal.register.js.map