"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var lang_1 = require('../facade/lang');
var exceptions_1 = require('../facade/exceptions');
exports.AUTO_STYLE = "*";
exports.FINAL_STATE_ALIAS = "(final)";
var AnimationEntryMetadata = (function () {
    function AnimationEntryMetadata(name, definitions) {
        this.name = name;
        this.definitions = definitions;
    }
    return AnimationEntryMetadata;
}());
exports.AnimationEntryMetadata = AnimationEntryMetadata;
var AnimationStateMetadata = (function () {
    function AnimationStateMetadata() {
    }
    return AnimationStateMetadata;
}());
exports.AnimationStateMetadata = AnimationStateMetadata;
var AnimationStateDeclarationMetadata = (function (_super) {
    __extends(AnimationStateDeclarationMetadata, _super);
    function AnimationStateDeclarationMetadata(stateName, styles) {
        _super.call(this);
        this.stateName = stateName;
        this.styles = styles;
    }
    return AnimationStateDeclarationMetadata;
}(AnimationStateMetadata));
exports.AnimationStateDeclarationMetadata = AnimationStateDeclarationMetadata;
var AnimationStateTransitionMetadata = (function (_super) {
    __extends(AnimationStateTransitionMetadata, _super);
    function AnimationStateTransitionMetadata(stateChangeExpr, animation) {
        _super.call(this);
        this.stateChangeExpr = stateChangeExpr;
        this.animation = animation;
    }
    return AnimationStateTransitionMetadata;
}(AnimationStateMetadata));
exports.AnimationStateTransitionMetadata = AnimationStateTransitionMetadata;
var AnimationMetadata = (function () {
    function AnimationMetadata() {
    }
    return AnimationMetadata;
}());
exports.AnimationMetadata = AnimationMetadata;
var AnimationStyleMetadata = (function (_super) {
    __extends(AnimationStyleMetadata, _super);
    function AnimationStyleMetadata(styles, offset) {
        if (offset === void 0) { offset = null; }
        _super.call(this);
        this.styles = styles;
        this.offset = offset;
    }
    return AnimationStyleMetadata;
}(AnimationMetadata));
exports.AnimationStyleMetadata = AnimationStyleMetadata;
var AnimationAnimateMetadata = (function (_super) {
    __extends(AnimationAnimateMetadata, _super);
    function AnimationAnimateMetadata(timings, styles) {
        _super.call(this);
        this.timings = timings;
        this.styles = styles;
    }
    return AnimationAnimateMetadata;
}(AnimationMetadata));
exports.AnimationAnimateMetadata = AnimationAnimateMetadata;
var AnimationWithStepsMetadata = (function (_super) {
    __extends(AnimationWithStepsMetadata, _super);
    function AnimationWithStepsMetadata() {
        _super.call(this);
    }
    Object.defineProperty(AnimationWithStepsMetadata.prototype, "steps", {
        get: function () { throw new exceptions_1.BaseException('NOT IMPLEMENTED: Base Class'); },
        enumerable: true,
        configurable: true
    });
    return AnimationWithStepsMetadata;
}(AnimationMetadata));
exports.AnimationWithStepsMetadata = AnimationWithStepsMetadata;
var AnimationSequenceMetadata = (function (_super) {
    __extends(AnimationSequenceMetadata, _super);
    function AnimationSequenceMetadata(_steps) {
        _super.call(this);
        this._steps = _steps;
    }
    Object.defineProperty(AnimationSequenceMetadata.prototype, "steps", {
        get: function () { return this._steps; },
        enumerable: true,
        configurable: true
    });
    return AnimationSequenceMetadata;
}(AnimationWithStepsMetadata));
exports.AnimationSequenceMetadata = AnimationSequenceMetadata;
var AnimationGroupMetadata = (function (_super) {
    __extends(AnimationGroupMetadata, _super);
    function AnimationGroupMetadata(_steps) {
        _super.call(this);
        this._steps = _steps;
    }
    Object.defineProperty(AnimationGroupMetadata.prototype, "steps", {
        get: function () { return this._steps; },
        enumerable: true,
        configurable: true
    });
    return AnimationGroupMetadata;
}(AnimationWithStepsMetadata));
exports.AnimationGroupMetadata = AnimationGroupMetadata;
function animate(timing, styles) {
    if (styles === void 0) { styles = null; }
    var styleEntries;
    if (lang_1.isPresent(styles)) {
        styleEntries = lang_1.isArray(styles) ? styles : [styles];
    }
    else {
        styleEntries = [style(":" + exports.FINAL_STATE_ALIAS)];
    }
    return new AnimationAnimateMetadata(timing, styleEntries);
}
exports.animate = animate;
function group(steps) {
    return new AnimationGroupMetadata(steps);
}
exports.group = group;
function sequence(steps) {
    return new AnimationSequenceMetadata(steps);
}
exports.sequence = sequence;
function style(tokens) {
    var input;
    var offset = null;
    if (lang_1.isString(tokens)) {
        input = [tokens];
    }
    else {
        if (lang_1.isArray(tokens)) {
            input = tokens;
        }
        else {
            input = [tokens];
        }
        input.forEach(function (entry) {
            var entryOffset = entry['offset'];
            if (lang_1.isPresent(entryOffset)) {
                offset = offset == null ? lang_1.NumberWrapper.parseFloat(entryOffset) : offset;
            }
        });
    }
    return new AnimationStyleMetadata(input, offset);
}
exports.style = style;
function state(stateName, styles) {
    return new AnimationStateDeclarationMetadata(stateName, styles);
}
exports.state = state;
function transition(stateChangeExpr, animationData) {
    var animation = lang_1.isArray(animationData)
        ? new AnimationSequenceMetadata(animationData)
        : animationData;
    return new AnimationStateTransitionMetadata(stateChangeExpr, animation);
}
exports.transition = transition;
function animation(name, animation) {
    var entry = lang_1.isArray(animation)
        ? animation
        : [animation];
    return new AnimationEntryMetadata(name, entry);
}
exports.animation = animation;
//# sourceMappingURL=metadata.js.map