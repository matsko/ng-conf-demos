import { NoOpAnimationPlayer } from './animation_player';
export class AnimationDriver {
}
export class NoOpAnimationDriver extends AnimationDriver {
    computeStyle(element, prop) { return ''; }
    animate(element, startingStyles, keyframes, duration, delay, easing) {
        return new NoOpAnimationPlayer();
    }
}
//# sourceMappingURL=animation_driver.js.map