/// <reference path="../_definitions.d.ts" />
define(["require", "exports", "jquery", "promise/extensions", "./loader", "./base64", "./store"], function (require, exports, $, promiseExt, loader, base64, store) {
    var cacheKeyPrefix = "__APPY_CACHE__", promises = {}, doc = document, head = doc.head;
    //#region Public Methods
    /** Reset entire cache resources */
    function reset() {
        return store.length().then(function (length) {
            return promiseExt.forEach(new Array(length), function (val, index) {
                return store.key(index).then(function (key) { return store.removeItem(key); });
            });
        });
    }
    exports.reset = reset;
    /** Load a resource in cache */
    function load(key, url, mime, encode, force) {
        if (mime === void 0) { mime = "text/plain"; }
        if (encode === void 0) { encode = false; }
        if (force === void 0) { force = false; }
        return cache(key, url, mime, encode, force);
    }
    exports.load = load;
    /** Load a script in cache */
    function loadScript(key, url, force) {
        if (force === void 0) { force = false; }
        return cache(key, url, "application/x-javascript", true, force).then(function (entry) { return loader.loadScript(base64.createDataURL("application/x-javascript", entry.content)); });
    }
    exports.loadScript = loadScript;
    /** Load a style in cache */
    function loadStyle(key, url, force) {
        if (force === void 0) { force = false; }
        return cache(key, url, "text/css", false, force).then(function (entry) { return loader.loadStyle(entry.content); });
    }
    exports.loadStyle = loadStyle;
    /** Load a style sheet in cache */
    function loadStylesheet(key, url, force) {
        if (force === void 0) { force = false; }
        return cache(key, url, "text/css", true, force).then(function (entry) { return loader.loadStylesheet(base64.createDataURL("text/css", entry.content)); });
    }
    exports.loadStylesheet = loadStylesheet;
    /** Load an HTML fragment in cache */
    function loadHTML(key, url, force) {
        if (force === void 0) { force = false; }
        return cache(key, url, "text/html", false, force).then(function (entry) { return entry.content; });
    }
    exports.loadHTML = loadHTML;
    /** Load an JSON result in cache */
    function loadJSON(key, url, force) {
        if (force === void 0) { force = false; }
        return cache(key, url, "text/json", false, force).then(function (entry) { return JSON.parse(entry.content); });
    }
    exports.loadJSON = loadJSON;
    //#endregion
    //#region Private Methods
    function cache(key, url, mime, encode, force) {
        if (!promises[key]) {
            var cleaner = function () {
                delete promises[key];
            }, promise = loadCache(key).then(function (result) {
                if (result && !force) {
                    return Promise.resolve(result);
                }
                return downloadAndEncode(key, url, mime, encode, result);
            });
            promise.then(cleaner, cleaner);
            promises[key] = promise;
        }
        return promises[key];
    }
    function downloadAndEncode(key, url, mime, encode, cache) {
        var opts = { url: url, dataType: "text" };
        if (cache)
            opts.data = { date: cache.date };
        return Promise.resolve($.ajax(opts)).then(function (content) {
            if (!content && cache) {
                return Promise.resolve(cache);
            }
            cache = {
                key: key,
                mime: mime,
                url: url,
                content: encode ? base64.encode(content) : content,
                date: new Date().toJSON()
            };
            return saveCache(key, cache).then(function () { return cache; });
        });
    }
    function loadCache(key) {
        return store.getItem(cacheKeyPrefix + key).then(function (result) {
            return JSON.parse(result);
        });
    }
    function saveCache(key, content) {
        return store.setItem(cacheKeyPrefix + key, JSON.stringify(content));
    }
});
//#endregion
