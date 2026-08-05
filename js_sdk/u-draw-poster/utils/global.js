var _a;
function detectPlatform() {
    if (typeof process !== 'undefined' && (_a = process === null || process === void 0 ? void 0 : process.env) !== null && _a !== void 0 && _a.VUE_APP_PLATFORM) {
        return process.env.VUE_APP_PLATFORM;
    }
    if (typeof wx !== 'undefined' && typeof wx.getSystemInfoSync === 'function') {
        return 'mp-weixin';
    }
    if (typeof uni !== 'undefined' && typeof uni.getSystemInfoSync === 'function') {
        const info = uni.getSystemInfoSync();
        if (info && info.uniPlatform === 'mp-weixin') {
            return 'mp-weixin';
        }
    }
    return undefined;
}
export const PLATFORM = detectPlatform();
/** 全局对象 */
const _uni = (function () {
    if (typeof uni != "undefined")
        return uni;
    if (typeof wx != "undefined")
        return wx;
    return uni;
})();
export default _uni;
