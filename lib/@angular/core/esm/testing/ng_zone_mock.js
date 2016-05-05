import { Injectable, NgZone } from '../index';
import { EventEmitter, ObservableWrapper } from '../src/facade/async';
export class MockNgZone extends NgZone {
    constructor() {
        super({ enableLongStackTrace: false });
        /** @internal */
        this._mockOnStable = new EventEmitter(false);
        this._mockOnMicrotaskEmpty = new EventEmitter(false);
    }
    get onStable() { return this._mockOnStable; }
    get onMicrotaskEmpty() { return this._mockOnMicrotaskEmpty; }
    run(fn) { return fn(); }
    runOutsideAngular(fn) { return fn(); }
    simulateZoneExit() { ObservableWrapper.callNext(this.onStable, null); }
    simulateMicrotaskEmpty() { ObservableWrapper.callNext(this.onMicrotaskEmpty, null); }
}
MockNgZone.decorators = [
    { type: Injectable },
];
MockNgZone.ctorParameters = [];
//# sourceMappingURL=ng_zone_mock.js.map