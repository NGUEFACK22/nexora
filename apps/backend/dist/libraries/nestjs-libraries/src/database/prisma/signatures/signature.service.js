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
exports.SignatureService = void 0;
const common_1 = require("@nestjs/common");
const signature_repository_1 = require("./signature.repository");
let SignatureService = class SignatureService {
    constructor(_signatureRepository) {
        this._signatureRepository = _signatureRepository;
    }
    getSignaturesByOrgId(orgId) {
        return this._signatureRepository.getSignaturesByOrgId(orgId);
    }
    getDefaultSignature(orgId) {
        return this._signatureRepository.getDefaultSignature(orgId);
    }
    createOrUpdateSignature(orgId, signature, id) {
        return this._signatureRepository.createOrUpdateSignature(orgId, signature, id);
    }
    deleteSignature(orgId, id) {
        return this._signatureRepository.deleteSignature(orgId, id);
    }
};
exports.SignatureService = SignatureService;
exports.SignatureService = SignatureService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [signature_repository_1.SignatureRepository])
], SignatureService);
//# sourceMappingURL=signature.service.js.map