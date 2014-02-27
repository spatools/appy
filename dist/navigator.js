define(["require", "exports"], function(require, exports) {
    var app, appVersion, system, engine, engineVersion, os, sub, subVersion, name, version, versionNumber, webkit, prefix, mobile, ua = navigator.userAgent;

    var reg = /(\w+)\/([0-9.]+) \(([^)]+)\)( (\w+)\/([0-9.+rca]+) \(([^)]+)\))?( ([a-zA-Z ]+)\/([0-9.+rca]+))?( ([a-zA-Z ]+)\/([0-9.+a-zA-Z]+))?( ([a-zA-Z ]+)\/([0-9.+rca]+))?/;
    if (reg.test(ua)) {
        var matches = ua.match(reg);

        app = matches[1];
        appVersion = matches[2];
        system = matches[3];
        engine = matches[5];
        engineVersion = matches[6];

        if (matches[8]) {
            name = matches[9];
            version = matches[10];
        }

        if (matches[11]) {
            if (name === "Version" || matches[12] === "Firefox") {
                if (matches[14]) {
                    name = matches[15];
                    version = matches[16];
                } else {
                    name = matches[12];
                    version = matches[13];
                }

                sub = matches[9];
                subVersion = matches[10];
            } else {
                sub = matches[12];
                subVersion = matches[13];
            }
        }

        if (!name) {
            var regIe = /MSIE ([0-9.]+)/, regIE11 = /rv:([0-9.]+)\)\s+like\s+Gecko/, regEng = /Trident\/([0-9.]+)/;

            if (regIe.test(ua)) {
                name = "Internet Explorer";
                version = ua.match(regIe)[1];
            } else if (regIE11.test(ua)) {
                name = "Internet Explorer";
                version = ua.match(regIE11)[1];
            }

            if (regEng.test(ua)) {
                engine = "Trident";
                engineVersion = ua.match(regEng)[1];
            }
        }

        if (app === "Opera") {
            var tmp = name;
            name = app;
            app = tmp;

            tmp = version;
            version = appVersion;
            appVersion = tmp;
        }

        versionNumber = parseInt(version, 10);

        var regOs = /(Android|BlackBerry|Windows Phone|Windows CE|SymbOS|iPhone|iPad|J2ME\/MIDP|Series|Windows Mobile|Windows|Linux|Intel Mac OS X|Macintosh)/gi, regMobile = /(Android|BlackBerry|Windows Phone|Windows CE|SymbOS|iPhone|iPad|Series|Windows Mobile)/gi, reg64 = /(WOW64|x64|amd64|win64|x86_64)/i, names = system.match(regOs);

        os = {
            name: names.pop(),
            alt: names,
            x64: reg64.test(system),
            text: system
        };

        mobile = regMobile.test(system);
        webkit = (/webkit/i).test(ua);

        switch (name) {
            case "Internet Explorer":
                if (versionNumber >= 8)
                    prefix = "ms";
                break;

            case "Opera":
                prefix = "o";
                break;

            case "Firefox":
                prefix = "moz";
                break;

            default:
                if (webkit === true)
                    prefix = "webkit";
                break;
        }
    }

    var nav = {
        name: name,
        version: version,
        versionNumber: versionNumber,
        engine: {
            name: engine,
            version: engineVersion
        },
        application: {
            name: app,
            version: appVersion
        },
        sub: {
            name: sub,
            version: subVersion
        },
        webkit: webkit,
        mobile: mobile,
        prefix: prefix,
        os: os
    };

    
    return nav;
});
