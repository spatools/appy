/// <reference path="../_definitions.d.ts" />
/// <reference path="../typings/mocha/mocha.d.ts" />
/// <reference path="../typings/should/should.d.ts" />
/// <reference path="../typings/sinon/sinon.d.ts" />

import base64 = require("../src/base64");
import helper = require("./helpers/base64");

describe("Base64", () => {

    describe("encode", () => {

        it("should encode text as expected", () => {
            var result = base64.encode(helper.base);
            result.should.equal(helper.result);
        });

    });

    describe("decode", () => {

        it("should decode text as expected", () => {
            var result = base64.decode(helper.result);
            result.should.equal(helper.base);
        });

    });

    describe("createDataURI", () => {

        it("should format base64 string has a base64 Data URI", () => {
            var result = base64.createDataURL("text/plain", helper.result);
            result.should.equal(helper.dataUri);
        });

    });

    describe("encodeDataURI", () => {

        it("should encode plain string has a base64 Data URI", () => {
            var result = base64.encodeDataURL("text/plain", helper.base);
            result.should.equal(helper.dataUri);
        });

    });

});
