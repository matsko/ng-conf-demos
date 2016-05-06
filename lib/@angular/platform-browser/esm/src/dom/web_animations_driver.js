import { StringMapWrapper } from '../facade/collection';
import { isPresent, isNumber, StringWrapper } from '../facade/lang';
import { BaseException } from '@angular/core';
import { WebAnimationsPlayer } from './web_animations_player';
import { getDOM } from './dom_adapter';
export class WebAnimationsDriver {
    computeStyle(element, prop) {
        return getDOM().getComputedStyle(element)[prop];
    }
    animate(element, startingStyles, keyframes, duration, delay, easing) {
        var formattedSteps = [];
        var startingStyleLookup = {};
        if (isPresent(startingStyles) && startingStyles.styles.length > 0) {
            startingStyleLookup = _populateStyles(startingStyles, {});
            startingStyleLookup['offset'] = 0;
            formattedSteps.push(startingStyleLookup);
        }
        keyframes.forEach((keyframe) => {
            let data = _populateStyles(keyframe.styles, startingStyleLookup);
            data['offset'] = keyframe.offset;
            formattedSteps.push(data);
        });
        // this is a special case when only styles are applied as an
        // animation. When this occurs we want to animate from start to
        // end with the same values. Removing the offset and having only
        // start/end values is suitable enough for the web-animations API
        if (formattedSteps.length == 1) {
            var start = formattedSteps[0];
            start.offset = null;
            formattedSteps = [start, start];
        }
        var anyElm = element;
        var player = anyElm.animate(formattedSteps, { 'duration': duration, 'delay': delay, 'easing': easing, 'fill': 'forwards' });
        return new WebAnimationsPlayer(player, duration);
    }
}
function _populateStyles(styles, defaultStyles) {
    var data = {};
    styles.styles.forEach((entry) => {
        StringMapWrapper.forEach(entry, (val, prop) => {
            data[prop] = val.toString() + _resolveStyleUnit(val, prop);
        });
    });
    StringMapWrapper.forEach(defaultStyles, (value, prop) => {
        if (!isPresent(data[prop])) {
            data[prop] = value;
        }
    });
    return data;
}
function _resolveStyleUnit(val, prop) {
    var unit = '';
    if (_isPixelDimensionStyle(prop) && val != 0 && val != '0') {
        if (isNumber(val)) {
            unit = 'px';
        }
        else if (_findDimensionalSuffix(val.toString()).length == 0) {
            throw new BaseException('Please provide a CSS unit value for ' + prop + ':' + val);
        }
    }
    return unit;
}
const _$0 = 48;
const _$9 = 57;
const _$PERIOD = 46;
function _findDimensionalSuffix(value) {
    for (var i = 0; i < value.length; i++) {
        var c = StringWrapper.charCodeAt(value, i);
        if ((c >= _$0 && c <= _$9) || c == _$PERIOD)
            continue;
        return value.substring(i, value.length);
    }
    return '';
}
function _isPixelDimensionStyle(prop) {
    switch (prop) {
        case 'width':
        case 'height':
        case 'min-width':
        case 'min-height':
        case 'max-width':
        case 'max-height':
        case 'left':
        case 'top':
        case 'bottom':
        case 'right':
        case 'font-size':
        case 'outline-width':
        case 'outline-offset':
        case 'padding-top':
        case 'padding-left':
        case 'padding-bottom':
        case 'padding-right':
        case 'margin-top':
        case 'margin-left':
        case 'margin-bottom':
        case 'margin-right':
        case 'border-radius':
        case 'border-width':
        case 'border-top-width':
        case 'border-left-width':
        case 'border-right-width':
        case 'border-bottom-width':
        case 'text-indent':
            return true;
        default:
            return false;
    }
}
//# sourceMappingURL=web_animations_driver.js.map