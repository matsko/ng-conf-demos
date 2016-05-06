"use strict";
var collection_1 = require('../facade/collection');
var lang_1 = require('../facade/lang');
var core_1 = require('@angular/core');
var web_animations_player_1 = require('./web_animations_player');
var dom_adapter_1 = require('./dom_adapter');
var WebAnimationsDriver = (function () {
    function WebAnimationsDriver() {
    }
    WebAnimationsDriver.prototype.computeStyle = function (element, prop) {
        return dom_adapter_1.getDOM().getComputedStyle(element)[prop];
    };
    WebAnimationsDriver.prototype.animate = function (element, startingStyles, keyframes, duration, delay, easing) {
        var formattedSteps = [];
        var startingStyleLookup = {};
        if (lang_1.isPresent(startingStyles) && startingStyles.styles.length > 0) {
            startingStyleLookup = _populateStyles(startingStyles, {});
            startingStyleLookup['offset'] = 0;
            formattedSteps.push(startingStyleLookup);
        }
        keyframes.forEach(function (keyframe) {
            var data = _populateStyles(keyframe.styles, startingStyleLookup);
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
        return new web_animations_player_1.WebAnimationsPlayer(player, duration);
    };
    return WebAnimationsDriver;
}());
exports.WebAnimationsDriver = WebAnimationsDriver;
function _populateStyles(styles, defaultStyles) {
    var data = {};
    styles.styles.forEach(function (entry) {
        collection_1.StringMapWrapper.forEach(entry, function (val, prop) {
            data[prop] = val.toString() + _resolveStyleUnit(val, prop);
        });
    });
    collection_1.StringMapWrapper.forEach(defaultStyles, function (value, prop) {
        if (!lang_1.isPresent(data[prop])) {
            data[prop] = value;
        }
    });
    return data;
}
function _resolveStyleUnit(val, prop) {
    var unit = '';
    if (_isPixelDimensionStyle(prop) && val != 0 && val != '0') {
        if (lang_1.isNumber(val)) {
            unit = 'px';
        }
        else if (_findDimensionalSuffix(val.toString()).length == 0) {
            throw new core_1.BaseException('Please provide a CSS unit value for ' + prop + ':' + val);
        }
    }
    return unit;
}
var _$0 = 48;
var _$9 = 57;
var _$PERIOD = 46;
function _findDimensionalSuffix(value) {
    for (var i = 0; i < value.length; i++) {
        var c = lang_1.StringWrapper.charCodeAt(value, i);
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