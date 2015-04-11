/// <reference path="../_definitions.d.ts" />

export interface ISimpleStorage {
    length(): Promise<number>;
    key(index: any): Promise<any>;
    getItem(key: any): Promise<any>;
    setItem(key: any, value: any): Promise<void>;
    removeItem(key: any): Promise<void>;
    clear(): Promise<void>
}

import promiseExt = require("promise/extensions");
var win = <any>window,
    _store: ISimpleStorage,
    stores: any = {};


//#region Create Available Stores

export class MemoryStorage implements ISimpleStorage {
    private memory = {};

    private clone(obj) {
        return obj === undefined ? undefined : JSON.parse(JSON.stringify(obj));
    }

    public length(): Promise<number> {
        return promiseExt.timeout()
            .then<number>(() => Object.keys(this.memory).length);
    }
    public key(index: number): Promise<string> {
        return promiseExt.timeout().then(() => {
            var key = Object.keys(this.memory)[index];

            if (!key) {
                throw new Error("No key at index " + index);
            }

            return key;
        });
    }
    public getItem(key: any): Promise<any> {
        return promiseExt.timeout()
            .then(() => this.clone(this.memory[key]));
    }
    public setItem(key: any, value: any): Promise<void> {
        return promiseExt.timeout()
            .then(() => { this.memory[key] = value; });
    }
    public removeItem(key: any): Promise<void> {
        return promiseExt.timeout()
            .then(() => { delete this.memory[key]; });
    }

    public clear(): Promise<void> {
        return promiseExt.timeout()
            .then(() => { this.memory = {}; });
    }
}
stores.memory = MemoryStorage;

export class WebSQLStorage implements ISimpleStorage {
    private db = null;

    public dbname = "appystore";
    public tablename = "storetable";
    public dbsize = 10 * 1024 * 1024;

    private executeSql(db, req: string, values?: any[]): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            db.transaction(
                tx => {
                    tx.executeSql(
                        req,
                        values || [],
                        (tx, result) => { resolve(result); },
                        reject
                        );
                },
                reject
                );
        });
    }
    private ensureDb(): Promise<any> {
        if (!this.db) {
            var db = this.db = win.openDatabase(this.dbname, "1.0", "Appy Store Database", this.dbsize);
            return this.executeSql(db, "CREATE TABLE IF NOT EXISTS " + this.tablename + " (id unique, data)").then(() => db);
        }

        return Promise.resolve(this.db);
    }

    public length(): Promise<number> {
        return this.ensureDb()
            .then(db => this.executeSql(db, "SELECT COUNT(*) AS linecount FROM " + this.tablename))
            .then(result => result.rows.item(0).linecount);
    }
    public clear(): Promise<void> {
        return this.ensureDb()
            .then(db => this.executeSql(db, "DELETE FROM " + this.tablename + " WHERE 1=1"))
            .then(result => undefined);
    }

    public key(index: number): Promise<any> {
        return this.ensureDb()
            .then(db => this.executeSql(db, "SELECT id FROM " + this.tablename + " ORDER BY id LIMIT " + index + ", 1"))
            .then(result => result.rows.length > 0 ? result.rows.item(0).id : null);
    }
    public getItem(key: string): Promise<any> {
        return this.ensureDb()
            .then(db => this.executeSql(db, "SELECT * FROM " + this.tablename + " WHERE id=? LIMIT 1", [key]))
            .then(result => result.rows.length > 0 ? result.rows.item(0).data : null);
    }
    public setItem(key: string, value: any) {
        return this.ensureDb()
            .then(db => this.executeSql(db, "INSERT OR REPLACE INTO " + this.tablename + " (id, data) VALUES (?, ?)", [key, value]));
    }
    public removeItem(key: string) {
        return this.ensureDb()
            .then(db => this.executeSql(db, "DELETE FROM " + this.tablename + " WHERE id=?", [key]));
    }
}
stores.websql = WebSQLStorage;

export class IndexedDBStorage implements ISimpleStorage {
    private db: IDBDatabase = null;

    public dbversion: number = 1;
    public dbname = "appystore";
    public tablename = "storetable";

    constructor() {
        win.indexedDB = win.indexedDB || win.webkitIndexedDB || win.mozIndexedDB || win.msIndexedDB;
        win.IDBTransaction = win.IDBTransaction || win.webkitIDBTransaction || win.msIDBTransaction;
        win.IDBKeyRange = win.IDBKeyRange || win.webkitIDBKeyRange || win.msIDBKeyRange;
    }

    private createUpgradeNeeded(reject: PromiseRejectFunction): (e: IDBVersionChangeEvent) => void {
        return (e: IDBVersionChangeEvent) => {
            var _db = e.target.result;

            e.target.transaction.onerror = reject;

            if (!_db.objectStoreNames.contains(this.tablename)) {
                _db.createObjectStore(this.tablename, { keyPath: "key" });
            }
        };
    }
    private checkDatabaseConnection(): Promise<IDBDatabase> {
        return new Promise<IDBDatabase>((resolve, reject) => {
            var request = indexedDB.open(this.dbname, this.dbversion);

            request.onupgradeneeded = this.createUpgradeNeeded(reject);
            request.onsuccess = (e: IDBEvent) => {
                this.db = e.target.result;
                resolve(this.db);
            };

            request.onerror = reject;
            request.onblocked = reject;
        });
    }
    private ensureDatabase(): Promise<IDBDatabase> {
        return Promise.resolve(this.db || this.checkDatabaseConnection());
    }

    public clear(): Promise<void> {
        return this.ensureDatabase()
            .then(db => {
            return new Promise<void>((resolve, reject) => {
                var tx = db.transaction([this.tablename], "readwrite");
                tx.oncomplete = e => resolve.call(undefined);
                tx.onabort = reject;

                tx.objectStore(this.tablename).clear();
            });
        });
    }

    public length(): Promise<number> {
        return this.ensureDatabase().then(db => {
            return new Promise<number>((resolve, reject) => {
                var store = db.transaction([this.tablename], "readonly").objectStore(this.tablename),
                    request, result, i = 0;

                if (store.count) {
                    request = store.count();
                    request.onsuccess = (e: IDBEvent) => { resolve(e.target.result); };
                    request.onerror = reject;
                }
                else {
                    request = store.openCursor();

                    request.onerror = reject;
                    request.onsuccess = (e: IDBEvent) => {
                        result = e.target.result;
                        result ? ++i && result.continue() : resolve(i);
                    };
                }
            });
        });
    }
    public key(index: number): Promise<any> {
        return this.ensureDatabase().then(db => {
            return new Promise<any>((resolve, reject) => {
                var store = db.transaction([this.tablename], "readonly").objectStore(this.tablename),
                    cursor = store.openCursor(),
                    i = 0;

                cursor.onsuccess = (e: IDBEvent) => {
                    var _cursor = e.target.result;
                    if (_cursor) {
                        if (i === index) {
                            resolve(_cursor.value.key);
                        }
                        else if (i < index) {
                            _cursor.continue();
                        }
                        i++;
                    }
                    else {
                        reject(new Error("Not found"));
                    }
                };

                cursor.onerror = reject;
            });
        });
    }
    public getItem(key: string): Promise<any> {
        return this.ensureDatabase().then(db => {
            return new Promise<any>((resolve, reject) => {
                var store = db.transaction([this.tablename], "readonly").objectStore(this.tablename),
                    request = store.get(key);

                request.onsuccess = (e: IDBEvent) => { resolve(e.target.result ? e.target.result.value : null); };
                request.onerror = reject;
            });
        });
    }
    public setItem(key: string, value: any): Promise<void> {
        return this.ensureDatabase().then(db => {
            return new Promise<void>((resolve, reject) => {
                var store = db.transaction([this.tablename], "readwrite").objectStore(this.tablename),
                    request = store.put({ key: key, value: value });

                request.onerror = reject;
                request.onsuccess = (e: IDBEvent) => { resolve(undefined); };
            });
        });
    }
    public removeItem(key: string): Promise<void> {
        return this.ensureDatabase().then(db => {
            return new Promise<void>((resolve, reject) => {
                var store = db.transaction([this.tablename], "readwrite").objectStore(this.tablename),
                    request = store.delete(key);

                request.onerror = reject;
                request.onsuccess = (e: IDBEvent) => { resolve(undefined); };
            });
        });
    }
}
stores.indexeddb = IndexedDBStorage;

function createFromIStorage(type: string, storage: Storage): void {
    var StorageWrapper = function StorageWrapper() {
        this.type = type;
    };
    StorageWrapper.prototype.length = function length(): Promise<number> {
        return Promise.resolve(storage.length);
    };
    StorageWrapper.prototype.key = function key(index: number): Promise<any> {
        return promiseExt.timeout()
            .then(() => storage.key(index));
    };
    StorageWrapper.prototype.getItem = function getItem(key: string): Promise<any> {
        return promiseExt.timeout()
            .then(() => storage.getItem(key));
    };
    StorageWrapper.prototype.setItem = function setItem(key: string, value: any): Promise<void> {
        return promiseExt.timeout()
            .then(() => storage.setItem(key, value));
    };
    StorageWrapper.prototype.removeItem = function removeItem(key: string): Promise<void> {
        return promiseExt.timeout()
            .then(() => storage.removeItem(key));
    };
    StorageWrapper.prototype.clear = function clear(): Promise<void> {
        return promiseExt.timeout()
            .then(() => storage.clear());
    };

    stores[type] = StorageWrapper;
}

["localStorage", "sessionStorage"].forEach(storageType => {
    try {
        if (win[storageType] && win[storageType].getItem) {
            createFromIStorage(storageType, win[storageType]);
        }
    }
    catch (e) {
        return false;
    }
});

(function () {
    if (win.globalStorage) {
        try {
            createFromIStorage("globalStorage", win.globalStorage[window.location.hostname]);
        }
        catch (e) {
            return false;
        }
    }
})();

//#endregion

//#region Initialize best available storage

(function () {
    _store = new stores.localStorage();

    if (!_store) {
        if (stores.sessionStorage) {
            _store = new stores.sessionStorage();
        }
        else if (stores.globalStorage) {
            _store = new stores.globalStorage();
        }
        else {
            _store = new stores.memory();
        }
    }
})();

//#endregion

//#region Public Methods

export function length(): Promise<number> {
    return _store.length();
}
export function key(index: any): Promise<any> {
    return _store.key(index);
}
export function getItem(key: any): Promise<any> {
    return _store.getItem(key);
}
export function setItem(key: any, data: any): Promise<void> {
    return _store.setItem(key, data);
}
export function removeItem(key: any): Promise<void> {
    return _store.removeItem(key);
}
export function clear(): Promise<void> {
    return _store.clear();
}
export function getStore(type: string): ISimpleStorage {
    if (!stores[type]) {
        throw new Error("Not Found");
    }
    if (typeof stores[type] === "function") {
        return new stores[type]();
    }

    return stores[type];
}
export function changeStore(type: string): void {
    _store = getStore(type);
}
export function addStorageType(type: string, store: ISimpleStorage): void;
export function addStorageType(type: string, store: ISimpleStorage, change: boolean): void;
export function addStorageType(type: string, store: ISimpleStorage, change?: boolean): void {
    if (stores[type]) {
        throw new Error("This store already exists !");
    }

    stores[type] = store;

    if (change === true) {
        changeStore(type);
    }
}

//#endregion
