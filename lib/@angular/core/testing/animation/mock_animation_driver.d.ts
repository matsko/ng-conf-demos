import { AnimationDriver } from '../../src/animation/animation_driver';
import { AnimationKeyframe } from '../../src/animation/animation_keyframe';
import { AnimationPlayer } from '../../src/animation/animation_player';
import { AnimationStyles } from '../../src/animation/animation_styles';
export declare class MockAnimationDriver extends AnimationDriver {
    log: any[];
    computeStyle(element: any, prop: string): string;
    animate(element: any, startingStyles: AnimationStyles, keyframes: AnimationKeyframe[], duration: number, delay: number, easing: string): AnimationPlayer;
}
