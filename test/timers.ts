/// <reference path="../_definitions.d.ts" />
/// <reference path="../typings/mocha/mocha.d.ts" />
/// <reference path="../typings/should/should.d.ts" />
/// <reference path="../typings/sinon/sinon.d.ts" />

import timers = require("../src/timers");

describe("Timers", () => {

    describe("Timer", () => {

        it("should have ticked once after given interval", (done) => {
            var timerSpy = sinon.spy(),
                timer = new timers.Timer(10, timerSpy);

            timer.start();

            setTimeout(() => {
                timer.stop();
                sinon.assert.calledOnce(timerSpy);

                done();
            }, 15);
        });

        it("should have ticked twice after two interval", (done) => {
            var timerSpy = sinon.spy(),
                timer = new timers.Timer(10, timerSpy);

            timer.start();

            setTimeout(() => {
                timer.stop();
                sinon.assert.calledTwice(timerSpy);

                done();
            }, 29);
        });

        it("should have ticked thrice after three interval", (done) => {
            var timerSpy = sinon.spy(),
                timer = new timers.Timer(10, timerSpy);

            timer.start();

            setTimeout(() => {
                timer.stop();
                sinon.assert.calledThrice(timerSpy);

                done();
            }, 40);
        });

    });

    describe("AsyncTimer", () => {

        it("should have ticked once after given interval", (done) => {
            var timerSpy = sinon.spy(),
                timer = new timers.AsyncTimer(10, timerSpy);

            timer.start();

            setTimeout(() => {
                timer.stop();
                sinon.assert.calledOnce(timerSpy);

                done();
            }, 15);
        });

        it("should not have ticked twice after two interval if complete callback has not be called", (done) => {
            var timerSpy = sinon.spy(),
                timer = new timers.AsyncTimer(10, timerSpy);

            timer.start();

            setTimeout(() => {
                timer.stop();
                sinon.assert.calledOnce(timerSpy);

                done();
            }, 25);
        });

        it("should tick again after complete callback was called", (done) => {
            var complete,
                timerSpy = sinon.spy(function (c) { complete = c; }),
                timer = new timers.AsyncTimer(10, timerSpy);

            timer.start();

            setTimeout(() => {
                sinon.assert.calledOnce(timerSpy);

                setTimeout(() => {
                    sinon.assert.calledOnce(timerSpy);
                    complete();

                    setTimeout(() => {
                        timer.stop();
                        sinon.assert.calledTwice(timerSpy);

                        done();
                    }, 15);
                }, 15);
            }, 15);
        });

    });

});
