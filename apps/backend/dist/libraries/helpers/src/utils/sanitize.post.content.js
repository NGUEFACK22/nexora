"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postContentPlainText = exports.sanitizePostContent = void 0;
const isomorphic_dompurify_1 = __importDefault(require("isomorphic-dompurify"));
const parse5_1 = require("parse5");
const ALLOWED_TAGS = [
    'p',
    'br',
    'strong',
    'u',
    'a',
    'ul',
    'li',
    'h1',
    'h2',
    'h3',
    'span',
    'img',
];
const ALLOWED_ATTR = [
    'dir',
    'href',
    'target',
    'rel',
    'class',
    'data-mention-id',
    'data-mention-label',
    'src',
    'alt',
];
isomorphic_dompurify_1.default.addHook('uponSanitizeElement', (node, data) => {
    if (data.tagName === 'img' &&
        !/^https?:\/\//i.test(node.getAttribute('src') || '')) {
        node.parentNode?.removeChild(node);
    }
});
const sanitizePostContent = (value) => {
    if (typeof value !== 'string' || !value) {
        return '';
    }
    const paragraphs = value.replace(/<(\/?)(div|section|article|blockquote|pre|h[4-6])\b[^<>]*>/gi, '<$1p>');
    return isomorphic_dompurify_1.default.sanitize(paragraphs, {
        ALLOWED_TAGS,
        ALLOWED_ATTR,
        ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|\/|#)/i,
    });
};
exports.sanitizePostContent = sanitizePostContent;
const postContentPlainText = (value) => {
    const walk = (nodes) => nodes
        .map((node) => node.nodeName === '#text' ? node.value : walk(node.childNodes || []))
        .join('');
    return walk((0, parse5_1.parseFragment)((0, exports.sanitizePostContent)(value)).childNodes);
};
exports.postContentPlainText = postContentPlainText;
//# sourceMappingURL=sanitize.post.content.js.map