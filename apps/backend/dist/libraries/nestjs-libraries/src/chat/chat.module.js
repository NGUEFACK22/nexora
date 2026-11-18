"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatModule = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const load_tools_service_1 = require("@gitroom/nestjs-libraries/chat/load.tools.service");
const mastra_service_1 = require("@gitroom/nestjs-libraries/chat/mastra.service");
const tool_list_1 = require("@gitroom/nestjs-libraries/chat/tools/tool.list");
const mcp_relay_service_1 = require("@gitroom/nestjs-libraries/chat/mcp.relay.service");
let ChatModule = class ChatModule {
};
exports.ChatModule = ChatModule;
exports.ChatModule = ChatModule = tslib_1.__decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [mastra_service_1.MastraService, load_tools_service_1.LoadToolsService, mcp_relay_service_1.McpRelayService, ...tool_list_1.toolList],
        get exports() {
            return this.providers;
        },
    })
], ChatModule);
//# sourceMappingURL=chat.module.js.map