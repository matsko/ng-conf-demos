"use strict";
var lang_1 = require('../../src/facade/lang');
var MockAnimationPlayer = (function () {
    function MockAnimationPlayer() {
        this._subscriptions = [];
        this._finished = false;
        this._destroyed = false;
        this.parentPlayer = null;
        this.log = [];
    }
    MockAnimationPlayer.prototype._onfinish = function () {
        if (!this._finished) {
            this._finished = true;
            this.log.push('finish');
            this._subscriptions.forEach(function (entry) { entry(); });
            this._subscriptions = [];
            if (!lang_1.isPresent(this.parentPlayer)) {
                this.destroy();
            }
        }
    };
    MockAnimationPlayer.prototype.onDone = function (fn) { this._subscriptions.push(fn); };
    MockAnimationPlayer.prototype.play = function () { this.log.push('play'); };
    MockAnimationPlayer.prototype.pause = function () { this.log.push('pause'); };
    MockAnimationPlayer.prototype.restart = function () { this.log.push('restart'); };
    MockAnimationPlayer.prototype.finish = function () { this._onfinish(); };
    MockAnimationPlayer.prototype.reset = function () { this.log.push('reset'); };
    MockAnimationPlayer.prototype.destroy = function () {
        if (!this._destroyed) {
            this._destroyed = true;
            this.finish();
            this.log.push('destroy');
        }
    };
    MockAnimationPlayer.prototype.setPosition = function (p) { };
    MockAnimationPlayer.prototype.getPosition = function () { return 0; };
    return MockAnimationPlayer;
}());
exports.MockAnimationPlayer = MockAnimationPlayer;
//# sourceMappingURL=mock_animation_player.js.map