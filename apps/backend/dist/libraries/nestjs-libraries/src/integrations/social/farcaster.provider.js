"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FarcasterProvider = void 0;
const tslib_1 = require("tslib");
const make_secure_id_1 = require("@gitroom/nestjs-libraries/services/make.secure.id");
const dayjs_1 = tslib_1.__importDefault(require("dayjs"));
const social_abstract_1 = require("@gitroom/nestjs-libraries/integrations/social.abstract");
const nodejs_sdk_1 = require("@neynar/nodejs-sdk");
const farcaster_dto_1 = require("@gitroom/nestjs-libraries/dtos/posts/providers-settings/farcaster.dto");
const tool_decorator_1 = require("@gitroom/nestjs-libraries/integrations/tool.decorator");
const rules_description_decorator_1 = require("@gitroom/nestjs-libraries/chat/rules.description.decorator");
const accounts_1 = require("viem/accounts");
const qrcode_1 = require("qrcode");
const client = new nodejs_sdk_1.NeynarAPIClient({
    apiKey: process.env.NEYNAR_SECRET_KEY || '00000000-000-0000-000-000000000000',
});
const SIGNED_KEY_REQUEST_VALIDATOR_EIP_712_DOMAIN = {
    name: 'Farcaster SignedKeyRequestValidator',
    version: '1',
    chainId: 10,
    verifyingContract: '0x00000000fc700472606ed4fa22623acf62c60553',
};
const SIGNED_KEY_REQUEST_TYPE = [
    { name: 'requestFid', type: 'uint256' },
    { name: 'key', type: 'bytes' },
    { name: 'deadline', type: 'uint256' },
];
let FarcasterProvider = class FarcasterProvider extends social_abstract_1.SocialAbstract {
    constructor() {
        super(...arguments);
        this.identifier = 'wrapcast';
        this.name = 'Farcaster';
        this.isBetweenSteps = false;
        this.isWeb3 = true;
        this.scopes = [];
        this.maxConcurrentJob = 3;
        this.editor = 'normal';
        this.dto = farcaster_dto_1.FarcasterDto;
    }
    maxLength() {
        return 800;
    }
    async checkValidity(list) {
        if (list?.some((item) => item?.some((field) => (field?.path?.indexOf?.('mp4') ?? -1) > -1))) {
            return 'Can only accept images';
        }
        return true;
    }
    async refreshToken(refresh_token) {
        return {
            refreshToken: '',
            expiresIn: 0,
            accessToken: '',
            id: '',
            name: '',
            picture: '',
            username: '',
        };
    }
    async generateAuthUrl() {
        const state = (0, make_secure_id_1.makeSecureId)(17);
        return {
            url: `${process.env.NEYNAR_CLIENT_ID}||${state}` || '',
            codeVerifier: (0, make_secure_id_1.makeSecureId)(10),
            state,
        };
    }
    async createSigner() {
        if (!process.env.NEYNAR_APP_FID || !process.env.NEYNAR_APP_MNEMONIC) {
            throw new Error('Farcaster is not configured: set NEYNAR_APP_FID and NEYNAR_APP_MNEMONIC');
        }
        const appFid = Number(process.env.NEYNAR_APP_FID);
        const signer = await client.createSigner();
        const deadline = Math.floor(Date.now() / 1000) + 24 * 60 * 60;
        const signature = await (0, accounts_1.mnemonicToAccount)(process.env.NEYNAR_APP_MNEMONIC).signTypedData({
            domain: SIGNED_KEY_REQUEST_VALIDATOR_EIP_712_DOMAIN,
            types: { SignedKeyRequest: SIGNED_KEY_REQUEST_TYPE },
            primaryType: 'SignedKeyRequest',
            message: {
                requestFid: BigInt(appFid),
                key: signer.public_key,
                deadline: BigInt(deadline),
            },
        });
        const registered = await client.registerSignedKey({
            signerUuid: signer.signer_uuid,
            appFid,
            deadline,
            signature,
            ...(process.env.NEYNAR_SPONSOR_SIGNERS === 'true'
                ? { sponsor: { sponsored_by_neynar: true } }
                : {}),
        });
        return {
            signerUuid: registered.signer_uuid,
            approvalUrl: registered.signer_approval_url,
            qrCode: await (0, qrcode_1.toDataURL)(registered.signer_approval_url),
        };
    }
    async signerStatus(signerUuid) {
        const signer = await client.lookupSigner({ signerUuid });
        if (signer.status !== 'approved') {
            return { status: signer.status };
        }
        const { users: [user], } = await client.fetchBulkUsers({ fids: [signer.fid] });
        return {
            status: signer.status,
            code: Buffer.from(JSON.stringify({
                signer_uuid: signerUuid,
                fid: signer.fid,
                username: user.username,
                display_name: user.display_name,
                pfp_url: user.pfp_url,
            })).toString('base64'),
        };
    }
    async authenticate(params) {
        const data = JSON.parse(Buffer.from(params.code, 'base64').toString());
        return {
            id: String(data.fid),
            name: data.display_name,
            accessToken: data.signer_uuid,
            refreshToken: '',
            expiresIn: (0, dayjs_1.default)().add(200, 'year').unix() - (0, dayjs_1.default)().unix(),
            picture: data?.pfp_url || '',
            username: data.username,
        };
    }
    async post(id, accessToken, postDetails) {
        const [firstPost] = postDetails;
        const ids = [];
        const channels = !firstPost?.settings?.subreddit ||
            firstPost?.settings?.subreddit.length === 0
            ? [undefined]
            : firstPost?.settings?.subreddit;
        for (const channel of channels) {
            const data = await client.publishCast({
                embeds: firstPost?.media?.map((media) => ({
                    url: media.path,
                })) || [],
                signerUuid: accessToken,
                text: firstPost.message,
                ...(channel?.value?.id ? { channelId: channel?.value?.id } : {}),
            });
            ids.push({
                releaseURL: `https://warpcast.com/${data.cast.author.username}/${data.cast.hash}`,
                postId: data.cast.hash,
            });
        }
        return [
            {
                id: firstPost.id,
                postId: ids.map((p) => p.postId).join(','),
                releaseURL: ids.map((p) => p.releaseURL).join(','),
                status: 'published',
            },
        ];
    }
    async comment(id, postId, lastCommentId, accessToken, postDetails, integration) {
        const [commentPost] = postDetails;
        const ids = [];
        const parentIds = (lastCommentId || postId).split(',');
        for (const parentHash of parentIds) {
            const data = await client.publishCast({
                embeds: commentPost?.media?.map((media) => ({
                    url: media.path,
                })) || [],
                signerUuid: accessToken,
                text: commentPost.message,
                parent: parentHash,
            });
            ids.push({
                releaseURL: `https://warpcast.com/${data.cast.author.username}/${data.cast.hash}`,
                postId: data.cast.hash,
            });
        }
        return [
            {
                id: commentPost.id,
                postId: ids.map((p) => p.postId).join(','),
                releaseURL: ids.map((p) => p.releaseURL).join(','),
                status: 'published',
            },
        ];
    }
    async subreddits(accessToken, data, id, integration) {
        const search = await client.searchChannels({
            q: data.word,
            limit: 10,
        });
        return search.channels.map((p) => {
            return {
                title: p.name,
                name: p.name,
                id: p.id,
            };
        });
    }
};
exports.FarcasterProvider = FarcasterProvider;
tslib_1.__decorate([
    (0, tool_decorator_1.Tool)({
        description: 'Search channels',
        dataSchema: [{ key: 'word', type: 'string', description: 'Search word' }],
    }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object, String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], FarcasterProvider.prototype, "subreddits", null);
exports.FarcasterProvider = FarcasterProvider = tslib_1.__decorate([
    (0, rules_description_decorator_1.Rules)('Farcaster/Warpcast can only accept pictures')
], FarcasterProvider);
//# sourceMappingURL=farcaster.provider.js.map