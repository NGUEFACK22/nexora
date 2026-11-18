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
exports.VideoManager = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const video_interface_1 = require("./video.interface");
let VideoManager = class VideoManager {
    constructor(_moduleRef) {
        this._moduleRef = _moduleRef;
    }
    getAllVideos() {
        return (Reflect.getMetadata('video', video_interface_1.VideoAbstract) || [])
            .filter((f) => f.available)
            .map((p) => ({
            target: p.target,
            identifier: p.identifier,
            title: p.title,
            tools: p.tools,
            dto: p.dto,
            description: p.description,
            placement: p.placement,
            trial: p.trial,
        }));
    }
    checkAvailableVideoFunction(method) {
        const videoFunction = Reflect.getMetadata('video-function', method);
        return !videoFunction;
    }
    getVideoByName(identifier) {
        const video = (Reflect.getMetadata('video', video_interface_1.VideoAbstract) || []).find((p) => p.identifier === identifier);
        return {
            ...video,
            instance: this._moduleRef.get(video.target, {
                strict: false,
            }),
        };
    }
};
exports.VideoManager = VideoManager;
exports.VideoManager = VideoManager = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.ModuleRef])
], VideoManager);
//# sourceMappingURL=video.manager.js.map