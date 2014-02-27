define(["require", "exports", "underscore", "promise/extensions"], function(require, exports, _, promiseExt) {
    

    var win = window, _store, stores = {};

    var MemoryStorage = (function () {
        function MemoryStorage() {
            this.memory = {};
        }
        MemoryStorage.prototype.clone = function (obj) {
            return obj === undefined ? undefined : JSON.parse(JSON.stringify(obj));
        };

        MemoryStorage.prototype.length = function () {
            var _this = this;
            return promiseExt.timeout().then(function () {
                return _.size(_this.memory);
            });
        };
        MemoryStorage.prototype.key = function (index) {
            var _this = this;
            return promiseExt.timeout().then(function () {
                return _.find(_.keys(_this.memory), function (val, i) {
                    return i === index;
                }) || Promise.reject("Not Found");
            });
        };
        MemoryStorage.prototype.getItem = function (key) {
            var _this = this;
            return promiseExt.timeout().then(function () {
                return _this.clone(_this.memory[key]);
            });
        };
        MemoryStorage.prototype.setItem = function (key, value) {
            var _this = this;
            return promiseExt.timeout().then(function () {
                _this.memory[key] = value;
            });
        };
        MemoryStorage.prototype.removeItem = function (key) {
            var _this = this;
            return promiseExt.timeout().then(function () {
                delete _this.memory[key];
            });
        };

        MemoryStorage.prototype.clear = function () {
            var _this = this;
            return promiseExt.timeout().then(function () {
                _this.memory = {};
            });
        };
        return MemoryStorage;
    })();
    exports.MemoryStorage = MemoryStorage;
    stores.memory = MemoryStorage;

    var WebSQLStorage = (function () {
        function WebSQLStorage() {
            this.db = null;
            this.dbname = "appystore";
            this.tablename = "storetable";
            this.dbsize = 10 * 1024 * 1024;
        }
        WebSQLStorage.prototype.executeSql = function (db, req, values) {
            return new Promise(function (resolve, reject) {
                db.transaction(function (tx) {
                    tx.executeSql(req, values || [], function (tx, result) {
                        resolve(result);
                    }, reject);
                }, reject);
            });
        };
        WebSQLStorage.prototype.ensureDb = function () {
            if (!this.db) {
                var db = this.db = win.openDatabase(this.dbname, "1.0", "Appy Store Database", this.dbsize);
                return this.executeSql(db, "CREATE TABLE IF NOT EXISTS " + this.tablename + " (id unique, data)").then(function () {
                    return db;
                });
            }

            return Promise.resolve(this.db);
        };

        WebSQLStorage.prototype.length = function () {
            var _this = this;
            return this.ensureDb().then(function (db) {
                return _this.executeSql(db, "SELECT COUNT(*) AS linecount FROM " + _this.tablename);
            }).then(function (result) {
                return result.rows.item(0).linecount;
            });
        };
        WebSQLStorage.prototype.clear = function () {
            var _this = this;
            return this.ensureDb().then(function (db) {
                return _this.executeSql(db, "DELETE FROM " + _this.tablename + " WHERE 1=1");
            }).then(function (result) {
                return undefined;
            });
        };

        WebSQLStorage.prototype.key = function (index) {
            var _this = this;
            return this.ensureDb().then(function (db) {
                return _this.executeSql(db, "SELECT id FROM " + _this.tablename + " ORDER BY id LIMIT " + index + ", 1");
            }).then(function (result) {
                return result.rows.length > 0 ? result.rows.item(0).id : null;
            });
        };
        WebSQLStorage.prototype.getItem = function (key) {
            var _this = this;
            return this.ensureDb().then(function (db) {
                return _this.executeSql(db, "SELECT * FROM " + _this.tablename + " WHERE id=? LIMIT 1", [key]);
            }).then(function (result) {
                return result.rows.length > 0 ? result.rows.item(0).data : null;
            });
        };
        WebSQLStorage.prototype.setItem = function (key, value) {
            var _this = this;
            return this.ensureDb().then(function (db) {
                return _this.executeSql(db, "INSERT OR REPLACE INTO " + _this.tablename + " (id, data) VALUES (?, ?)", [key, value]);
            });
        };
        WebSQLStorage.prototype.removeItem = function (key) {
            var _this = this;
            return this.ensureDb().then(function (db) {
                return _this.executeSql(db, "DELETE FROM " + _this.tablename + " WHERE id=?", [key]);
            });
        };
        return WebSQLStorage;
    })();
    exports.WebSQLStorage = WebSQLStorage;
    stores.websql = WebSQLStorage;

    var IndexedDBStorage = (function () {
        function IndexedDBStorage() {
            this.db = null;
            this.dbversion = 1;
            this.dbname = "appystore";
            this.tablename = "storetable";
            win.indexedDB = win.indexedDB || win.webkitIndexedDB || win.mozIndexedDB || win.msIndexedDB;
            win.IDBTransaction = win.IDBTransaction || win.webkitIDBTransaction || win.msIDBTransaction;
            win.IDBKeyRange = win.IDBKeyRange || win.webkitIDBKeyRange || win.msIDBKeyRange;
        }
        IndexedDBStorage.prototype.createUpgradeNeeded = function (reject) {
            var _this = this;
            return function (e) {
                var _db = e.target.result;

                e.target.transaction.onerror = reject;

                if (!_db.objectStoreNames.contains(_this.tablename)) {
                    _db.createObjectStore(_this.tablename, { keyPath: "key" });
                }
            };
        };
        IndexedDBStorage.prototype.checkDatabaseConnection = function () {
            var _this = this;
            return new Promise(function (resolve, reject) {
                var request = indexedDB.open(_this.dbname, _this.dbversion);

                request.onupgradeneeded = _this.createUpgradeNeeded(reject);
                request.onsuccess = function (e) {
                    _this.db = e.target.result;
                    resolve(_this.db);
                };

                request.onerror = reject;
                request.onblocked = reject;
            });
        };
        IndexedDBStorage.prototype.ensureDatabase = function () {
            return Promise.cast(this.db || this.checkDatabaseConnection());
        };

        IndexedDBStorage.prototype.clear = function () {
            var _this = this;
            return this.ensureDatabase().then(function (db) {
                return new Promise(function (resolve, reject) {
                    var tx = db.transaction([_this.tablename], "readwrite");
                    tx.oncomplete = function (e) {
                        return resolve.call(undefined);
                    };
                    tx.onabort = reject;

                    tx.objectStore(_this.tablename).clear();
                });
            });
        };

        IndexedDBStorage.prototype.length = function () {
            var _this = this;
            return this.ensureDatabase().then(function (db) {
                return new Promise(function (resolve, reject) {
                    var store = db.transaction([_this.tablename], "readonly").objectStore(_this.tablename), request, result, i = 0;

                    if (store.count) {
                        request = store.count();
                        request.onsuccess = function (e) {
                            resolve(e.target.result);
                        };
                        request.onerror = reject;
                    } else {
                        request = store.openCursor();

                        request.onerror = reject;
                        request.onsuccess = function (e) {
                            result = e.target.result;
                            result ? ++i && result.continue() : resolve(i);
                        };
                    }
                });
            });
        };
        IndexedDBStorage.prototype.key = function (index) {
            var _this = this;
            return this.ensureDatabase().then(function (db) {
                return new Promise(function (resolve, reject) {
                    var store = db.transaction([_this.tablename], "readonly").objectStore(_this.tablename), cursor = store.openCursor(), i = 0;

                    cursor.onsuccess = function (e) {
                        var _cursor = e.target.result;
                        if (_cursor) {
                            if (i === index) {
                                resolve(_cursor.value.key);
                            } else if (i < index) {
                                _cursor.continue();
                            }
                            i++;
                        } else {
                            reject(new Error("Not found"));
                        }
                    };

                    cursor.onerror = reject;
                });
            });
        };
        IndexedDBStorage.prototype.getItem = function (key) {
            var _this = this;
            return this.ensureDatabase().then(function (db) {
                return new Promise(function (resolve, reject) {
                    var store = db.transaction([_this.tablename], "readonly").objectStore(_this.tablename), request = store.get(key);

                    request.onsuccess = function (e) {
                        resolve(e.target.result ? e.target.result.value : null);
                    };
                    request.onerror = reject;
                });
            });
        };
        IndexedDBStorage.prototype.setItem = function (key, value) {
            var _this = this;
            return this.ensureDatabase().then(function (db) {
                return new Promise(function (resolve, reject) {
                    var store = db.transaction([_this.tablename], "readwrite").objectStore(_this.tablename), request = store.put({ key: key, value: value });

                    request.onerror = reject;
                    request.onsuccess = function (e) {
                        resolve(undefined);
                    };
                });
            });
        };
        IndexedDBStorage.prototype.removeItem = function (key) {
            var _this = this;
            return this.ensureDatabase().then(function (db) {
                return new Promise(function (resolve, reject) {
                    var store = db.transaction([_this.tablename], "readwrite").objectStore(_this.tablename), request = store.delete(key);

                    request.onerror = reject;
                    request.onsuccess = function (e) {
                        resolve(undefined);
                    };
                });
            });
        };
        return IndexedDBStorage;
    })();
    exports.IndexedDBStorage = IndexedDBStorage;
    stores.indexeddb = IndexedDBStorage;

    function createFromIStorage(type, storage) {
        var StorageWrapper = function StorageWrapper() {
            this.type = type;
        };
        StorageWrapper.prototype.length = function length() {
            return Promise.resolve(storage.length);
        };
        StorageWrapper.prototype.key = function key(index) {
            return promiseExt.timeout().then(function () {
                return storage.key(index);
            });
        };
        StorageWrapper.prototype.getItem = function getItem(key) {
            return promiseExt.timeout().then(function () {
                return storage.getItem(key);
            });
        };
        StorageWrapper.prototype.setItem = function setItem(key, value) {
            return promiseExt.timeout().then(function () {
                return storage.setItem(key, value);
            });
        };
        StorageWrapper.prototype.removeItem = function removeItem(key) {
            return promiseExt.timeout().then(function () {
                return storage.removeItem(key);
            });
        };
        StorageWrapper.prototype.clear = function clear() {
            return promiseExt.timeout().then(function () {
                return storage.clear();
            });
        };

        stores[type] = StorageWrapper;
    }

    _.each(["localStorage", "sessionStorage"], function (storageType) {
        try  {
            if (win[storageType] && win[storageType].getItem) {
                createFromIStorage(storageType, win[storageType]);
            }
        } catch (e) {
            return false;
        }
    });

    (function () {
        if (win.globalStorage) {
            try  {
                createFromIStorage("globalStorage", win.globalStorage[window.location.hostname]);
            } catch (e) {
                return false;
            }
        }
    })();

    (function () {
        _store = new stores.localStorage();

        if (!_store) {
            if (stores.sessionStorage) {
                _store = new stores.sessionStorage();
            } else if (stores.globalStorage) {
                _store = new stores.globalStorage();
            } else {
                _store = new stores.memory();
            }
        }
    })();

    function length() {
        return _store.length();
    }
    exports.length = length;
    function key(index) {
        return _store.key(index);
    }
    exports.key = key;
    function getItem(key) {
        return _store.getItem(key);
    }
    exports.getItem = getItem;
    function setItem(key, data) {
        return _store.setItem(key, data);
    }
    exports.setItem = setItem;
    function removeItem(key) {
        return _store.removeItem(key);
    }
    exports.removeItem = removeItem;
    function clear() {
        return _store.clear();
    }
    exports.clear = clear;

    function changeStore(type) {
        if (!stores[type]) {
            throw new Error("Not Found");
        }

        if (_.isFunction(stores[type])) {
            _store = new stores[type]();
        }

        _store = stores[type];
    }
    exports.changeStore = changeStore;

    function addStorageType(type, store, change) {
        if (stores[type]) {
            throw new Error("This store already exists !");
        }

        stores[type] = store;

        if (change === true) {
            exports.changeStore(type);
        }
    }
    exports.addStorageType = addStorageType;
});