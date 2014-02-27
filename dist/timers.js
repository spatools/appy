define(["require", "exports"], function(require, exports) {
    var Timer = (function () {
        function Timer(interval, callback, callBackContext, enabled, callOnFirstStart) {
            if (typeof callBackContext === "undefined") { callBackContext = null; }
            if (typeof enabled === "undefined") { enabled = false; }
            if (typeof callOnFirstStart === "undefined") { callOnFirstStart = false; }
            this.interval = interval;
            this.callback = callback;
            this.callBackContext = callBackContext;
            this.enabled = enabled;
            this.callOnFirstStart = callOnFirstStart;
            this.tickCount = 0;
            this.timeout = 0;
            if (enabled && callback) {
                this.start();
            }
        }
        Timer.prototype.getTickCount = function () {
            return this.tickCount;
        };

        Timer.prototype.setInterval = function (interval) {
            this.interval = interval * 1;
        };

        Timer.prototype.setCallback = function (callback) {
            this.callback = callback;
        };

        Timer.prototype.start = function (callOnFirstStart) {
            if (typeof callOnFirstStart === "undefined") { callOnFirstStart = false; }
            if (!this.callback) {
                throw new Error("callback is not defined, define callback before start");
            }

            this.enabled = true;

            if (callOnFirstStart || this.callOnFirstStart)
                this.callback.call(this.callBackContext);

            this.setTimeout();
        };

        Timer.prototype.stop = function () {
            if (this.enabled) {
                this.enabled = false;
                clearTimeout(this.timeout);
            }
        };

        Timer.prototype.reset = function () {
            this.tickCount = 0;
        };

        Timer.prototype.setTimeout = function () {
            var _this = this;
            this.timeout = setTimeout(function () {
                _this.onTimerTick.apply(_this, arguments);
            }, this.interval);
        };

        Timer.prototype.onTimerTick = function () {
            this.tickCount += this.interval;
            this.callback.call(this.callBackContext);

            if (this.enabled) {
                this.setTimeout();
            }
        };
        return Timer;
    })();
    exports.Timer = Timer;

    var AsyncTimer = (function () {
        function AsyncTimer(interval, callback, callBackContext, enabled, callOnFirstStart) {
            if (typeof callBackContext === "undefined") { callBackContext = null; }
            if (typeof enabled === "undefined") { enabled = false; }
            if (typeof callOnFirstStart === "undefined") { callOnFirstStart = false; }
            this.interval = interval;
            this.callback = callback;
            this.callBackContext = callBackContext;
            this.enabled = enabled;
            this.callOnFirstStart = callOnFirstStart;
            this.tickCount = 0;
            this.timeout = 0;
            if (enabled && callback) {
                this.start();
            }
        }
        AsyncTimer.prototype.getTickCount = function () {
            return this.tickCount;
        };

        AsyncTimer.prototype.setInterval = function (interval) {
            this.interval = interval * 1;
        };

        AsyncTimer.prototype.setCallback = function (callback) {
            this.callback = callback;
        };

        AsyncTimer.prototype.start = function (callOnFirstStart) {
            if (typeof callOnFirstStart === "undefined") { callOnFirstStart = false; }
            if (!this.callback) {
                throw new Error("callback is not defined, define callback before start");
            }

            this.enabled = true;

            if (callOnFirstStart || this.callOnFirstStart)
                this.callback.call(this.callBackContext, this.completeCallback);
            else
                this.setTimeout();
        };

        AsyncTimer.prototype.stop = function () {
            if (this.enabled) {
                this.enabled = false;
                clearTimeout(this.timeout);
            }
        };

        AsyncTimer.prototype.reset = function () {
            this.tickCount = 0;
        };

        AsyncTimer.prototype.setTimeout = function () {
            var _this = this;
            this.timeout = setTimeout(function () {
                _this.onTimerTick.apply(_this, arguments);
            }, this.interval);
        };

        AsyncTimer.prototype.onTimerTick = function () {
            var _this = this;
            this.tickCount += this.interval;
            this.callback.call(this.callBackContext, function () {
                _this.completeCallback();
            });
        };

        AsyncTimer.prototype.completeCallback = function () {
            if (this.enabled) {
                this.setTimeout();
            }
        };
        return AsyncTimer;
    })();
    exports.AsyncTimer = AsyncTimer;
});
