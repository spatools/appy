/// <reference path="../_definitions.d.ts" />
define(["require", "exports"], function (require, exports) {
    var doc = document, head = doc.head, interval = 10, timeout = 150000, cssRules, sheet;
    function unsafe(callback) {
        if (typeof MSApp === "undefined") {
            return callback.call(null);
        }
        else {
            return MSApp.execUnsafeLocalFunction(callback);
        }
    }
    /** Load script document by url */
    function loadScript(url) {
        return unsafe(function () {
            return new Promise(function (resolve, reject) {
                var script = doc.createElement("script");
                script.async = true;
                script.src = url;
                script.onload = function (e) { return resolve(url); };
                script.onerror = function (e) { return reject(e); };
                head.appendChild(script);
            });
        });
    }
    exports.loadScript = loadScript;
    /** Load specified style into current page */
    function loadStyle(css) {
        return new Promise(function (resolve, reject) {
            var style = doc.createElement("style");
            style.type = "text/css";
            try {
                if (style.styleSheet) {
                    style.styleSheet.cssText = css;
                }
                else {
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
    exports.loadStyle = loadStyle;
    /** Load specified stylesheet by url */
    function loadStylesheet(url) {
        return unsafe(function () {
            var link, timeoutId, intervalId, cleaner = function (val) {
                clearTimeout(timeoutId);
                clearInterval(intervalId);
                if ("onload" in link)
                    link.onload = null;
                if ("onreadystatechange" in link)
                    link.onreadystatechange = null;
                return val;
            };
            return new Promise(function (resolve, reject) {
                link = doc.createElement("link");
                link.rel = "stylesheet";
                link.type = "text/css";
                link.media = "all";
                link.href = url;
                timeoutId = setTimeout(function () { reject(new Error("timeout")); }, timeout);
                intervalId = setInterval(function () { checkStyleSheetLoaded(url, link, resolve); }, interval);
                if (!sheet) {
                    cssRules = "cssRules";
                    sheet = "sheet";
                    if (!(sheet in link)) {
                        cssRules = "rules";
                        sheet = "styleSheet";
                    }
                }
                if ("onload" in link)
                    link.onload = function () { return resolve(url); };
                if ("onerror" in link)
                    link.onerror = function (e) { return reject(e); };
                if ("onreadystatechange" in link)
                    link.onreadystatechange = function (e) { if (link.readyState === "complete" || link.readyState === "loaded")
                        return link[sheet][cssRules].length ? resolve(url) : reject(link.readyState); };
                head.appendChild(link);
            }).then(cleaner, cleaner);
        });
    }
    exports.loadStylesheet = loadStylesheet;
    function checkStyleSheetLoaded(url, element, resolve) {
        try {
            element && element[sheet] && element[sheet][cssRules].length && resolve(url);
        }
        catch (e) {
            return false;
        }
    }
});
