"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatModule = void 0;
const common_1 = require("@nestjs/common");
const load_tools_service_1 = require("./load.tools.service");
const mastra_service_1 = require("./mastra.service");
const tool_list_1 = require("./tools/tool.list");
const mcp_relay_service_1 = require("./mcp.relay.service");
let ChatModule = class ChatModule {
};
exports.ChatModule = ChatModule;
exports.ChatModule = ChatModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [mastra_service_1.MastraService, load_tools_service_1.LoadToolsService, mcp_relay_service_1.McpRelayService, ...tool_list_1.toolList],
        get exports() {
            return this.providers;
        },
    })
], ChatModule);
//# sourceMappingURL=chat.module.js.map