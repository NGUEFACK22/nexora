"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardFunction = DashboardFunction;
require("reflect-metadata");
function DashboardFunction() {
    return function (target, propertyKey) {
        Reflect.defineMetadata('custom:dashboard_function', true, target, propertyKey);
    };
}
//# sourceMappingURL=dashboard.function.decorator.js.map