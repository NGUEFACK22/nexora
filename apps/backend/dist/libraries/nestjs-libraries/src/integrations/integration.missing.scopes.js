"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotEnoughScopesFilter = void 0;
const common_1 = require("@nestjs/common");
const social_abstract_1 = require("./social.abstract");
const axios_1 = require("axios");
let NotEnoughScopesFilter = class NotEnoughScopesFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        response
            .status(axios_1.HttpStatusCode.Conflict)
            .json({ msg: exception.message });
    }
};
exports.NotEnoughScopesFilter = NotEnoughScopesFilter;
exports.NotEnoughScopesFilter = NotEnoughScopesFilter = __decorate([
    (0, common_1.Catch)(social_abstract_1.NotEnoughScopes)
], NotEnoughScopesFilter);
//# sourceMappingURL=integration.missing.scopes.js.map