import { scheduleMicroTask } from '../facade/lang';
import { BaseException } from '../facade/exceptions';
export class AnimationPlayer {
    get parentPlayer() { throw new BaseException('NOT IMPLEMENTED: Base Class'); }
    set parentPlayer(player) { throw new BaseException('NOT IMPLEMENTED: Base Class'); }
}
export class NoOpAnimationPlayer {
    constructor() {
        this._subscriptions = [];
        this.parentPlayer = null;
        scheduleMicroTask(() => {
            this._subscriptions.forEach(entry => { entry(); });
            this._subscriptions = [];
        });
    }
    onDone(fn) { this._subscriptions.push(fn); }
    play() { }
    pause() { }
    restart() { }
    finish() { }
    destroy() { }
    reset() { }
    setPosition(p) { }
    getPosition() { return 0; }
}
//# sourceMappingURL=animation_player.js.map