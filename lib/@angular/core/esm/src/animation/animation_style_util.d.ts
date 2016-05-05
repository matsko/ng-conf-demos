export declare class AnimationStyleUtil {
    styles: {
        [key: string]: {
            [key: string]: string | number;
        };
    };
    static balanceStyles(previousStyles: {
        [key: string]: string | number;
    }, newStyles: {
        [key: string]: string | number;
    }): {
        [key: string]: string | number;
    };
    static clearStyles(styles: {
        [key: string]: string | number;
    }): {
        [key: string]: string | number;
    };
    static stripAutoStyles(styles: {
        [key: string]: string | number;
    }): {
        [key: string]: string | number;
    };
    constructor(styles: {
        [key: string]: {
            [key: string]: string | number;
        };
    });
    lookup(value: any): {
        [key: string]: string | number;
    };
}
