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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateVideoOptionsTool = void 0;
const tools_1 = require("@mastra/core/tools");
const common_1 = require("@nestjs/common");
const validation_schemas_helper_1 = require("../validation.schemas.helper");
const video_manager_1 = require("../../videos/video.manager");
const zod_1 = __importDefault(require("zod"));
const auth_context_1 = require("../auth.context");
let GenerateVideoOptionsTool = class GenerateVideoOptionsTool {
    constructor(_videoManagerService) {
        this._videoManagerService = _videoManagerService;
        this.name = 'generateVideoOptions';
    }
    run() {
        return (0, tools_1.createTool)({
            id: 'generateVideoOptions',
            description: `All the options to generate videos, some tools might require another call to generateVideoFunction`,
            inputSchema: zod_1.default.object({
                reasoning: zod_1.default
                    .string()
                    .optional()
                    .describe('Optional short reason for why you are listing the video generation options'),
            }),
            mcp: {
                annotations: {
                    title: 'List Video Generation Options',
                    readOnlyHint: true,
                    destructiveHint: false,
                    idempotentHint: true,
                    openWorldHint: false,
                },
            },
            outputSchema: zod_1.default.object({
                video: zod_1.default.array(zod_1.default.object({
                    type: zod_1.default.string(),
                    output: zod_1.default.string(),
                    tools: zod_1.default.array(zod_1.default.object({
                        functionName: zod_1.default.string(),
                        output: zod_1.default.string(),
                    })),
                    customParams: zod_1.default.any(),
                })),
            }),
            execute: async (inputData, context) => {
                (0, auth_context_1.checkAuth)(inputData, context);
                const videos = this._videoManagerService.getAllVideos();
                console.log(JSON.stringify({
                    video: videos.map((p) => {
                        return {
                            type: p.identifier,
                            output: 'vertical|horizontal',
                            tools: p.tools,
                            customParams: (0, validation_schemas_helper_1.getValidationSchemas)()[p.dto.name],
                        };
                    }),
                }, null, 2));
                return {
                    video: videos.map((p) => {
                        return {
                            type: p.identifier,
                            output: 'vertical|horizontal',
                            tools: p.tools,
                            customParams: (0, validation_schemas_helper_1.getValidationSchemas)()[p.dto.name],
                        };
                    }),
                };
            },
        });
    }
};
exports.GenerateVideoOptionsTool = GenerateVideoOptionsTool;
exports.GenerateVideoOptionsTool = GenerateVideoOptionsTool = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [video_manager_1.VideoManager])
], GenerateVideoOptionsTool);
//# sourceMappingURL=generate.video.options.tool.js.map