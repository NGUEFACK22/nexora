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
exports.ErrorsService = void 0;
const common_1 = require("@nestjs/common");
const errors_repository_1 = require("./errors.repository");
let ErrorsService = class ErrorsService {
    constructor(_errorsRepository) {
        this._errorsRepository = _errorsRepository;
    }
    listErrors(params) {
        return this._errorsRepository.listErrors(params);
    }
    listPlatforms() {
        return this._errorsRepository.listPlatforms();
    }
};
exports.ErrorsService = ErrorsService;
exports.ErrorsService = ErrorsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [errors_repository_1.ErrorsRepository])
], ErrorsService);
//# sourceMappingURL=errors.service.js.map