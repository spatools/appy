/// <reference path="../../../typings/jquery/jquery.d.ts" />
/// <reference path="../../../typings/underscore/underscore.d.ts" />
/// <reference path="../../promise-ext/src/promise.d.ts" />

declare module "koutils/base64" {
var result: {
    encode: (str: string) => string;
    decode: (str: string) => string;
    createDataURL: (mimeType: string, content: string) => string;
    encodeDataURL: (mimeType: string, text: string) => string;
};
export = result;
}

declare module "koutils/cache" {
export interface CacheResult {
    key: string;
    mime: string;
    url: string;
    content: string;
    date: string;
}
export function reset(): Promise<any>;
export function load(key: string, url: string, mime?: string, encode?: boolean, force?: boolean): Promise<CacheResult>;
export function loadScript(key: string, url: string, force?: boolean): Promise<any>;
export function loadStyle(key: string, url: string, force?: boolean): Promise<void>;
export function loadStylesheet(key: string, url: string, force?: boolean): Promise<string>;
export function loadHTML(key: string, url: string, force?: boolean): Promise<string>;
export function loadJSON<T>(key: string, url: string, force?: boolean): Promise<T>;
}

declare module "koutils/loader" {
export function loadScript(url: string): Promise<string>;
export function loadStyle(css: string): Promise<void>;
export function loadStylesheet(url: string): Promise<string>;
}

declare module "koutils/navigator" {
var nav: {
    name: string;
    version: string;
    versionNumber: number;
    engine: {
        name: string;
        version: string;
    };
    application: {
        name: string;
        version: string;
    };
    sub: {
        name: string;
        version: string;
    };
    webkit: boolean;
    mobile: boolean;
    prefix: string;
    os: {
        name: string;
        alt: string[];
        x64: boolean;
        text: string;
    };
};
export = nav;
}

declare module "koutils/path" {
export var mimeTypes: {
    [key: string]: string;
};
export var separator: string;
export function getFileName(path: string): string;
export function getExtension(path: string): string;
export function getMimeType(path: string): string;
export function getMimeTypeByExtension(extension: string): string;
export function getDirectory(path: string): string;
export function getDirectoryName(path: string): string;
export function combine(...paths: string[]): string;
}

declare module "koutils/store" {
export interface ISimpleStorage {
    length(): Promise<number>;
    key(index: any): Promise<any>;
    getItem(key: any): Promise<any>;
    setItem(key: any, value: any): Promise<void>;
    removeItem(key: any): Promise<void>;
    clear(): Promise<void>;
}
export class MemoryStorage implements ISimpleStorage {
    private memory;
    private clone(obj);
    public length(): Promise<number>;
    public key(index: any): Promise<any>;
    public getItem(key: any): Promise<any>;
    public setItem(key: any, value: any): Promise<void>;
    public removeItem(key: any): Promise<void>;
    public clear(): Promise<void>;
}
export class WebSQLStorage implements ISimpleStorage {
    private db;
    public dbname: string;
    public tablename: string;
    public dbsize: number;
    private executeSql(db, req, values?);
    private ensureDb();
    public length(): Promise<number>;
    public clear(): Promise<void>;
    public key(index: number): Promise<any>;
    public getItem(key: string): Promise<any>;
    public setItem(key: string, value: any): Promise<any>;
    public removeItem(key: string): Promise<any>;
}
export class IndexedDBStorage implements ISimpleStorage {
    private db;
    public dbversion: number;
    public dbname: string;
    public tablename: string;
    constructor();
    private createUpgradeNeeded(reject);
    private checkDatabaseConnection();
    private ensureDatabase();
    public clear(): Promise<void>;
    public length(): Promise<number>;
    public key(index: number): Promise<any>;
    public getItem(key: string): Promise<any>;
    public setItem(key: string, value: any): Promise<void>;
    public removeItem(key: string): Promise<void>;
}
export function length(): Promise<number>;
export function key(index: any): Promise<any>;
export function getItem(key: any): Promise<any>;
export function setItem(key: any, data: any): Promise<void>;
export function removeItem(key: any): Promise<void>;
export function clear(): Promise<void>;
export function changeStore(type: string): void;
export function addStorageType(type: string, store: ISimpleStorage): void;
export function addStorageType(type: string, store: ISimpleStorage, change: boolean): void;
}

declare module "koutils/timers" {
export class Timer {
    private interval;
    private callback;
    private callBackContext;
    private enabled;
    private callOnFirstStart;
    private tickCount;
    private timeout;
    constructor(interval: number, callback: () => void, callBackContext?: any, enabled?: boolean, callOnFirstStart?: boolean);
    public getTickCount(): number;
    public setInterval(interval: number): void;
    public setCallback(callback: () => void): void;
    public start(callOnFirstStart?: boolean): void;
    public stop(): void;
    public reset(): void;
    private setTimeout();
    private onTimerTick();
}
export class AsyncTimer {
    private interval;
    private callback;
    private callBackContext;
    private enabled;
    private callOnFirstStart;
    private tickCount;
    private timeout;
    constructor(interval: number, callback: (complete: () => void) => void, callBackContext?: any, enabled?: boolean, callOnFirstStart?: boolean);
    public getTickCount(): number;
    public setInterval(interval: number): void;
    public setCallback(callback: (complete: () => void) => void): void;
    public start(callOnFirstStart?: boolean): void;
    public stop(): void;
    public reset(): void;
    private setTimeout();
    private onTimerTick();
    private completeCallback();
}
}
