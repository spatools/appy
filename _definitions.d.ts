/// <reference path="typings/jquery/jquery.d.ts" />
/// <reference path="typings/modernizr/modernizr.d.ts" />
/// <reference path="bower_components/promizr/promise.d.ts" />
/// <reference path="src/base.d.ts" />

interface MSApp {
    execUnsafeLocalFunction<T>(cb: () => T);
}

declare function escape(text: string): string;
declare function unescape(text: string): string;

interface Function {
    result?: any; // Memoization Pattern
}

interface StyleSheet {
    cssText: string;
}

interface HTMLStyleElement {
    styleSheet: StyleSheet;
}

interface IDBEvent extends Event {
    target: IDBEventTarget;
}

interface IDBEventTarget extends EventTarget {
    result: any;
}

interface IDBVersionChangeEvent {
    target: IDBVersionChangeEventTarget;
}

interface IDBVersionChangeEventTarget extends IDBEventTarget {
    transaction?: IDBTransaction;
}

declare module "modernizr" {
    export = Modernizr;
}