import { AnimationDriver } from '../../src/animation/animation_driver';
import { StringMapWrapper } from '../../src/facade/collection';
import { MockAnimationPlayer } from '../../testing/animation/mock_animation_player';
export class MockAnimationDriver extends AnimationDriver {
    constructor(...args) {
        super(...args);
        this.log = [];
    }
    computeStyle(element, prop) { return ''; }
    animate(element, startingStyles, keyframes, duration, delay, easing) {
        var player = new MockAnimationPlayer();
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
    }
}
function _serializeKeyframes(keyframes) {
    return keyframes.map(keyframe => [keyframe.offset, _serializeStyles(keyframe.styles)]);
}
function _serializeStyles(styles) {
    var flatStyles = {};
    styles.styles.forEach(entry => StringMapWrapper.forEach(entry, (val, prop) => { flatStyles[prop] = val; }));
    return flatStyles;
}
//# sourceMappingURL=mock_animation_driver.js.map