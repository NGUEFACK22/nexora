"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodesService = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("../../../helpers/src/auth/auth.service");
let CodesService = class CodesService {
    generateCodes(providerToken) {
        try {
            const decrypt = auth_service_1.AuthService.fixedDecryption(providerToken);
            return [...new Array(10000)]
                .map((_, index) => {
                return auth_service_1.AuthService.fixedEncryption(`${decrypt}:${index}`);
            })
                .join('\n');
        }
        catch (error) {
            return '';
        }
    }
};
exports.CodesService = CodesService;
exports.CodesService = CodesService = __decorate([
    (0, common_1.Injectable)()
], CodesService);
//# sourceMappingURL=codes.service.js.map