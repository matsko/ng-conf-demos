"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var animation_driver_1 = require('../../src/animation/animation_driver');
var collection_1 = require('../../src/facade/collection');
var mock_animation_player_1 = require('../../testing/animation/mock_animation_player');
var MockAnimationDriver = (function (_super) {
    __extends(MockAnimationDriver, _super);
    function MockAnimationDriver() {
        _super.apply(this, arguments);
        this.log = [];
    }
    MockAnimationDriver.prototype.computeStyle = function (element, prop) { return ''; };
    MockAnimationDriver.prototype.animate = function (element, startingStyles, keyframes, duration, delay, easing) {
        var player = new mock_animation_player_1.MockAnimationPlayer();
        this.log.push({
            'element': element,
            'startingStyles': _serializeStyles(startingStyles),
            'keyframes': keyframes,
            'keyframeLookup': _serializeKeyframes(keyframes),
            'duration': duration,
            'delay': delay,
            'easing': easing,
            'player': player
        });
        return player;
    };
    return MockAnimationDriver;
}(animation_driver_1.AnimationDriver));
exports.MockAnimationDriver = MockAnimationDriver;
function _serializeKeyframes(keyframes) {
    return keyframes.map(function (keyframe) { return [keyframe.offset, _serializeStyles(keyframe.styles)]; });
}
function _serializeStyles(styles) {
    var flatStyles = {};
    styles.styles.forEach(function (entry) { return collection_1.StringMapWrapper.forEach(entry, function (val, prop) { flatStyles[prop] = val; }); });
    return flatStyles;
}
//# sourceMappingURL=mock_animation_driver.js.map