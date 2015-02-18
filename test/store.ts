/// <reference path="../_definitions.d.ts" />
/// <reference path="../typings/mocha/mocha.d.ts" />
/// <reference path="../typings/should/should.d.ts" />
/// <reference path="../typings/sinon/sinon.d.ts" />

import Modernizr = require("modernizr");
import store = require("../src/store");
import helper = require("./helpers/store");

describe("Store", () => {

    describe("Base Store", () => {

        describe("setItem", () => {
            beforeEach((done: any) => store.clear().then(done, done));

            it("should add item into store if key does not exists", (done) => {
                store.length()
                    .then(len => len.should.equal(0))
                    .then(() => store.setItem(helper.storeKey, helper.simpleValue))
                    .then(() => store.length())
                    .then(len => {
                        len.should.equal(1);
                        done();
                    })
                    .catch(done);
            });

            it("should not add item into store if key exists", (done) => {
                store.length()
                    .then(len => len.should.equal(0))
                    .then(() => store.setItem(helper.storeKey, helper.simpleValue))
                    .then(() => store.setItem(helper.storeKey, "blabla"))
                    .then(() => store.length())
                    .then(len => {
                        len.should.equal(1);
                        done();
                    })
                    .catch(done);
            });

        });

        describe("getItem", () => {
            beforeEach((done: any) => store.clear().then(done, done));

            it("should return null if key does not exists", (done) => {
                store.length()
                    .then(len => len.should.equal(0))
                    .then(() => store.getItem(helper.storeKey))
                    .then(item => {
                        //should.equal(item, null);
                        (item === null).should.be.ok; // better performance
                        done();
                    })
                    .catch(done);
            });

            it("should return item associated to given key if exists", (done) => {
                store.length()
                    .then(len => len.should.equal(0))
                    .then(() => store.setItem(helper.storeKey, helper.simpleValue))
                    .then(() => store.getItem(helper.storeKey))
                    .then(item => {
                        item.should.equal(helper.simpleValue);
                        done();
                    })
                    .catch(done);
            });

        });

        describe("removeItem", () => {
            beforeEach((done: any) => store.clear().then(done, done));

            it("should remove item from store", (done) => {
                store.length()
                    .then(len => len.should.equal(0))
                    .then(() => store.setItem(helper.storeKey, helper.simpleValue))
                    .then(() => store.length())
                    .then(len => len.should.equal(1))
                    .then(() => store.removeItem(helper.storeKey))
                    .then(() => store.length())
                    .then(len => {
                        len.should.equal(0);
                        done();
                    })
                    .catch(done);
            });

        });

    });

    if (Modernizr.websqldatabase) {

        describe("WebSQL", () => {
            var websql = new store.WebSQLStorage();
            websql.dbsize = 1024;

            describe("setItem", () => {
                beforeEach((done: any) => websql.clear().then(done, done));

                it("should add item into store if key does not exists", (done) => {
                    websql.length()
                        .then(len => len.should.equal(0))
                        .then(() => websql.setItem(helper.storeKey, helper.simpleValue))
                        .then(() => websql.length())
                        .then(len => {
                            len.should.equal(1);
                            done();
                        })
                        .catch(done);
                });

                it("should not add item into store if key exists", (done) => {
                    websql.length()
                        .then(len => len.should.equal(0))
                        .then(() => websql.setItem(helper.storeKey, helper.simpleValue))
                        .then(() => websql.setItem(helper.storeKey, "blabla"))
                        .then(() => websql.length())
                        .then(len => {
                            len.should.equal(1);
                            done();
                        })
                        .catch(done);
                });

            });

            describe("getItem", () => {
                beforeEach((done: any) => websql.clear().then(done, done));

                it("should return null if key does not exists", (done) => {
                    websql.length()
                        .then(len => len.should.equal(0))
                        .then(() => websql.getItem(helper.storeKey))
                        .then(item => {
                            //should.equal(item, null);
                            (item === null).should.be.ok; // better performance
                            done();
                        })
                        .catch(done);
                });

                it("should return item associated to given key if exists", (done) => {
                    websql.length()
                        .then(len => len.should.equal(0))
                        .then(() => websql.setItem(helper.storeKey, helper.simpleValue))
                        .then(() => websql.getItem(helper.storeKey))
                        .then(item => {
                            item.should.equal(helper.simpleValue);
                            done();
                        })
                        .catch(done);
                });

            });

            describe("removeItem", () => {
                beforeEach((done: any) => websql.clear().then(done, done));

                it("should remove item from store", (done) => {
                    websql.length()
                        .then(len => len.should.equal(0))
                        .then(() => websql.setItem(helper.storeKey, helper.simpleValue))
                        .then(() => websql.length())
                        .then(len => len.should.equal(1))
                        .then(() => websql.removeItem(helper.storeKey))
                        .then(() => websql.length())
                        .then(len => {
                            len.should.equal(0);
                            done();
                        })
                        .catch(done);
                });

            });

        });

    }

    if (Modernizr.indexeddb) {
        describe("IndexedDB", () => {
            var idb = new store.IndexedDBStorage();

            describe("setItem", () => {
                beforeEach((done: any) => idb.clear().then(done, done));

                it("should add item into store if key does not exists", (done) => {
                    idb.length()
                        .then(len => len.should.equal(0))
                        .then(() => idb.setItem(helper.storeKey, helper.simpleValue))
                        .then(() => idb.length())
                        .then(len => {
                            len.should.equal(1);
                            done();
                        })
                        .catch(done);
                });

                it("should not add item into store if key exists", (done) => {
                    idb.length()
                        .then(len => len.should.equal(0))
                        .then(() => idb.setItem(helper.storeKey, helper.simpleValue))
                        .then(() => idb.setItem(helper.storeKey, "blabla"))
                        .then(() => idb.length())
                        .then(len => {
                            len.should.equal(1);
                            done();
                        })
                        .catch(done);
                });

            });

            describe("getItem", () => {
                beforeEach((done: any) => idb.clear().then(done, done));

                it("should return null if key does not exists", (done) => {
                    idb.length()
                        .then(len => len.should.equal(0))
                        .then(() => idb.getItem(helper.storeKey))
                        .then(item => {
                            //should.equal(item, null);
                            (item === null).should.be.ok; // better performance
                            done();
                        })
                        .catch(done);
                });

                it("should return item associated to given key if exists", (done) => {
                    idb.length()
                        .then(len => len.should.equal(0))
                        .then(() => idb.setItem(helper.storeKey, helper.simpleValue))
                        .then(() => idb.getItem(helper.storeKey))
                        .then(item => {
                            item.should.equal(helper.simpleValue);
                            done();
                        })
                        .catch(done);
                });

            });

            describe("removeItem", () => {
                beforeEach((done: any) => idb.clear().then(done, done));

                it("should remove item from store", (done) => {
                    idb.length()
                        .then(len => len.should.equal(0))
                        .then(() => idb.setItem(helper.storeKey, helper.simpleValue))
                        .then(() => idb.length())
                        .then(len => len.should.equal(1))
                        .then(() => idb.removeItem(helper.storeKey))
                        .then(() => idb.length())
                        .then(len => {
                            len.should.equal(0);
                            done();
                        })
                        .catch(done);
                });

            });

        });
    }
});

//export function run() {
//    module("Store Tests");

//    test("store.simple", () => {
//        expect(4);

//        store.clear();
//        equal(store.length, 0, "Store has been cleared, so store.length must be '0'");

//        store.setItem(storeKey, simpleValue);
//        equal(store.length, 1, "The value '" + simpleValue + "' has been added on key '" + storeKey + "', so store.length must be '1'");

//        var val = store.getItem(storeKey);
//        equal(val, simpleValue, "The value on key '" + storeKey + "' must be '" + simpleValue + "'");

//        store.removeItem(storeKey);
//        equal(store.length, 0, "The value on key '" + storeKey + "' has been deleted, so store.length must be '0'");
//    });

//    test("store.complex", () => {
//        expect(6);

//        store.clear();
//        equal(store.length, 0, "Store has been cleared, so store.length must be '0'");

//        var serialized = JSON.stringify(complexValue);

//        store.setItem(storeKey, serialized);
//        equal(store.length, 1, "The value '" + serialized + "' has been added on key '" + storeKey + "', so store.length must be '1'");

//        var val = store.getItem(storeKey);
//        equal(val, serialized, "The value on key '" + storeKey + "' must be '" + serialized + "'");

//        var real = JSON.parse(val);
//        equal(real.title, complexValue.title, "After serialization value.title must be '" + complexValue.title + "'");
//        equal(real.value, complexValue.value, "After serialization value.value must be '" + complexValue.value + "'");

//        store.removeItem(storeKey);
//        equal(store.length, 0, "The value on key '" + storeKey + "' has been deleted, so store.length must be '0'");
//    });

//    if (Modernizr.websqldatabase) {
//        asyncTest("store.websql.simple", () => {
//            expect(4);

//            var websql = new store.WebSQLStorage();
//            websql.dbsize = 1024;

//            websql
//                .init()
//                .then(() => websql.clear())
//                .then(() => { equal(websql.length, 0, "Store has been cleared, so store.length must be '0'"); })
//                .then(() => websql.setItem(storeKey, simpleValue))
//                .then(() => {
//                    equal(websql.length, 1, "The value '" + simpleValue + "' has been added on key '" + storeKey + "', so store.length must be '1'");

//                    var val = websql.getItem(storeKey);
//                    equal(val, simpleValue, "The value on key '" + storeKey + "' must be '" + simpleValue + "'");

//                    return websql.removeItem(storeKey);
//                })
//                .then(() => { equal(websql.length, 0, "The value on key '" + storeKey + "' has been deleted, so store.length must be '0'"); })
//                .always(start);
//        });

//        asyncTest("store.websql.complex", () => {
//            expect(6);

//            var websql = new store.WebSQLStorage();
//            var serialized = JSON.stringify(complexValue);
//            websql.dbsize = 1024;

//            websql
//                .init()
//                .then(() => websql.clear())
//                .then(() => { equal(websql.length, 0, "Store has been cleared, so store.length must be '0'"); })
//                .then(() => websql.setItem(storeKey, serialized))
//                .then(() => {
//                    equal(websql.length, 1, "The value '" + serialized + "' has been added on key '" + storeKey + "', so store.length must be '1'");

//                    var val = websql.getItem(storeKey);
//                    equal(val, serialized, "The value on key '" + storeKey + "' must be '" + serialized + "'");

//                    var real = JSON.parse(val);
//                    equal(real.title, complexValue.title, "After serialization value.title must be '" + complexValue.title + "'");
//                    equal(real.value, complexValue.value, "After serialization value.value must be '" + complexValue.value + "'");

//                    return websql.removeItem(storeKey);
//                })
//                .then(() => { equal(websql.length, 0, "The value on key '" + storeKey + "' has been deleted, so store.length must be '0'"); })
//                .always(start);
//        });
//    }

//    if (Modernizr.indexeddb) {
//        asyncTest("store.idb.simple", () => {
//            expect(4);

//            var idb = new store.IndexedDBStorage();

//            idb.init()
//                .then(() => idb.clear())
//                .then(() => { equal(idb.length, 0, "Store has been cleared, so store.length must be '0'"); })
//                .then(() => idb.setItem(storeKey, simpleValue))
//                .then(() => {
//                    equal(idb.length, 1, "The value '" + simpleValue + "' has been added on key '" + storeKey + "', so store.length must be '1'");

//                    var val = idb.getItem(storeKey);
//                    equal(val, simpleValue, "The value on key '" + storeKey + "' must be '" + simpleValue + "'");

//                    return idb.removeItem(storeKey);
//                })
//                .then(() => { equal(idb.length, 0, "The value on key '" + storeKey + "' has been deleted, so store.length must be '0'"); })
//                .always(start);
//        });


//        asyncTest("store.idb.complex", () => {
//            expect(6);

//            var idb = new store.IndexedDBStorage();
//            var serialized = JSON.stringify(complexValue);

//            idb.init()
//                .then(() => idb.clear())
//                .then(() => { equal(idb.length, 0, "Store has been cleared, so store.length must be '0'"); })
//                .then(() => idb.setItem(storeKey, serialized))
//                .then(() => {
//                    equal(idb.length, 1, "The value '" + serialized + "' has been added on key '" + storeKey + "', so store.length must be '1'");

//                    var val = idb.getItem(storeKey);
//                    equal(val, serialized, "The value on key '" + storeKey + "' must be '" + serialized + "'");

//                    var real = JSON.parse(val);
//                    equal(real.title, complexValue.title, "After serialization value.title must be '" + complexValue.title + "'");
//                    equal(real.value, complexValue.value, "After serialization value.value must be '" + complexValue.value + "'");

//                    return idb.removeItem(storeKey);
//                })
//                .then(() => { equal(idb.length, 0, "The value on key '" + storeKey + "' has been deleted, so store.length must be '0'"); })
//                .always(start);
//        });
//    }
//}
