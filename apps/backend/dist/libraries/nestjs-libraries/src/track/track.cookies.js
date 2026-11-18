"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyTrackCookies = void 0;
const crypto_1 = require("crypto");
const make_is_1 = require("@gitroom/nestjs-libraries/services/make.is");
const subdomain_management_1 = require("@gitroom/helpers/subdomain/subdomain.management");
const DAY = 1000 * 60 * 60 * 24;
const cookieOptions = (expiresInDays, httpOnly) => ({
    domain: (0, subdomain_management_1.getCookieUrlFromDomain)(process.env.FRONTEND_URL),
    ...(!process.env.NOT_SECURED
        ? {
            secure: true,
            httpOnly,
            sameSite: 'none',
        }
        : {}),
    expires: new Date(Date.now() + DAY * expiresInDays),
});
const applyTrackCookies = (req, res, fbclid) => {
    const uniqueId = req?.cookies?.track || (0, make_is_1.makeId)(10);
    if (!req?.cookies?.track) {
        res.cookie('track', uniqueId, cookieOptions(365, true));
    }
    const currentFbc = req?.cookies?._fbc;
    const isNewClick = !!fbclid && !currentFbc?.endsWith(`.${fbclid}`);
    const fbc = isNewClick
        ? `fb.1.${Date.now()}.${fbclid}`
        :
            currentFbc || req?.cookies?.fbclid;
    if (isNewClick) {
        res.cookie('_fbc', fbc, cookieOptions(90, false));
    }
    const fbp = req?.cookies?._fbp || `fb.1.${Date.now()}.${(0, crypto_1.randomInt)(2 ** 31)}`;
    if (!req?.cookies?._fbp) {
        res.cookie('_fbp', fbp, cookieOptions(90, false));
    }
    return { uniqueId, fbc, fbp };
};
exports.applyTrackCookies = applyTrackCookies;
//# sourceMappingURL=track.cookies.js.map