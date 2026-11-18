"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toolList = void 0;
const integration_validation_tool_1 = require("@gitroom/nestjs-libraries/chat/tools/integration.validation.tool");
const integration_trigger_tool_1 = require("@gitroom/nestjs-libraries/chat/tools/integration.trigger.tool");
const integration_schedule_post_1 = require("./integration.schedule.post");
const generate_video_options_tool_1 = require("@gitroom/nestjs-libraries/chat/tools/generate.video.options.tool");
const video_function_tool_1 = require("@gitroom/nestjs-libraries/chat/tools/video.function.tool");
const generate_video_tool_1 = require("@gitroom/nestjs-libraries/chat/tools/generate.video.tool");
const video_status_tool_1 = require("@gitroom/nestjs-libraries/chat/tools/video.status.tool");
const clipping_tool_1 = require("@gitroom/nestjs-libraries/chat/tools/clipping.tool");
const clipping_status_tool_1 = require("@gitroom/nestjs-libraries/chat/tools/clipping.status.tool");
const clipping_widget_ticket_tool_1 = require("@gitroom/nestjs-libraries/chat/tools/clipping.widget.ticket.tool");
const generate_image_tool_1 = require("@gitroom/nestjs-libraries/chat/tools/generate.image.tool");
const integration_list_tool_1 = require("@gitroom/nestjs-libraries/chat/tools/integration.list.tool");
const group_list_tool_1 = require("@gitroom/nestjs-libraries/chat/tools/group.list.tool");
const integration_connect_tool_1 = require("@gitroom/nestjs-libraries/chat/tools/integration.connect.tool");
const upload_from_url_tool_1 = require("@gitroom/nestjs-libraries/chat/tools/upload.from.url.tool");
const media_list_tool_1 = require("@gitroom/nestjs-libraries/chat/tools/media.list.tool");
const media_status_tool_1 = require("@gitroom/nestjs-libraries/chat/tools/media.status.tool");
const posts_list_tool_1 = require("@gitroom/nestjs-libraries/chat/tools/posts.list.tool");
const post_settings_tool_1 = require("@gitroom/nestjs-libraries/chat/tools/post.settings.tool");
const delete_post_tool_1 = require("@gitroom/nestjs-libraries/chat/tools/delete.post.tool");
const upload_widget_tool_1 = require("@gitroom/nestjs-libraries/chat/tools/upload.widget.tool");
const upload_widget_ticket_tool_1 = require("@gitroom/nestjs-libraries/chat/tools/upload.widget.ticket.tool");
const upload_widget_status_tool_1 = require("@gitroom/nestjs-libraries/chat/tools/upload.widget.status.tool");
exports.toolList = [
    integration_list_tool_1.IntegrationListTool,
    group_list_tool_1.GroupListTool,
    integration_connect_tool_1.IntegrationConnectTool,
    integration_validation_tool_1.IntegrationValidationTool,
    integration_trigger_tool_1.IntegrationTriggerTool,
    integration_schedule_post_1.IntegrationSchedulePostTool,
    posts_list_tool_1.PostsListTool,
    post_settings_tool_1.PostSettingsTool,
    delete_post_tool_1.DeletePostTool,
    generate_video_options_tool_1.GenerateVideoOptionsTool,
    video_function_tool_1.VideoFunctionTool,
    generate_video_tool_1.GenerateVideoTool,
    video_status_tool_1.VideoStatusTool,
    clipping_tool_1.ClippingTool,
    clipping_status_tool_1.ClippingStatusTool,
    clipping_widget_ticket_tool_1.ClippingWidgetTicketTool,
    generate_image_tool_1.GenerateImageTool,
    upload_from_url_tool_1.UploadFromUrlTool,
    media_list_tool_1.MediaListTool,
    media_status_tool_1.MediaStatusTool,
    upload_widget_tool_1.UploadWidgetTool,
    upload_widget_ticket_tool_1.UploadWidgetTicketTool,
    upload_widget_status_tool_1.UploadWidgetStatusTool,
];
//# sourceMappingURL=tool.list.js.map