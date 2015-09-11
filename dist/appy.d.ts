/// <reference path="../../../typings/jquery/jquery.d.ts" />
/// <reference path="../../promizr/promise.d.ts" />

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
/** Reset entire cache resources */
export function reset(): Promise<any>;
/** Load a resource in cache */
export function load(key: string, url: string, mime?: string, encode?: boolean, force?: boolean): Promise<CacheResult>;
/** Load a script in cache */
export function loadScript(key: string, url: string, force?: boolean): Promise<any>;
/** Load a style in cache */
export function loadStyle(key: string, url: string, force?: boolean): Promise<void>;
/** Load a style sheet in cache */
export function loadStylesheet(key: string, url: string, force?: boolean): Promise<string>;
/** Load an HTML fragment in cache */
export function loadHTML(key: string, url: string, force?: boolean): Promise<string>;
/** Load an JSON result in cache */
export function loadJSON<T>(key: string, url: string, force?: boolean): Promise<T>;
}

declare module "koutils/loader" {
/** Load script document by url */
export function loadScript(url: string): Promise<string>;
/** Load specified style into current page */
export function loadStyle(css: string): Promise<void>;
/** Load specified stylesheet by url */
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
/** Get file name from its path */
export function getFileName(path: string): string;
/** Get Extension from file name or path */
export function getExtension(path: string): string;
/** Get mime-type from file name or path */
export function getMimeType(path: string): string;
/** Get mime-type associated with specified extension */
export function getMimeTypeByExtension(extension: string): string;
/** Get path without file name */
export function getDirectory(path: string): string;
/** Get current directory name */
export function getDirectoryName(path: string): string;
/** Combine multiple path to create a single path */
export function combine(...paths: string[]): string;
/** Simplify a path by removing .. and . */
export function simplify(path: string): string;
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
    length(): Promise<number>;
    key(index: number): Promise<string>;
    getItem(key: any): Promise<any>;
    setItem(key: any, value: any): Promise<void>;
    removeItem(key: any): Promise<void>;
    clear(): Promise<void>;
}
export class WebSQLStorage implements ISimpleStorage {
    private db;
    dbname: string;
    tablename: string;
    dbsize: number;
    private executeSql(db, req, values?);
    private ensureDb();
    length(): Promise<number>;
    clear(): Promise<void>;
    key(index: number): Promise<any>;
    getItem(key: string): Promise<any>;
    setItem(key: string, value: any): Promise<any>;
    removeItem(key: string): Promise<any>;
}
export class IndexedDBStorage implements ISimpleStorage {
    private db;
    dbversion: number;
    dbname: string;
    tablename: string;
    private createUpgradeNeeded(reject);
    private checkDatabaseConnection();
    private ensureDatabase();
    clear(): Promise<void>;
    length(): Promise<number>;
    key(index: number): Promise<any>;
    getItem(key: string): Promise<any>;
    setItem(key: string, value: any): Promise<void>;
    removeItem(key: string): Promise<void>;
}
export function length(): Promise<number>;
export function key(index: any): Promise<any>;
export function getItem(key: any): Promise<any>;
export function setItem(key: any, data: any): Promise<void>;
export function removeItem(key: any): Promise<void>;
export function clear(): Promise<void>;
export function getStore(type: string): ISimpleStorage;
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
    /**
     * Constructs a new AsyncTimer
     * @param interval Interval between two timer iteration
     * @param callback Callback to be called when timer ticks
     * @param callBackContext Context (this) to be applied to callback when timer ticks
     * @param enabled Specifiy whether the timer need to be started directly
     * @param callOnFirstStart Specify whether the timer must start directly with a call to specified callback
     */
    constructor(interval: number, callback: () => void, callBackContext?: any, enabled?: boolean, callOnFirstStart?: boolean);
    /** Get the total number of ticks elapsed since timer started. */
    getTickCount(): number;
    /** Set a new interval for the current timer. */
    setInterval(interval: number): void;
    /** Set a new callback to be called when timer ticks. */
    setCallback(callback: () => void): void;
    /** Start current timer. */
    start(callOnFirstStart?: boolean): void;
    /** Stop current timer. */
    stop(): void;
    /** Reset current timer by setting tick count to 0. */
    reset(): void;
    private setTimeout();
    private onTimerTick();
}
export type Thenable = {
    then: (resolve: Function, reject?: Function) => void;
};
export type AsyncTimerCallback = (complete: () => void) => void;
export type AsyncTimerThenable = () => Thenable;
export type AsyncTimerCallbackParam = AsyncTimerCallback | AsyncTimerThenable;
export class AsyncTimer {
    private interval;
    private callback;
    private callBackContext;
    private enabled;
    private callOnFirstStart;
    private tickCount;
    private timeout;
    /**
     * Constructs a new AsyncTimer
     * @param interval Interval between two timer iteration
     * @param callback Callback to be called when timer ticks
     * @param callBackContext Context (this) to be applied to callback when timer ticks
     * @param enabled Specifiy whether the timer need to be started directly
     * @param callOnFirstStart Specify whether the timer must start directly with a call to specified callback
     */
    constructor(interval: number, callback: AsyncTimerCallbackParam, callBackContext?: any, enabled?: boolean, callOnFirstStart?: boolean);
    /** Get the total number of ticks elapsed since timer started. */
    getTickCount(): number;
    /** Set a new interval for the current timer. */
    setInterval(interval: number): void;
    /** Set a new callback to be called when timer ticks. */
    setCallback(callback: (complete: () => void) => void): void;
    /** Start current timer. */
    start(callOnFirstStart?: boolean): void;
    /** Stop current timer. */
    stop(): void;
    /** Reset current timer by setting tick count to 0. */
    reset(): void;
    private setTimeout();
    private onTimerTick();
    private completeCallback();
}
}
