"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtractContentService = void 0;
const common_1 = require("@nestjs/common");
const jsdom_1 = require("jsdom");
function findDepth(element) {
    let depth = 0;
    let elementer = element;
    while (elementer.parentNode) {
        depth++;
        elementer = elementer.parentNode;
    }
    return depth;
}
let ExtractContentService = class ExtractContentService {
    async extractContent(url) {
        const load = await (await fetch(url)).text();
        const dom = new jsdom_1.JSDOM(load);
        const allTitles = Array.from(dom.window.document.querySelectorAll('*'))
            .filter((f) => {
            return (f.querySelector('h1') ||
                f.querySelector('h2') ||
                f.querySelector('h3') ||
                f.querySelector('h4') ||
                f.querySelector('h5') ||
                f.querySelector('h6'));
        })
            .reverse();
        const findTheOneWithMostTitles = allTitles.reduce((all, current) => {
            const depth = findDepth(current);
            const calculate = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].reduce((total, tag) => {
                if (current.querySelector(tag)) {
                    return total + 1;
                }
                return total;
            }, 0);
            if (calculate > all.total) {
                return { total: calculate, depth, element: current };
            }
            if (depth > all.depth) {
                return { total: calculate, depth, element: current };
            }
            return all;
        }, { total: 0, depth: 0, element: null });
        return findTheOneWithMostTitles?.element?.textContent
            ?.replace(/\n/g, ' ')
            .replace(/ {2,}/g, ' ');
    }
};
exports.ExtractContentService = ExtractContentService;
exports.ExtractContentService = ExtractContentService = __decorate([
    (0, common_1.Injectable)()
], ExtractContentService);
//# sourceMappingURL=extract.content.service.js.map