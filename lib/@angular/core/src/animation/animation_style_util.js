"use strict";
var lang_1 = require('../facade/lang');
var collection_1 = require('../facade/collection');
var metadata_1 = require('./metadata');
var AnimationStyleUtil = (function () {
    function AnimationStyleUtil(styles) {
        this.styles = styles;
    }
    AnimationStyleUtil.balanceStyles = function (previousStyles, newStyles) {
        var finalStyles = {};
        collection_1.StringMapWrapper.forEach(newStyles, function (value, prop) {
            finalStyles[prop] = value;
        });
        collection_1.StringMapWrapper.forEach(previousStyles, function (value, prop) {
            if (!lang_1.isPresent(finalStyles[prop])) {
                finalStyles[prop] = null;
            }
        });
        return finalStyles;
    };
    AnimationStyleUtil.clearStyles = function (styles) {
        var finalStyles = {};
        collection_1.StringMapWrapper.keys(styles).forEach(function (key) {
            finalStyles[key] = null;
        });
        return finalStyles;
    };
    AnimationStyleUtil.stripAutoStyles = function (styles) {
        var finalStyles = {};
        collection_1.StringMapWrapper.forEach(styles, function (value, key) {
            if (value != metadata_1.AUTO_STYLE) {
                finalStyles[key] = value;
            }
        });
        return finalStyles;
    };
    AnimationStyleUtil.prototype.lookup = function (value) {
        var data = this.styles[value];
        if (!lang_1.isPresent(data)) {
            data = this.styles['void'];
        }
        return data;
    };
    return AnimationStyleUtil;
}());
exports.AnimationStyleUtil = AnimationStyleUtil;
//# sourceMappingURL=animation_style_util.js.map