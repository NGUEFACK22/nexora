"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasLinks = hasLinks;
exports.stripLinks = stripLinks;
const schemeUrl = /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
const bareDomainTlds = 'online|store|cloud|social|world|blog|shop|site|tech|news|live|link|info|app|dev|xyz|com|net|org|edu|gov|biz|io|co|ai|me|tv|cc|ly|gl|sh|fm|am|be|to|gg|so|is|us|uk|ca|au|de|fr|es|it|nl|se|no|dk|fi|pl|ch|at|ie|nz|za|in|jp|br|mx|ru|eu';
const bareDomain = new RegExp(`(?<![\\w@./-])(?:[a-zA-Z0-9-]+\\.)+(?:${bareDomainTlds})\\b(?:\\/[-a-zA-Z0-9()@:%_+.~#?&/=]*)?`);
const urlRegex = () => new RegExp(`(?:${schemeUrl.source})|(?:${bareDomain.source})`, 'gmi');
function hasLinks(text) {
    return !!(text || '').match(urlRegex());
}
function stripLinks(text) {
    return (text || '')
        .replace(urlRegex(), '')
        .replace(/<a\b[^>]*>\s*<\/a>/gi, '')
        .replace(/[ \t]{2,}/g, ' ')
        .replace(/ +\n/g, '\n')
        .trim();
}
//# sourceMappingURL=strip.links.js.map