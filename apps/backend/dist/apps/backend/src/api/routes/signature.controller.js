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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignatureController = void 0;
const common_1 = require("@nestjs/common");
const org_from_request_1 = require("../../../../../libraries/nestjs-libraries/src/user/org.from.request");
const swagger_1 = require("@nestjs/swagger");
const signature_service_1 = require("../../../../../libraries/nestjs-libraries/src/database/prisma/signatures/signature.service");
const signature_dto_1 = require("../../../../../libraries/nestjs-libraries/src/dtos/signature/signature.dto");
let SignatureController = class SignatureController {
    constructor(_signatureService) {
        this._signatureService = _signatureService;
    }
    async getSignatures(org) {
        return this._signatureService.getSignaturesByOrgId(org.id);
    }
    async getDefaultSignature(org) {
        return (await this._signatureService.getDefaultSignature(org.id)) || {};
    }
    async createSignature(org, body) {
        return this._signatureService.createOrUpdateSignature(org.id, body);
    }
    async deleteSignature(org, id) {
        return this._signatureService.deleteSignature(org.id, id);
    }
    async updateSignature(id, org, body) {
        return this._signatureService.createOrUpdateSignature(org.id, body, id);
    }
};
exports.SignatureController = SignatureController;
__decorate([
    (0, common_1.Get)('/'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SignatureController.prototype, "getSignatures", null);
__decorate([
    (0, common_1.Get)('/default'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SignatureController.prototype, "getDefaultSignature", null);
__decorate([
    (0, common_1.Post)('/'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, signature_dto_1.SignatureDto]),
    __metadata("design:returntype", Promise)
], SignatureController.prototype, "createSignature", null);
__decorate([
    (0, common_1.Delete)('/:id'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SignatureController.prototype, "deleteSignature", null);
__decorate([
    (0, common_1.Put)('/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, signature_dto_1.SignatureDto]),
    __metadata("design:returntype", Promise)
], SignatureController.prototype, "updateSignature", null);
exports.SignatureController = SignatureController = __decorate([
    (0, swagger_1.ApiTags)('Signatures'),
    (0, common_1.Controller)('/signatures'),
    __metadata("design:paramtypes", [signature_service_1.SignatureService])
], SignatureController);
//# sourceMappingURL=signature.controller.js.map