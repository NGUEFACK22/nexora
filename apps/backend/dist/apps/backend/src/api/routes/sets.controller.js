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
exports.SetsController = void 0;
const common_1 = require("@nestjs/common");
const org_from_request_1 = require("../../../../../libraries/nestjs-libraries/src/user/org.from.request");
const swagger_1 = require("@nestjs/swagger");
const sets_service_1 = require("../../../../../libraries/nestjs-libraries/src/database/prisma/sets/sets.service");
const sets_dto_1 = require("../../../../../libraries/nestjs-libraries/src/dtos/sets/sets.dto");
let SetsController = class SetsController {
    constructor(_setsService) {
        this._setsService = _setsService;
    }
    async getSets(org) {
        return this._setsService.getSets(org.id);
    }
    async createASet(org, body) {
        return this._setsService.createSet(org.id, body);
    }
    async updateSet(org, body) {
        return this._setsService.createSet(org.id, body);
    }
    async deleteSet(org, id) {
        return this._setsService.deleteSet(org.id, id);
    }
};
exports.SetsController = SetsController;
__decorate([
    (0, common_1.Get)('/'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SetsController.prototype, "getSets", null);
__decorate([
    (0, common_1.Post)('/'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, sets_dto_1.SetsDto]),
    __metadata("design:returntype", Promise)
], SetsController.prototype, "createASet", null);
__decorate([
    (0, common_1.Put)('/'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, sets_dto_1.UpdateSetsDto]),
    __metadata("design:returntype", Promise)
], SetsController.prototype, "updateSet", null);
__decorate([
    (0, common_1.Delete)('/:id'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SetsController.prototype, "deleteSet", null);
exports.SetsController = SetsController = __decorate([
    (0, swagger_1.ApiTags)('Sets'),
    (0, common_1.Controller)('/sets'),
    __metadata("design:paramtypes", [sets_service_1.SetsService])
], SetsController);
//# sourceMappingURL=sets.controller.js.map