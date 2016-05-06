import { AnimationPlayer } from '../../src/animation/animation_player';
export declare class MockAnimationPlayer implements AnimationPlayer {
    private _subscriptions;
    private _finished;
    private _destroyed;
    parentPlayer: AnimationPlayer;
    log: any[];
    private _onfinish();
    onDone(fn: Function): void;
    play(): void;
    pause(): void;
    restart(): void;
    finish(): void;
    reset(): void;
    destroy(): void;
    setPosition(p: any): void;
    getPosition(): number;
}
