/// <reference path="../_definitions.d.ts" />
/// <reference path="../typings/mocha/mocha.d.ts" />
/// <reference path="../typings/should/should.d.ts" />
/// <reference path="../typings/sinon/sinon.d.ts" />

import path = require("../src/path");
import helper = require("./helpers/path");

describe("Path", () => {

    describe("getFileName", () => {

        it("should extract file name from given path", () => {
            var result = path.getFileName(helper.filePath);
            result.should.equal(helper.filename);
        });

    });

    describe("getExtension", () => {

        it("should extract file extension from given path", () => {
            var result = path.getExtension(helper.filePath);
            result.should.equal(helper.extension);
        });

    });

    describe("getMimeType", () => {

        it("should extract file mime type from given path", () => {
            var result = path.getMimeType(helper.filePath);
            result.should.equal("image/jpeg");
        });

    });

    describe("getMimeTypeByExtension", () => {

        it("should extract file mime type from given extension", () => {
            var result = path.getMimeTypeByExtension("png");
            result.should.equal("image/png");
        });

    });

    describe("getDirectory", () => {

        it("should extract parent directory path from given file path", () => {
            var result = path.getDirectory(helper.filePath);
            result.should.equal(helper.rootPath);
        });

    });

    describe("getDirectoryName", () => {

        it("should extract parent directory path from given file path", () => {
            var result = path.getDirectoryName(helper.filePath);
            result.should.equal(helper.dirName);
        });

    });

    describe("combine", () => {

        it("should combine given path to form a new correct path", () => {
            var result = path.combine(helper.rootPath, helper.filename);
            result.should.equal(helper.filePath);
        });

        it("should combine any number of paths into a single one", () => {
            var result = path.combine("/var", "www", helper.dirName, helper.filename);
            result.should.equal(helper.filePath);
        });

    });

    describe("simplify", () => {

        it("should remove every '.' from the path", () => {
            var result = path.simplify("test1/test2/./test3/test4/././test5.txt");
            result.should.equal("test1/test2/test3/test4/test5.txt");
        });

        it("should resolve every '..' from the path", () => {
            var result = path.simplify("test1/test2/../test3/test4/../../test5.txt");
            result.should.equal("test1/test5.txt");
        });

    });

});
