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
exports.ThirdPartyController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const thirdparty_manager_1 = require("../../../../../libraries/nestjs-libraries/src/3rdparties/thirdparty.manager");
const org_from_request_1 = require("../../../../../libraries/nestjs-libraries/src/user/org.from.request");
const auth_service_1 = require("../../../../../libraries/helpers/src/auth/auth.service");
const upload_factory_1 = require("../../../../../libraries/nestjs-libraries/src/upload/upload.factory");
const media_service_1 = require("../../../../../libraries/nestjs-libraries/src/database/prisma/media/media.service");
const import_media_dto_1 = require("../../../../../libraries/nestjs-libraries/src/dtos/third-party/import-media.dto");
let ThirdPartyController = class ThirdPartyController {
    constructor(_thirdPartyManager, _mediaService) {
        this._thirdPartyManager = _thirdPartyManager;
        this._mediaService = _mediaService;
        this.storage = upload_factory_1.UploadFactory.createStorage();
    }
    async getThirdPartyList() {
        return this._thirdPartyManager.getAllThirdParties();
    }
    async getSavedThirdParty(organization) {
        return Promise.all((await this._thirdPartyManager.getAllThirdPartiesByOrganization(organization.id)).map((thirdParty) => {
            const { description, fields, position, title, identifier } = this._thirdPartyManager.getThirdPartyByName(thirdParty.identifier);
            return {
                ...thirdParty,
                title,
                position,
                fields,
                description,
            };
        }));
    }
    deleteById(organization, id) {
        return this._thirdPartyManager.deleteIntegration(organization.id, id);
    }
    async generate(organization, id, data) {
        const thirdParty = await this._thirdPartyManager.getIntegrationById(organization.id, id);
        if (!thirdParty) {
            throw new common_1.HttpException('Integration not found', 404);
        }
        const thirdPartyInstance = this._thirdPartyManager.getThirdPartyByName(thirdParty.identifier);
        if (!thirdPartyInstance) {
            throw new common_1.HttpException('Invalid identifier', 400);
        }
        const loadedData = await thirdPartyInstance?.instance?.sendData(auth_service_1.AuthService.fixedDecryption(thirdParty.apiKey), data);
        const file = await this.storage.uploadSimple(loadedData);
        return this._mediaService.saveFile(organization.id, file.split('/').pop(), file);
    }
    async callFunction(organization, id, functionName, data) {
        const thirdParty = await this._thirdPartyManager.getIntegrationById(organization.id, id);
        if (!thirdParty) {
            throw new common_1.HttpException('Integration not found', 404);
        }
        const thirdPartyInstance = this._thirdPartyManager.getThirdPartyByName(thirdParty.identifier);
        if (!thirdPartyInstance) {
            throw new common_1.HttpException('Invalid identifier', 400);
        }
        return thirdPartyInstance?.instance?.[functionName](auth_service_1.AuthService.fixedDecryption(thirdParty.apiKey), data);
    }
    async importMedia(organization, id, body) {
        const thirdParty = await this._thirdPartyManager.getIntegrationById(organization.id, id);
        if (!thirdParty) {
            throw new common_1.HttpException('Integration not found', 404);
        }
        const thirdPartyInstance = this._thirdPartyManager.getThirdPartyByName(thirdParty.identifier);
        if (!thirdPartyInstance) {
            throw new common_1.HttpException('Invalid identifier', 400);
        }
        const downloadUrls = await thirdPartyInstance?.instance?.['importMedia']?.(auth_service_1.AuthService.fixedDecryption(thirdParty.apiKey), body.items);
        if (!downloadUrls || !Array.isArray(downloadUrls)) {
            throw new common_1.HttpException('Import not supported', 400);
        }
        const results = [];
        for (const item of downloadUrls) {
            const file = await this.storage.uploadSimple(item.url);
            const saved = await this._mediaService.saveFile(organization.id, item.name || file.split('/').pop(), file);
            results.push(saved);
        }
        return results;
    }
    async addApiKey(organization, identifier, api) {
        const thirdParty = this._thirdPartyManager.getThirdPartyByName(identifier);
        if (!thirdParty) {
            throw new common_1.HttpException('Invalid identifier', 400);
        }
        const connect = await thirdParty.instance.checkConnection(api);
        if (!connect) {
            throw new common_1.HttpException('Invalid API key', 400);
        }
        try {
            const save = await this._thirdPartyManager.saveIntegration(organization.id, identifier, api, {
                name: connect.name,
                username: connect.username,
                id: connect.id,
            });
            return {
                id: save.id,
            };
        }
        catch (e) {
            console.log(e);
            throw new common_1.HttpException('Integration Already Exists', 400);
        }
    }
};
exports.ThirdPartyController = ThirdPartyController;
__decorate([
    (0, common_1.Get)('/list'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ThirdPartyController.prototype, "getThirdPartyList", null);
__decorate([
    (0, common_1.Get)('/'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ThirdPartyController.prototype, "getSavedThirdParty", null);
__decorate([
    (0, common_1.Delete)('/:id'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ThirdPartyController.prototype, "deleteById", null);
__decorate([
    (0, common_1.Post)('/:id/submit'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ThirdPartyController.prototype, "generate", null);
__decorate([
    (0, common_1.Post)('/function/:id/:functionName'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('functionName')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], ThirdPartyController.prototype, "callFunction", null);
__decorate([
    (0, common_1.Post)('/:id/import'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, import_media_dto_1.ImportMediaDto]),
    __metadata("design:returntype", Promise)
], ThirdPartyController.prototype, "importMedia", null);
__decorate([
    (0, common_1.Post)('/:identifier'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Param)('identifier')),
    __param(2, (0, common_1.Body)('api')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ThirdPartyController.prototype, "addApiKey", null);
exports.ThirdPartyController = ThirdPartyController = __decorate([
    (0, swagger_1.ApiTags)('Third Party'),
    (0, common_1.Controller)('/third-party'),
    __metadata("design:paramtypes", [thirdparty_manager_1.ThirdPartyManager,
        media_service_1.MediaService])
], ThirdPartyController);
//# sourceMappingURL=third-party.controller.js.map