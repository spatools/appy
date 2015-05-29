/// <reference path="../_definitions.d.ts" />

import $ = require("jquery");
import loader = require("./loader");
import base64 = require("./base64");
import store = require("./store");

var cacheKeyPrefix: string = "__APPY_CACHE__",
    promises: { [key: string]: Promise<CacheResult> } = {},
    doc = document, head = doc.head;

export interface CacheResult {
    key: string;
    mime: string;
    url: string;
    content: string;
    date: string;
}

//#region Public Methods

/** Reset entire cache resources */
export function reset(): Promise<any> {
    return store.length().then(length => {
        var promises = [],
            i = 0;

        for (; i < length; i++) {
            promises.push(store.key(i).then(removeIfInCache));
        }

        return Promise.all(promises);
    });
}

/** Load a resource in cache */
export function load(key: string, url: string, mime: string = "text/plain", encode: boolean = false, force: boolean = false): Promise<CacheResult> {
    return cache(key, url, mime, encode, force);
}

/** Load a script in cache */
export function loadScript(key: string, url: string, force: boolean = false): Promise<any> {
    return cache(key, url, "application/x-javascript", true, force)
        .then(entry => loader.loadScript(base64.createDataURL("application/x-javascript", entry.content)));
}

/** Load a style in cache */
export function loadStyle(key: string, url: string, force: boolean = false): Promise<void> {
    return cache(key, url, "text/css", false, force)
        .then(entry => loader.loadStyle(entry.content));
}

/** Load a style sheet in cache */
export function loadStylesheet(key: string, url: string, force: boolean = false): Promise<string> {
    return cache(key, url, "text/css", true, force)
        .then(entry => loader.loadStylesheet(base64.createDataURL("text/css", entry.content)));
}

/** Load an HTML fragment in cache */
export function loadHTML(key: string, url: string, force: boolean = false): Promise<string> {
    return cache(key, url, "text/html", false, force)
        .then(entry => entry.content);
}

/** Load an JSON result in cache */
export function loadJSON<T>(key: string, url: string, force: boolean = false): Promise<T> {
    return cache(key, url, "text/json", false, force)
        .then<T>(entry => JSON.parse(entry.content));
}

//#endregion

//#region Private Methods

function cache(key: string, url: string, mime: string, encode?: boolean, force?: boolean): Promise<CacheResult> {
    if (!promises[key]) {
        var cleaner = () => { delete promises[key]; },
            promise = loadCache(key).then(result => {
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

function downloadAndEncode(key: string, url: string, mime: string, encode?: boolean, cache?: CacheResult): Promise<CacheResult> {
    var opts: JQueryAjaxSettings = { url: url, dataType: "text" };
    if (cache)
        opts.data = { date: cache.date };

    return Promise.resolve<string>($.ajax(opts)).then(content => {
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

        return saveCache(key, cache).then(() => cache);
    });
}

function loadCache(key: string): Promise<CacheResult> {
    return store.getItem(cacheKeyPrefix + key).then(function (result) { return JSON.parse(result); });
}

function saveCache(key: string, content: CacheResult): Promise<void> {
    return store.setItem(cacheKeyPrefix + key, JSON.stringify(content));
}

function removeIfInCache(key: string): Promise<void> {
    if (key.indexOf(cacheKeyPrefix) === 0) {
        return store.removeItem(key);
    }

    return Promise.resolve<void>();
}

//#endregion
