define(["require", "exports", "jquery", "promise/extensions", "./loader", "./base64", "./store"], function(require, exports, $, promiseExt, loader, base64, store) {
    var cacheKeyPrefix = "__APPY_CACHE__", promises = {}, doc = document, head = doc.head;

    function reset() {
        return store.length().then(function (length) {
            return promiseExt.forEach(new Array(length), function (val, index) {
                return store.key(index).then(function (key) {
                    return store.removeItem(key);
                });
            });
        });
    }
    exports.reset = reset;

    function load(key, url, mime, encode, force) {
        if (typeof mime === "undefined") { mime = "text/plain"; }
        if (typeof encode === "undefined") { encode = false; }
        if (typeof force === "undefined") { force = false; }
        return cache(key, url, mime, encode, force);
    }
    exports.load = load;

    function loadScript(key, url, force) {
        if (typeof force === "undefined") { force = false; }
        return cache(key, url, "application/x-javascript", true, force).then(function (entry) {
            return loader.loadScript(base64.createDataURL("application/x-javascript", entry.content));
        });
    }
    exports.loadScript = loadScript;

    function loadStyle(key, url, force) {
        if (typeof force === "undefined") { force = false; }
        return cache(key, url, "text/css", false, force).then(function (entry) {
            return loader.loadStyle(entry.content);
        });
    }
    exports.loadStyle = loadStyle;

    function loadStylesheet(key, url, force) {
        if (typeof force === "undefined") { force = false; }
        return cache(key, url, "text/css", true, force).then(function (entry) {
            return loader.loadStylesheet(base64.createDataURL("text/css", entry.content));
        });
    }
    exports.loadStylesheet = loadStylesheet;

    function loadHTML(key, url, force) {
        if (typeof force === "undefined") { force = false; }
        return cache(key, url, "text/html", false, force).then(function (entry) {
            return entry.content;
        });
    }
    exports.loadHTML = loadHTML;

    function loadJSON(key, url, force) {
        if (typeof force === "undefined") { force = false; }
        return cache(key, url, "text/json", false, force).then(function (entry) {
            return JSON.parse(entry.content);
        });
    }
    exports.loadJSON = loadJSON;

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

        return Promise.cast($.ajax(opts)).then(function (content) {
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

            return saveCache(key, cache).then(function () {
                return cache;
            });
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
