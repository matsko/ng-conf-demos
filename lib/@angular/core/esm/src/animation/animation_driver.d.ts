import { AnimationPlayer } from './animation_player';
import { AnimationKeyframe } from './animation_keyframe';
import { AnimationStyles } from './animation_styles';
export declare abstract class AnimationDriver {
    abstract computeStyle(element: any, prop: string): string;
    abstract animate(element: any, startingStyles: AnimationStyles, keyframes: AnimationKeyframe[], duration: number, delay: number, easing: string): AnimationPlayer;
}
export declare class NoOpAnimationDriver extends AnimationDriver {
    computeStyle(element: any, prop: string): string;
    animate(element: any, startingStyles: AnimationStyles, keyframes: AnimationKeyframe[], duration: number, delay: number, easing: string): AnimationPlayer;
}
