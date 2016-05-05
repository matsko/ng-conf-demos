import { isPresent } from '../facade/lang';
export class WebAnimationsPlayer {
    constructor(_player) {
        this._player = _player;
        this._subscriptions = [];
        this._finished = false;
        this.parentPlayer = null;
        // this is required to make the player startable at a later time
        this.reset();
        this._player.onfinish = () => this._onFinish();
    }
    _onFinish() {
        if (!this._finished) {
            this._finished = true;
            if (!isPresent(this.parentPlayer)) {
                this.destroy();
            }
            this._subscriptions.forEach(fn => fn());
            this._subscriptions = [];
        }
    }
    onDone(fn) { this._subscriptions.push(fn); }
    play() { this._player.play(); }
    pause() { this._player.pause(); }
    finish() { this._player.finish(); }
    reset() { this._player.cancel(); }
    restart() {
        this.reset();
        this.play();
    }
    destroy() {
        this.reset();
        this._onFinish();
    }
}
//# sourceMappingURL=web_animations_player.js.map