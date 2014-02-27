/// <reference path="../_definitions.d.ts" />

import Promise = require("promise");

var doc = document, head = doc.head,
    interval = 10, timeout = 150000,
    cssRules, sheet;

function unsafe<T>(callback: () => T): T {
    if (typeof MSApp === "undefined") {
        return callback.call(null);
    } else {
        return MSApp.execUnsafeLocalFunction(callback);
    }
}

/** Load script document by url */
export function loadScript(url: string): Promise<string> {
    return unsafe(() => {
        return new Promise<string>((resolve, reject) => {
            var script = doc.createElement("script");
            script.async = true;
            script.src = url;

            script.onload = (e) => resolve(url);
            script.onerror = (e) => reject(e);

            head.appendChild(script);
        });
    });
}

/** Load specified style into current page */
export function loadStyle(css: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        var style = doc.createElement("style");
        style.type = "text/css";

        try {
            if (style.styleSheet) {   // IE
                style.styleSheet.cssText = css;
            } else {                // the world
                style.appendChild(doc.createTextNode(css));
            }

            setTimeout(function () {
                head.appendChild(style);
                resolve(undefined);
            }, 1);
        }
        catch (e) {
            reject(e);
        }
    });
}

/** Load specified stylesheet by url */
export function loadStylesheet(url: string): Promise<string> {
    return unsafe(() => {
        var link, timeoutId, intervalId,
            cleaner = (val) => {
                clearTimeout(timeoutId);
                clearInterval(intervalId);
                if ("onload" in link) link.onload = null;
                if ("onreadystatechange" in link) link.onreadystatechange = null;

                return val;
            };

        return new Promise<string>((resolve, reject) => {
            link = doc.createElement("link");
            link.rel = "stylesheet";
            link.type = "text/css";
            link.media = "all";
            link.href = url;

            timeoutId = setTimeout(() => { reject(new Error("timeout")); }, timeout);
            intervalId = setInterval(() => { checkStyleSheetLoaded(url, link, resolve); }, interval);

            if (!sheet) { // only assign these once
                cssRules = "cssRules"; sheet = "sheet";
                if (!(sheet in link)) { // MSIE uses non-standard property names
                    cssRules = "rules"; sheet = "styleSheet";
                }
            }

            if ("onload" in link) link.onload = () => resolve(url);
            if ("onerror" in link) link.onerror = (e) => reject(e);
            if ("onreadystatechange" in link) link.onreadystatechange = (e) => { if (link.readyState === "complete" || link.readyState === "loaded") return link[sheet][cssRules].length ? resolve(url) : reject(link.readyState); };

            head.appendChild(link);
        }).then(cleaner, cleaner);
    });
}

function checkStyleSheetLoaded(url: string, element: HTMLLinkElement, resolve: PromiseResolveFunction<string>) {
    try { element && element[sheet] && element[sheet][cssRules].length && resolve(url); }
    catch (e) { return false; }
}
