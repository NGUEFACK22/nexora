"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmptySettings = exports.allProviders = void 0;
const tslib_1 = require("tslib");
const reddit_dto_1 = require("@gitroom/nestjs-libraries/dtos/posts/providers-settings/reddit.dto");
const pinterest_dto_1 = require("@gitroom/nestjs-libraries/dtos/posts/providers-settings/pinterest.dto");
const youtube_settings_dto_1 = require("@gitroom/nestjs-libraries/dtos/posts/providers-settings/youtube.settings.dto");
const tiktok_dto_1 = require("@gitroom/nestjs-libraries/dtos/posts/providers-settings/tiktok.dto");
const x_dto_1 = require("@gitroom/nestjs-libraries/dtos/posts/providers-settings/x.dto");
const lemmy_dto_1 = require("@gitroom/nestjs-libraries/dtos/posts/providers-settings/lemmy.dto");
const dribbble_dto_1 = require("@gitroom/nestjs-libraries/dtos/posts/providers-settings/dribbble.dto");
const discord_dto_1 = require("@gitroom/nestjs-libraries/dtos/posts/providers-settings/discord.dto");
const slack_dto_1 = require("@gitroom/nestjs-libraries/dtos/posts/providers-settings/slack.dto");
const kick_dto_1 = require("@gitroom/nestjs-libraries/dtos/posts/providers-settings/kick.dto");
const twitch_dto_1 = require("@gitroom/nestjs-libraries/dtos/posts/providers-settings/twitch.dto");
const instagram_dto_1 = require("@gitroom/nestjs-libraries/dtos/posts/providers-settings/instagram.dto");
const linkedin_dto_1 = require("@gitroom/nestjs-libraries/dtos/posts/providers-settings/linkedin.dto");
const class_validator_1 = require("class-validator");
const medium_settings_dto_1 = require("@gitroom/nestjs-libraries/dtos/posts/providers-settings/medium.settings.dto");
const dev_to_settings_dto_1 = require("@gitroom/nestjs-libraries/dtos/posts/providers-settings/dev.to.settings.dto");
const hashnode_settings_dto_1 = require("@gitroom/nestjs-libraries/dtos/posts/providers-settings/hashnode.settings.dto");
const wordpress_dto_1 = require("@gitroom/nestjs-libraries/dtos/posts/providers-settings/wordpress.dto");
const listmonk_dto_1 = require("@gitroom/nestjs-libraries/dtos/posts/providers-settings/listmonk.dto");
const gmb_settings_dto_1 = require("@gitroom/nestjs-libraries/dtos/posts/providers-settings/gmb.settings.dto");
const farcaster_dto_1 = require("@gitroom/nestjs-libraries/dtos/posts/providers-settings/farcaster.dto");
const facebook_dto_1 = require("@gitroom/nestjs-libraries/dtos/posts/providers-settings/facebook.dto");
const moltbook_dto_1 = require("@gitroom/nestjs-libraries/dtos/posts/providers-settings/moltbook.dto");
const skool_dto_1 = require("@gitroom/nestjs-libraries/dtos/posts/providers-settings/skool.dto");
const whop_dto_1 = require("@gitroom/nestjs-libraries/dtos/posts/providers-settings/whop.dto");
const mewe_dto_1 = require("@gitroom/nestjs-libraries/dtos/posts/providers-settings/mewe.dto");
const tumblr_dto_1 = require("@gitroom/nestjs-libraries/dtos/posts/providers-settings/tumblr.dto");
const threads_dto_1 = require("@gitroom/nestjs-libraries/dtos/posts/providers-settings/threads.dto");
const allProviders = (setEmpty) => {
    return [
        { value: reddit_dto_1.RedditSettingsDto, name: 'reddit' },
        { value: lemmy_dto_1.LemmySettingsDto, name: 'lemmy' },
        { value: youtube_settings_dto_1.YoutubeSettingsDto, name: 'youtube' },
        { value: pinterest_dto_1.PinterestSettingsDto, name: 'pinterest' },
        { value: dribbble_dto_1.DribbbleDto, name: 'dribbble' },
        { value: tiktok_dto_1.TikTokDto, name: 'tiktok' },
        { value: tiktok_dto_1.TikTokDto, name: 'tiktok-business' },
        { value: discord_dto_1.DiscordDto, name: 'discord' },
        { value: slack_dto_1.SlackDto, name: 'slack' },
        { value: kick_dto_1.KickDto, name: 'kick' },
        { value: twitch_dto_1.TwitchDto, name: 'twitch' },
        { value: x_dto_1.XDto, name: 'x' },
        { value: linkedin_dto_1.LinkedinDto, name: 'linkedin' },
        { value: linkedin_dto_1.LinkedinDto, name: 'linkedin-page' },
        { value: instagram_dto_1.InstagramDto, name: 'instagram' },
        { value: instagram_dto_1.InstagramDto, name: 'instagram-standalone' },
        { value: medium_settings_dto_1.MediumSettingsDto, name: 'medium' },
        { value: dev_to_settings_dto_1.DevToSettingsDto, name: 'devto' },
        { value: wordpress_dto_1.WordpressDto, name: 'wordpress' },
        { value: hashnode_settings_dto_1.HashnodeSettingsDto, name: 'hashnode' },
        { value: listmonk_dto_1.ListmonkDto, name: 'listmonk' },
        { value: gmb_settings_dto_1.GmbSettingsDto, name: 'gmb' },
        { value: farcaster_dto_1.FarcasterDto, name: 'wrapcast' },
        { value: facebook_dto_1.FacebookDto, name: 'facebook' },
        { value: threads_dto_1.ThreadsDto, name: 'threads' },
        { value: setEmpty, name: 'mastodon' },
        { value: setEmpty, name: 'bluesky' },
        { value: setEmpty, name: 'telegram' },
        { value: setEmpty, name: 'nostr' },
        { value: setEmpty, name: 'vk' },
        { value: moltbook_dto_1.MoltbookDto, name: 'moltbook' },
        { value: skool_dto_1.SkoolDto, name: 'skool' },
        { value: whop_dto_1.WhopDto, name: 'whop' },
        { value: mewe_dto_1.MeweDto, name: 'mewe' },
        { value: tumblr_dto_1.TumblrDto, name: 'tumblr' },
    ].filter((f) => f.value);
};
exports.allProviders = allProviders;
class EmptySettings {
}
exports.EmptySettings = EmptySettings;
tslib_1.__decorate([
    (0, class_validator_1.IsIn)((0, exports.allProviders)(EmptySettings).map((p) => p.name), {
        message: `"__type" must be ${(0, exports.allProviders)(EmptySettings)
            .map((p) => p.name)
            .join(', ')}`,
    }),
    tslib_1.__metadata("design:type", String)
], EmptySettings.prototype, "__type", void 0);
//# sourceMappingURL=all.providers.settings.js.map