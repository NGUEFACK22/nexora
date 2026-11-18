"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTemporalModule = void 0;
const nestjs_temporal_core_1 = require("nestjs-temporal-core");
const integration_manager_1 = require("../integrations/integration.manager");
const email_queues_1 = require("./email.queues");
const getTemporalModule = (isWorkers, path, activityClasses) => {
    const excludeQueues = (process.env.EXCLUDE_QUEUE || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    const divider = Math.max(1, Number(process.env.WORKER_CONCURRENCY_DIVIDER) || 1);
    return nestjs_temporal_core_1.TemporalModule.register({
        isGlobal: true,
        connection: {
            address: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
            ...(process.env.TEMPORAL_TLS === 'true' ? { tls: true } : {}),
            ...(process.env.TEMPORAL_API_KEY
                ? { apiKey: process.env.TEMPORAL_API_KEY }
                : {}),
            namespace: process.env.TEMPORAL_NAMESPACE || 'default',
        },
        taskQueue: 'main',
        logLevel: 'error',
        ...(isWorkers
            ? {
                workers: [
                    ...[
                        { identifier: 'main', maxConcurrentJob: undefined },
                        ...integration_manager_1.socialIntegrationList,
                    ]
                        .filter((f) => f.identifier.indexOf('-') === -1)
                        .map((integration) => ({
                        integration,
                        taskQueue: integration.identifier.split('-')[0],
                    }))
                        .filter(({ taskQueue }) => !excludeQueues.includes(taskQueue))
                        .map(({ integration, taskQueue }) => {
                        const concurrency = integration.maxConcurrentJob
                            ? Math.max(1, Math.floor(integration.maxConcurrentJob / divider))
                            : undefined;
                        return {
                            taskQueue,
                            ...(taskQueue === 'main' ? { workflowsPath: path } : {}),
                            activityClasses: activityClasses,
                            autoStart: true,
                            workerOptions: {
                                maxConcurrentActivityTaskExecutions: concurrency || 1000000,
                                maxHeartbeatThrottleInterval: '15s',
                            },
                        };
                    }),
                    ...Object.values(email_queues_1.emailQueues)
                        .filter(({ taskQueue }) => !excludeQueues.includes(taskQueue))
                        .map(({ taskQueue, perSecond }) => ({
                        taskQueue,
                        activityClasses: activityClasses,
                        autoStart: true,
                        workerOptions: {
                            maxConcurrentActivityTaskExecutions: 10,
                            maxTaskQueueActivitiesPerSecond: perSecond,
                        },
                    })),
                ],
            }
            : {}),
    });
};
exports.getTemporalModule = getTemporalModule;
//# sourceMappingURL=temporal.module.js.map