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
exports.InfiniteWorkflowRegisterModule = exports.InfiniteWorkflowRegister = void 0;
const common_1 = require("@nestjs/common");
const nestjs_temporal_core_1 = require("nestjs-temporal-core");
let InfiniteWorkflowRegister = class InfiniteWorkflowRegister {
    constructor(_temporalService) {
        this._temporalService = _temporalService;
    }
    async onModuleInit() {
        if (!!process.env.RUN_CRON) {
            try {
                await this._temporalService.client
                    ?.getRawClient()
                    ?.workflow?.start('missingPostWorkflow', {
                    workflowId: 'missing-post-workflow',
                    taskQueue: 'main',
                });
            }
            catch (err) { }
        }
    }
};
exports.InfiniteWorkflowRegister = InfiniteWorkflowRegister;
exports.InfiniteWorkflowRegister = InfiniteWorkflowRegister = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [nestjs_temporal_core_1.TemporalService])
], InfiniteWorkflowRegister);
let InfiniteWorkflowRegisterModule = class InfiniteWorkflowRegisterModule {
};
exports.InfiniteWorkflowRegisterModule = InfiniteWorkflowRegisterModule;
exports.InfiniteWorkflowRegisterModule = InfiniteWorkflowRegisterModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [],
        controllers: [],
        providers: [InfiniteWorkflowRegister],
        get exports() {
            return this.providers;
        },
    })
], InfiniteWorkflowRegisterModule);
//# sourceMappingURL=infinite.workflow.register.js.map