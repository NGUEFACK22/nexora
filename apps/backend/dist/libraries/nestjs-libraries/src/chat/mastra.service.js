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
var MastraService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MastraService = void 0;
const mastra_1 = require("@mastra/core/mastra");
const logger_1 = require("@mastra/core/logger");
const mastra_store_1 = require("./mastra.store");
const common_1 = require("@nestjs/common");
const load_tools_service_1 = require("./load.tools.service");
let MastraService = MastraService_1 = class MastraService {
    constructor(_loadToolsService) {
        this._loadToolsService = _loadToolsService;
    }
    async mastra() {
        MastraService_1.mastra =
            MastraService_1.mastra ||
                new mastra_1.Mastra({
                    storage: mastra_store_1.pStore,
                    agents: {
                        postiz: await this._loadToolsService.agent(),
                    },
                    logger: new logger_1.ConsoleLogger({
                        level: 'info',
                    }),
                });
        return MastraService_1.mastra;
    }
};
exports.MastraService = MastraService;
exports.MastraService = MastraService = MastraService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [load_tools_service_1.LoadToolsService])
], MastraService);
//# sourceMappingURL=mastra.service.js.map