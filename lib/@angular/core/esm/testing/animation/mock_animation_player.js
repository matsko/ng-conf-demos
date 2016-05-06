import { isPresent } from '../../src/facade/lang';
export class MockAnimationPlayer {
    constructor() {
        this._subscriptions = [];
        this._finished = false;
        this._destroyed = false;
        this.parentPlayer = null;
        this.log = [];
    }
    _onfinish() {
        if (!this._finished) {
            this._finished = true;
            this.log.push('finish');
            this._subscriptions.forEach((entry) => { entry(); });
            this._subscriptions = [];
            if (!isPresent(this.parentPlayer)) {
                this.destroy();
            }
        }
    }
    onDone(fn) { this._subscriptions.push(fn); }
    play() { this.log.push('play'); }
    pause() { this.log.push('pause'); }
    restart() { this.log.push('restart'); }
    finish() { this._onfinish(); }
    reset() { this.log.push('reset'); }
    destroy() {
        if (!this._destroyed) {
            this._destroyed = true;
            this.finish();
            this.log.push('destroy');
        }
    }
    setPosition(p) { }
    getPosition() { return 0; }
}
//# sourceMappingURL=mock_animation_player.js.map