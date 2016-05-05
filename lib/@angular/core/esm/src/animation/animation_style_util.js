import { isPresent } from '../facade/lang';
import { StringMapWrapper } from '../facade/collection';
import { AUTO_STYLE } from './metadata';
export class AnimationStyleUtil {
    constructor(styles) {
        this.styles = styles;
    }
    static balanceStyles(previousStyles, newStyles) {
        var finalStyles = {};
        StringMapWrapper.forEach(newStyles, (value, prop) => {
            finalStyles[prop] = value;
        });
        StringMapWrapper.forEach(previousStyles, (value, prop) => {
            if (!isPresent(finalStyles[prop])) {
                finalStyles[prop] = null;
            }
        });
        return finalStyles;
    }
    static clearStyles(styles) {
        var finalStyles = {};
        StringMapWrapper.keys(styles).forEach(key => {
            finalStyles[key] = null;
        });
        return finalStyles;
    }
    static stripAutoStyles(styles) {
        var finalStyles = {};
        StringMapWrapper.forEach(styles, (value, key) => {
            if (value != AUTO_STYLE) {
                finalStyles[key] = value;
            }
        });
        return finalStyles;
    }
    lookup(value) {
        var data = this.styles[value];
        if (!isPresent(data)) {
            data = this.styles['void'];
        }
        return data;
    }
}
//# sourceMappingURL=animation_style_util.js.map