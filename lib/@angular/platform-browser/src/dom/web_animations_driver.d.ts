import { AnimationDriver, AnimationPlayer, AnimationKeyframe, AnimationStyles } from '../../core_private';
export declare class WebAnimationsDriver implements AnimationDriver {
    computeStyle(element: any, prop: string): string;
    animate(element: any, startingStyles: AnimationStyles, keyframes: AnimationKeyframe[], duration: number, delay: number, easing: string): AnimationPlayer;
}
