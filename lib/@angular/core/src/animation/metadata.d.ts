export declare const AUTO_STYLE: string;
export declare const FINAL_STATE_ALIAS: string;
export declare class AnimationEntryMetadata {
    name: string;
    definitions: AnimationStateMetadata[];
    constructor(name: string, definitions: AnimationStateMetadata[]);
}
export declare abstract class AnimationStateMetadata {
}
export declare class AnimationStateDeclarationMetadata extends AnimationStateMetadata {
    stateName: string;
    styles: AnimationStyleMetadata;
    constructor(stateName: string, styles: AnimationStyleMetadata);
}
export declare class AnimationStateTransitionMetadata extends AnimationStateMetadata {
    stateChangeExpr: string;
    animation: AnimationMetadata;
    constructor(stateChangeExpr: string, animation: AnimationMetadata);
}
export declare abstract class AnimationMetadata {
}
export declare class AnimationStyleMetadata extends AnimationMetadata {
    styles: Array<string | {
        [key: string]: string | number;
    }>;
    offset: number;
    constructor(styles: Array<string | {
        [key: string]: string | number;
    }>, offset?: number);
}
export declare class AnimationAnimateMetadata extends AnimationMetadata {
    timings: string | number;
    styles: AnimationStyleMetadata[];
    constructor(timings: string | number, styles: AnimationStyleMetadata[]);
}
export declare abstract class AnimationWithStepsMetadata extends AnimationMetadata {
    constructor();
    steps: AnimationMetadata[];
}
export declare class AnimationSequenceMetadata extends AnimationWithStepsMetadata {
    private _steps;
    constructor(_steps: AnimationMetadata[]);
    steps: AnimationMetadata[];
}
export declare class AnimationGroupMetadata extends AnimationWithStepsMetadata {
    private _steps;
    constructor(_steps: AnimationMetadata[]);
    steps: AnimationMetadata[];
}
export declare function animate(timing: string | number, styles?: AnimationStyleMetadata | AnimationStyleMetadata[]): AnimationAnimateMetadata;
export declare function group(steps: AnimationMetadata[]): AnimationGroupMetadata;
export declare function sequence(steps: AnimationMetadata[]): AnimationSequenceMetadata;
export declare function style(tokens: string | {
    [key: string]: string | number;
} | Array<string | {
    [key: string]: string | number;
}>): AnimationStyleMetadata;
export declare function state(stateName: string, styles: AnimationStyleMetadata): AnimationStateDeclarationMetadata;
export declare function transition(stateChangeExpr: string, animationData: AnimationMetadata | AnimationMetadata[]): AnimationStateTransitionMetadata;
export declare function animation(name: string, animation: AnimationMetadata | AnimationMetadata[]): AnimationEntryMetadata;
