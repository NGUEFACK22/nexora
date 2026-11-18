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
exports.PostsRepository = void 0;
const prisma_service_1 = require("../prisma.service");
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const dayjs_1 = __importDefault(require("dayjs"));
const isoWeek_1 = __importDefault(require("dayjs/plugin/isoWeek"));
const weekOfYear_1 = __importDefault(require("dayjs/plugin/weekOfYear"));
const isSameOrAfter_1 = __importDefault(require("dayjs/plugin/isSameOrAfter"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
const uuid_1 = require("uuid");
const encryption_service_1 = require("../../../services/encryption.service");
dayjs_1.default.extend(isoWeek_1.default);
dayjs_1.default.extend(weekOfYear_1.default);
dayjs_1.default.extend(isSameOrAfter_1.default);
dayjs_1.default.extend(utc_1.default);
let PostsRepository = class PostsRepository {
    constructor(_post, _popularPosts, _comments, _tags, _tagsPosts, _errors, _encryptionService) {
        this._post = _post;
        this._popularPosts = _popularPosts;
        this._comments = _comments;
        this._tags = _tags;
        this._tagsPosts = _tagsPosts;
        this._errors = _errors;
        this._encryptionService = _encryptionService;
    }
    async decryptIntegration(post) {
        return post?.integration
            ? {
                ...post,
                integration: await this._encryptionService.decryptFields(post.integration, encryption_service_1.integrationEncryptedFields),
            }
            : post;
    }
    searchForMissingThreeHoursPosts() {
        return this._post.model.post.findMany({
            where: {
                integration: {
                    refreshNeeded: false,
                    inBetweenSteps: false,
                    disabled: false,
                    deletedAt: null,
                },
                publishDate: {
                    gte: dayjs_1.default.utc().subtract(2, 'day').toDate(),
                    lt: dayjs_1.default.utc().toDate(),
                },
                state: 'QUEUE',
                deletedAt: null,
                parentPostId: null,
            },
            select: {
                id: true,
                organizationId: true,
                integration: {
                    select: {
                        providerIdentifier: true,
                    },
                },
                publishDate: true,
            },
        });
    }
    getPostState(id) {
        return this._post.model.post.findUnique({
            where: {
                id,
                deletedAt: null,
            },
            select: {
                state: true,
            },
        });
    }
    getOldPosts(orgId, date) {
        return this._post.model.post.findMany({
            where: {
                integration: {
                    refreshNeeded: false,
                    inBetweenSteps: false,
                    disabled: false,
                },
                organizationId: orgId,
                publishDate: {
                    lte: (0, dayjs_1.default)(date).toDate(),
                },
                deletedAt: null,
                parentPostId: null,
            },
            orderBy: {
                publishDate: 'desc',
            },
            select: {
                id: true,
                content: true,
                publishDate: true,
                releaseURL: true,
                state: true,
                integration: {
                    select: {
                        id: true,
                        name: true,
                        providerIdentifier: true,
                        picture: true,
                        type: true,
                    },
                },
            },
        });
    }
    updateImages(id, images) {
        return this._post.model.post.update({
            where: {
                id,
            },
            data: {
                image: images,
            },
        });
    }
    getPostUrls(orgId, ids) {
        return this._post.model.post.findMany({
            where: {
                organizationId: orgId,
                id: {
                    in: ids,
                },
            },
            select: {
                id: true,
                releaseURL: true,
            },
        });
    }
    curatedError(error) {
        if (!error) {
            return null;
        }
        try {
            const parsed = JSON.parse(error);
            const [type, message] = parsed?.cause?.failure?.message
                ? [parsed?.cause?.type, parsed?.cause?.failure?.message]
                : [
                    parsed?.failure?.cause?.applicationFailureInfo?.type,
                    parsed?.failure?.cause?.message,
                ];
            return type === 'bad_body' && message && message !== 'Unknown Error'
                ? message
                : null;
        }
        catch (err) {
            return null;
        }
    }
    async getPosts(orgId, query) {
        const startDate = dayjs_1.default.utc(query.startDate).toDate();
        const endDate = dayjs_1.default.utc(query.endDate).toDate();
        const whereBase = {
            AND: [
                {
                    OR: [
                        {
                            organizationId: orgId,
                        },
                    ],
                },
            ],
            integration: {
                deletedAt: null,
                organizationId: orgId,
                ...(query.customer ? { customerId: query.customer } : {}),
            },
            deletedAt: null,
            parentPostId: null,
        };
        const select = {
            id: true,
            content: true,
            publishDate: true,
            releaseURL: true,
            releaseId: true,
            state: true,
            error: true,
            intervalInDays: true,
            group: true,
            creationMethod: true,
            settings: true,
            tags: {
                where: {
                    tag: {
                        deletedAt: null,
                    },
                },
                select: {
                    tag: true,
                },
            },
            integration: {
                select: {
                    id: true,
                    providerIdentifier: true,
                    name: true,
                    picture: true,
                },
            },
        };
        const [inRange, repeating] = await Promise.all([
            this._post.model.post.findMany({
                where: {
                    ...whereBase,
                    publishDate: {
                        gte: startDate,
                        lte: endDate,
                    },
                    intervalInDays: null,
                },
                select,
            }),
            this._post.model.post.findMany({
                where: {
                    ...whereBase,
                    intervalInDays: {
                        not: null,
                    },
                },
                select,
            }),
        ]);
        const list = [...inRange, ...repeating];
        const rangeStart = dayjs_1.default.utc(startDate);
        const rangeEnd = dayjs_1.default.utc(endDate);
        const result = [];
        for (const row of list) {
            const post = { ...row, error: this.curatedError(row.error) };
            if (!post.intervalInDays || post.intervalInDays < 1) {
                result.push(post);
                continue;
            }
            const firstDate = dayjs_1.default.utc(post.publishDate);
            let occurrence = firstDate;
            if (rangeStart.isAfter(firstDate)) {
                const skip = Math.ceil(rangeStart.diff(firstDate, 'day', true) / post.intervalInDays);
                occurrence = firstDate.add(skip * post.intervalInDays, 'day');
            }
            while (!occurrence.isAfter(rangeEnd)) {
                result.push({
                    ...post,
                    publishDate: occurrence.toDate(),
                    actualDate: post.publishDate,
                });
                occurrence = occurrence.add(post.intervalInDays, 'day');
            }
        }
        return result;
    }
    async getPostsList(orgId, query) {
        const page = query.page || 0;
        const limit = query.limit || 20;
        const skip = page * limit;
        const stateFilter = query.state || 'all';
        const stateAndDate = stateFilter === 'scheduled'
            ? {
                state: client_1.State.QUEUE,
            }
            : stateFilter === 'draft'
                ? { state: client_1.State.DRAFT }
                : stateFilter === 'published'
                    ? { state: client_1.State.PUBLISHED }
                    : {
                        state: {
                            in: [client_1.State.QUEUE, client_1.State.DRAFT, client_1.State.PUBLISHED, client_1.State.ERROR],
                        },
                    };
        const orderDirection = stateFilter === 'published' ? 'desc' : 'asc';
        const where = {
            AND: [
                {
                    OR: [
                        {
                            organizationId: orgId,
                        },
                    ],
                },
            ],
            ...stateAndDate,
            ...(stateFilter === 'published'
                ? {}
                : { publishDate: { gte: dayjs_1.default.utc().toDate() } }),
            deletedAt: null,
            parentPostId: null,
            intervalInDays: null,
            integration: {
                deletedAt: null,
                organizationId: orgId,
                ...(query.customer
                    ? {
                        customerId: query.customer,
                    }
                    : {}),
                ...(query.integrations
                    ? {
                        id: { in: query.integrations },
                    }
                    : {}),
            },
        };
        const [posts, total] = await Promise.all([
            this._post.model.post.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    publishDate: orderDirection,
                },
                select: {
                    id: true,
                    content: true,
                    publishDate: true,
                    releaseURL: true,
                    releaseId: true,
                    state: true,
                    intervalInDays: true,
                    group: true,
                    creationMethod: true,
                    tags: {
                        where: {
                            tag: {
                                deletedAt: null,
                            },
                        },
                        select: {
                            tag: true,
                        },
                    },
                    integration: {
                        select: {
                            id: true,
                            providerIdentifier: true,
                            name: true,
                            picture: true,
                        },
                    },
                },
            }),
            this._post.model.post.count({ where }),
        ]);
        return {
            posts,
            total,
            page,
            limit,
            hasMore: skip + posts.length < total,
        };
    }
    async deletePost(orgId, group) {
        await this._post.model.post.updateMany({
            where: {
                organizationId: orgId,
                group,
            },
            data: {
                deletedAt: new Date(),
            },
        });
        return this._post.model.post.findFirst({
            where: {
                organizationId: orgId,
                group,
                parentPostId: null,
            },
            select: {
                id: true,
            },
        });
    }
    async getPostsByGroup(orgId, group) {
        const posts = await this._post.model.post.findMany({
            where: {
                group,
                ...(orgId ? { organizationId: orgId } : {}),
                deletedAt: null,
            },
            include: {
                integration: true,
                tags: {
                    where: {
                        tag: {
                            deletedAt: null,
                        },
                    },
                    select: {
                        tag: true,
                    },
                },
            },
        });
        return Promise.all(posts.map((p) => this.decryptIntegration(p)));
    }
    getPostsByBatch(orgId, batchId, exceptGroup) {
        return this._post.model.post.findMany({
            where: {
                organizationId: orgId,
                batchId,
                group: {
                    not: exceptGroup,
                },
                deletedAt: null,
                integration: {
                    deletedAt: null,
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
    }
    async getPost(id, includeIntegration = false, orgId, isFirst) {
        const post = await this._post.model.post.findUnique({
            where: {
                id,
                ...(orgId ? { organizationId: orgId } : {}),
                deletedAt: null,
            },
            include: {
                ...(includeIntegration
                    ? {
                        integration: true,
                        tags: {
                            where: {
                                tag: {
                                    deletedAt: null,
                                },
                            },
                            select: {
                                tag: true,
                            },
                        },
                    }
                    : {}),
                childrenPost: true,
            },
        });
        return this.decryptIntegration(post);
    }
    updatePost(id, postId, releaseURL) {
        return this._post.model.post.update({
            where: {
                id,
            },
            data: {
                state: 'PUBLISHED',
                releaseURL,
                releaseId: postId,
            },
        });
    }
    updateReleaseId(id, orgId, releaseId, releaseURL) {
        return this._post.model.post.update({
            where: {
                id,
                organizationId: orgId,
                releaseId: 'missing',
            },
            data: {
                releaseId: String(releaseId),
                ...(releaseURL ? { releaseURL } : {}),
            },
        });
    }
    updateResolvedRelease(id, orgId, releaseId, releaseURL) {
        return this._post.model.post.update({
            where: {
                id,
                organizationId: orgId,
            },
            data: {
                releaseId,
                releaseURL,
            },
        });
    }
    async changeState(id, state, err, body) {
        const update = await this._post.model.post.update({
            where: {
                id,
            },
            data: {
                state,
                ...(err
                    ? { error: typeof err === 'string' ? err : JSON.stringify(err) }
                    : {}),
            },
            include: {
                integration: {
                    select: {
                        providerIdentifier: true,
                    },
                },
            },
        });
        if (state === 'ERROR' && err && body) {
            try {
                await this._errors.model.errors.create({
                    data: {
                        message: typeof err === 'string' ? err : JSON.stringify(err),
                        organizationId: update.organizationId,
                        platform: update.integration.providerIdentifier,
                        postId: update.id,
                        body: typeof body === 'string' ? body : JSON.stringify(body),
                    },
                });
            }
            catch (err) { }
        }
        return update;
    }
    getErrorsByPostIds(postIds) {
        return this._errors.model.errors.findMany({
            where: {
                postId: { in: postIds },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async changeDate(orgId, id, date, isDraft, action = 'schedule') {
        return this._post.model.post.update({
            where: {
                organizationId: orgId,
                id,
            },
            data: {
                publishDate: (0, dayjs_1.default)(date).toDate(),
                ...(action === 'schedule'
                    ? {
                        state: isDraft ? 'DRAFT' : 'QUEUE',
                        releaseId: null,
                        releaseURL: null,
                    }
                    : {}),
            },
        });
    }
    countPostsFromDay(orgId, date) {
        return this._post.model.post.count({
            where: {
                organizationId: orgId,
                publishDate: {
                    gte: date,
                },
                OR: [
                    {
                        deletedAt: null,
                        state: {
                            in: ['QUEUE'],
                        },
                    },
                    {
                        state: 'PUBLISHED',
                    },
                ],
            },
        });
    }
    countPostsOfOtherOrganizations(orgId, ids) {
        return this._post.model.post.count({
            where: {
                organizationId: {
                    not: orgId,
                },
                id: {
                    in: ids,
                },
            },
        });
    }
    async createOrUpdatePost(state, orgId, date, body, tags, creationMethod, inter, keepGroup = false, batchId) {
        const posts = [];
        const uuid = (0, uuid_1.v4)();
        const group = keepGroup && body.group ? body.group : uuid;
        const ids = body.value.map((value) => value.id).filter(Boolean);
        const existingBatchId = body.group || ids.length
            ? (await this._post.model.post.findFirst({
                where: {
                    organizationId: orgId,
                    deletedAt: null,
                    batchId: {
                        not: null,
                    },
                    OR: [
                        ...(body.group ? [{ group: body.group }] : []),
                        ...(ids.length ? [{ id: { in: ids } }] : []),
                    ],
                },
                select: {
                    batchId: true,
                },
            }))?.batchId
            : undefined;
        for (const value of body.value) {
            const updateData = (type) => ({
                publishDate: (0, dayjs_1.default)(date).toDate(),
                integration: {
                    connect: {
                        id: body.integration.id,
                        organizationId: orgId,
                    },
                },
                ...(posts?.[posts.length - 1]?.id
                    ? {
                        parentPost: {
                            connect: {
                                id: posts[posts.length - 1]?.id,
                            },
                        },
                    }
                    : type === 'update'
                        ? {
                            parentPost: {
                                disconnect: true,
                            },
                        }
                        : {}),
                content: value.content,
                delay: value.delay || 0,
                group,
                batchId: existingBatchId || batchId,
                intervalInDays: inter ? +inter : null,
                approvedSubmitForOrder: client_1.APPROVED_SUBMIT_FOR_ORDER.NO,
                ...(type === 'create' ? { creationMethod } : {}),
                ...(state === 'update'
                    ? {}
                    : {
                        state: state === 'draft' ? 'DRAFT' : 'QUEUE',
                    }),
                image: JSON.stringify(value.image),
                settings: JSON.stringify(body.settings),
                organization: {
                    connect: {
                        id: orgId,
                    },
                },
            });
            posts.push(await this._post.model.post.upsert({
                where: {
                    id: value.id || (0, uuid_1.v4)(),
                },
                create: { ...updateData('create') },
                update: {
                    ...updateData('update'),
                    lastMessage: {
                        disconnect: true,
                    },
                    submittedForOrder: {
                        disconnect: true,
                    },
                },
            }));
            if (posts.length === 1) {
                await this._tagsPosts.model.tagsPosts.deleteMany({
                    where: {
                        post: {
                            id: posts[0].id,
                        },
                    },
                });
                if (tags.length) {
                    const tagsList = await this._tags.model.tags.findMany({
                        where: {
                            orgId: orgId,
                            deletedAt: null,
                            name: {
                                in: tags.map((tag) => tag.label).filter((f) => f),
                            },
                        },
                    });
                    if (tagsList.length) {
                        await this._post.model.post.update({
                            where: {
                                id: posts[posts.length - 1].id,
                            },
                            data: {
                                tags: {
                                    createMany: {
                                        data: tagsList.map((tag) => ({
                                            tagId: tag.id,
                                        })),
                                    },
                                },
                            },
                        });
                    }
                }
            }
        }
        const previousPost = body.group
            ? (await this._post.model.post.findFirst({
                where: {
                    organizationId: orgId,
                    group: body.group,
                    deletedAt: null,
                    parentPostId: null,
                },
                select: {
                    id: true,
                },
            }))?.id
            : undefined;
        if (body.group && !keepGroup) {
            await this._post.model.post.updateMany({
                where: {
                    organizationId: orgId,
                    group: body.group,
                    deletedAt: null,
                },
                data: {
                    parentPostId: null,
                    deletedAt: new Date(),
                },
            });
        }
        if (body.group && keepGroup) {
            await this._post.model.post.updateMany({
                where: {
                    organizationId: orgId,
                    group: body.group,
                    deletedAt: null,
                    id: {
                        notIn: posts.map((p) => p.id),
                    },
                },
                data: {
                    parentPostId: null,
                    deletedAt: new Date(),
                },
            });
        }
        return { previousPost, posts };
    }
    async submit(id, order, buyerOrganizationId) {
        return this._post.model.post.update({
            where: {
                id,
            },
            data: {
                submittedForOrderId: order,
                approvedSubmitForOrder: 'WAITING_CONFIRMATION',
                submittedForOrganizationId: buyerOrganizationId,
            },
            select: {
                id: true,
                description: true,
                submittedForOrder: {
                    select: {
                        messageGroupId: true,
                    },
                },
            },
        });
    }
    updateMessage(id, messageId) {
        return this._post.model.post.update({
            where: {
                id,
            },
            data: {
                lastMessageId: messageId,
            },
        });
    }
    async getPostById(id, org) {
        const post = await this._post.model.post.findUnique({
            where: {
                id,
                ...(org ? { organizationId: org } : {}),
            },
            include: {
                integration: true,
                submittedForOrder: {
                    include: {
                        posts: {
                            where: {
                                state: 'PUBLISHED',
                            },
                        },
                        ordersItems: true,
                        seller: {
                            select: {
                                id: true,
                                account: true,
                            },
                        },
                    },
                },
            },
        });
        return this.decryptIntegration(post);
    }
    get postTimelineSelect() {
        return {
            id: true,
            state: true,
            publishDate: true,
            createdAt: true,
            updatedAt: true,
            deletedAt: true,
            releaseId: true,
            releaseURL: true,
            error: true,
            creationMethod: true,
            group: true,
            parentPostId: true,
        };
    }
    getPostTimeline(id, org) {
        return this._post.model.post.findFirst({
            where: {
                id,
                organizationId: org,
            },
            select: {
                ...this.postTimelineSelect,
                integration: {
                    select: {
                        id: true,
                        name: true,
                        providerIdentifier: true,
                        disabled: true,
                        refreshNeeded: true,
                        deletedAt: true,
                    },
                },
                childrenPost: {
                    select: this.postTimelineSelect,
                    orderBy: { publishDate: 'asc' },
                },
                errors: {
                    select: {
                        id: true,
                        platform: true,
                        message: true,
                        body: true,
                        createdAt: true,
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
    }
    findAllExistingCategories() {
        return this._popularPosts.model.popularPosts.findMany({
            select: {
                category: true,
            },
            distinct: ['category'],
        });
    }
    findAllExistingTopicsOfCategory(category) {
        return this._popularPosts.model.popularPosts.findMany({
            where: {
                category,
            },
            select: {
                topic: true,
            },
            distinct: ['topic'],
        });
    }
    findPopularPosts(category, topic) {
        return this._popularPosts.model.popularPosts.findMany({
            where: {
                category,
                ...(topic ? { topic } : {}),
            },
            select: {
                content: true,
                hook: true,
            },
        });
    }
    createPopularPosts(post) {
        return this._popularPosts.model.popularPosts.create({
            data: {
                category: 'category',
                topic: 'topic',
                content: 'content',
                hook: 'hook',
            },
        });
    }
    async getPostsCountsByDates(orgId, times, date) {
        const dates = await this._post.model.post.findMany({
            where: {
                deletedAt: null,
                organizationId: orgId,
                publishDate: {
                    in: times.map((time) => {
                        return date.clone().add(time, 'minutes').toDate();
                    }),
                },
            },
        });
        return times.filter((time) => date.clone().add(time, 'minutes').isAfter(dayjs_1.default.utc()) &&
            !dates.find((dateFind) => {
                return (dayjs_1.default
                    .utc(dateFind.publishDate)
                    .diff(date.clone().startOf('day'), 'minutes') == time);
            }));
    }
    getCommentsForPosts(postIds) {
        return this._comments.model.comments.findMany({
            where: {
                postId: {
                    in: postIds,
                },
                deletedAt: null,
            },
            include: {
                user: {
                    select: {
                        name: true,
                        lastName: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
    }
    getCommentById(id) {
        return this._comments.model.comments.findFirst({
            where: {
                id,
                deletedAt: null,
            },
            include: {
                post: {
                    select: {
                        id: true,
                        organizationId: true,
                    },
                },
            },
        });
    }
    setCommentResolved(id, resolvedAt) {
        return this._comments.model.comments.update({
            where: {
                id,
            },
            data: {
                resolvedAt,
            },
        });
    }
    getAnchoredCommentsForPost(postId) {
        return this._comments.model.comments.findMany({
            where: {
                postId,
                deletedAt: null,
                anchorStart: {
                    not: null,
                },
            },
        });
    }
    detachAnchorsForPost(postId, ids) {
        return this._comments.model.comments.updateMany({
            where: {
                postId,
                id: {
                    in: ids,
                },
            },
            data: {
                anchorStart: null,
                anchorEnd: null,
            },
        });
    }
    async getTags(orgId) {
        return this._tags.model.tags.findMany({
            where: {
                orgId,
                deletedAt: null,
            },
        });
    }
    createTag(orgId, body) {
        return this._tags.model.tags.create({
            data: {
                orgId,
                name: body.name,
                color: body.color,
            },
        });
    }
    editTag(id, orgId, body) {
        return this._tags.model.tags.update({
            where: {
                id,
            },
            data: {
                name: body.name,
                color: body.color,
            },
        });
    }
    async deleteTag(id, orgId) {
        const tag = await this._tags.model.tags.update({
            where: {
                id,
                orgId,
            },
            data: {
                deletedAt: new Date(),
            },
        });
        await this._tagsPosts.model.tagsPosts.deleteMany({
            where: {
                tagId: tag.id,
            },
        });
        return tag;
    }
    createComment(orgId, userId, postId, content, extra = {}) {
        return this._comments.model.comments.create({
            data: {
                organizationId: orgId,
                userId,
                postId,
                content,
                displayName: extra.displayName ?? null,
                parentId: extra.parentId ?? null,
                anchorStart: extra.anchorStart ?? null,
                anchorEnd: extra.anchorEnd ?? null,
                anchorQuote: extra.anchorQuote ?? null,
            },
        });
    }
    async getPostByForWebhookId(postId, integrationId) {
        const select = {
            id: true,
            content: true,
            publishDate: true,
            releaseURL: true,
            state: true,
            integration: {
                select: {
                    id: true,
                    name: true,
                    providerIdentifier: true,
                    picture: true,
                    type: true,
                },
            },
        };
        const posts = await this._post.model.post.findMany({
            where: {
                id: postId,
                deletedAt: null,
                parentPostId: null,
            },
            select,
        });
        if (posts.length) {
            return posts;
        }
        return this._post.model.post.findMany({
            where: {
                releaseId: postId,
                integrationId,
                deletedAt: null,
                parentPostId: null,
            },
            orderBy: {
                updatedAt: 'desc',
            },
            take: 1,
            select,
        });
    }
    async getPostsSince(orgId, since) {
        return this._post.model.post.findMany({
            where: {
                organizationId: orgId,
                publishDate: {
                    gte: new Date(since),
                },
                deletedAt: null,
                parentPostId: null,
            },
            select: {
                id: true,
                content: true,
                publishDate: true,
                releaseURL: true,
                state: true,
                integration: {
                    select: {
                        id: true,
                        name: true,
                        providerIdentifier: true,
                        picture: true,
                        type: true,
                    },
                },
            },
        });
    }
};
exports.PostsRepository = PostsRepository;
exports.PostsRepository = PostsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaRepository,
        prisma_service_1.PrismaRepository,
        prisma_service_1.PrismaRepository,
        prisma_service_1.PrismaRepository,
        prisma_service_1.PrismaRepository,
        prisma_service_1.PrismaRepository,
        encryption_service_1.EncryptionService])
], PostsRepository);
//# sourceMappingURL=posts.repository.js.map