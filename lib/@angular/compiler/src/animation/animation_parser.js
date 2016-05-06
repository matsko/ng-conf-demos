"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var collection_1 = require('../facade/collection');
var math_1 = require('../facade/math');
var lang_1 = require('../facade/lang');
var compile_metadata_1 = require('../compile_metadata');
var core_1 = require('@angular/core');
var animation_ast_1 = require('./animation_ast');
var styles_collection_1 = require('./styles_collection');
var parse_util_1 = require('../parse_util');
var _BASE_TEN = 10;
var _INITIAL_KEYFRAME = 0;
var _TERMINAL_KEYFRAME = 1;
var _ONE_SECOND = 1000;
var AnimationParseError = (function (_super) {
    __extends(AnimationParseError, _super);
    function AnimationParseError(message) {
        _super.call(this, null, message);
    }
    AnimationParseError.prototype.toString = function () { return "" + this.msg; };
    return AnimationParseError;
}(parse_util_1.ParseError));
exports.AnimationParseError = AnimationParseError;
var ParsedAnimationResult = (function () {
    function ParsedAnimationResult(ast, errors) {
        this.ast = ast;
        this.errors = errors;
    }
    return ParsedAnimationResult;
}());
exports.ParsedAnimationResult = ParsedAnimationResult;
function parseAnimationEntry(entry) {
    var errors = [];
    var stateStyles = {};
    var definitions = [];
    var transitions = [];
    entry.definitions.forEach(function (def) {
        if (def instanceof compile_metadata_1.CompileAnimationStateDeclarationMetadata) {
            var stateAst = _parseAnimationStateDeclaration(def, errors);
            definitions.push(stateAst);
            stateStyles[stateAst.stateName] = stateAst.styles;
        }
        else {
            transitions.push(def);
        }
    });
    transitions.forEach(function (transDef) {
        var transAst = _parseAnimationStateTransition(transDef, stateStyles, errors);
        definitions.push(transAst);
    });
    var ast = new animation_ast_1.AnimationEntryAst(entry.name, definitions);
    return new ParsedAnimationResult(ast, errors);
}
exports.parseAnimationEntry = parseAnimationEntry;
function _parseAnimationStateDeclaration(stateMetadata, errors) {
    var styleValues = [];
    stateMetadata.styles.styles.forEach(function (stylesEntry) {
        // TODO (matsko): change this when we get CSS class integration support
        if (lang_1.isStringMap(stylesEntry)) {
            styleValues.push(stylesEntry);
        }
        else {
            errors.push(new AnimationParseError("State based animations cannot contain references to other states"));
        }
    });
    var defStyles = new animation_ast_1.AnimationStylesAst(styleValues);
    return new animation_ast_1.AnimationStateDeclarationAst(stateMetadata.stateName, defStyles);
}
function _parseAnimationStateTransition(transitionStateMetadata, stateStyles, errors) {
    var styles = new styles_collection_1.StylesCollection();
    var transitionExpr = _parseAnimationTransitionExpr(transitionStateMetadata.stateChangeExpr, errors);
    var sequence = _fillStartAndEndStateSteps(transitionStateMetadata.animation, transitionExpr.fromState, transitionExpr.toState, stateStyles, errors);
    var animation = _normalizeStyleSteps(sequence, stateStyles, errors);
    var animationAst = _parseAnimationDefinitionAnimation(animation, 0, styles, stateStyles, errors);
    if (errors.length == 0) {
        _fillAnimationAstStartingKeyframes(animationAst, styles, errors);
    }
    // this happens when only styles were animated within the sequence
    if (animationAst.playTime === 0) {
    }
    return new animation_ast_1.AnimationStateTransitionAst(transitionExpr.fromState, transitionExpr.toState, animationAst);
}
var _ParsedTransitionExprResult = (function () {
    function _ParsedTransitionExprResult(fromState, toState) {
        this.fromState = fromState;
        this.toState = toState;
    }
    return _ParsedTransitionExprResult;
}());
function _parseAnimationTransitionExpr(eventStr, errors) {
    var stateTokens = eventStr.split(/\s*[=-]>\s*/g);
    if (!lang_1.isPresent(stateTokens) || stateTokens.length < 2) {
        errors.push(new AnimationParseError("the provided " + eventStr + " is not of a supported format"));
    }
    return new _ParsedTransitionExprResult(stateTokens[0], stateTokens[1]);
}
function _fetchSylesFromState(stateName, stateStyles) {
    var entry = stateStyles[stateName];
    if (lang_1.isPresent(entry)) {
        var styles = entry.styles;
        return new compile_metadata_1.CompileAnimationStyleMetadata(0, styles);
    }
    return null;
}
function _computeLhsSetDifference(valuesA, valuesB) {
    var lhs = [];
    var rhs = [];
    var allValues = {};
    valuesA.forEach(function (value) {
        allValues[value] = 1;
    });
    valuesB.forEach(function (value) {
        var val = allValues[value];
        val = lang_1.isPresent(val) ? val : 0;
        allValues[value] = val - 1;
    });
    collection_1.StringMapWrapper.forEach(allValues, function (count, value) {
        if (count == -1)
            lhs.push(value);
        else if (count == 1)
            rhs.push(value);
    });
    return [lhs, rhs];
}
function _flattenStateStyles(styles) {
    var flatStyles = {};
    styles.forEach(function (styleEntry) {
        if (lang_1.isStringMap(styleEntry)) {
            collection_1.StringMapWrapper.forEach(styleEntry, function (value, prop) {
                flatStyles[prop] = value;
            });
        }
    });
    return flatStyles;
}
function _fillStartAndEndStateSteps(entry, fromState, toState, stateStyles, errors) {
    var sequence;
    var finalStep = null;
    if (entry instanceof compile_metadata_1.CompileAnimationSequenceMetadata) {
        sequence = entry;
        finalStep = sequence.steps[sequence.steps.length - 1];
    }
    else {
        var entries = lang_1.isArray(entry)
            ? entry
            : [entry];
        sequence = new compile_metadata_1.CompileAnimationSequenceMetadata(entries);
    }
    var fromStateStyles = _fetchSylesFromState(fromState, stateStyles);
    var toStateStyles = _fetchSylesFromState(toState, stateStyles);
    var fromStyles = lang_1.isPresent(fromStateStyles) ? _flattenStateStyles(fromStateStyles.styles) : {};
    var toStyles = lang_1.isPresent(toStateStyles) ? _flattenStateStyles(toStateStyles.styles) : {};
    var fromStyleProps = collection_1.StringMapWrapper.keys(fromStyles);
    var toStyleProps = collection_1.StringMapWrapper.keys(toStyles);
    var missingStyles = _computeLhsSetDifference(fromStyleProps, toStyleProps);
    var missingFromStyles = missingStyles[0];
    var missingToStyles = missingStyles[1];
    var firstStepStyles = fromStyleProps.length > 0 ? [fromStyles] : [];
    if (missingFromStyles.length > 0) {
        firstStepStyles.push(_populateMapFromKeyWithValue(missingFromStyles, core_1.AUTO_STYLE));
    }
    if (firstStepStyles.length > 0) {
        var firstStep = new compile_metadata_1.CompileAnimationStyleMetadata(0, firstStepStyles);
        collection_1.ListWrapper.insert(sequence.steps, 0, firstStep);
    }
    var lastStepStyles = toStyleProps.length > 0 ? [toStyles] : [];
    if (missingToStyles.length > 0) {
        lastStepStyles.push(_populateMapFromKeyWithValue(missingToStyles, core_1.AUTO_STYLE));
    }
    // look at the final step
    // if it is an animate step where the final state value matches then apply
    if (lastStepStyles.length > 0) {
        if (lang_1.isPresent(finalStep) && (finalStep instanceof compile_metadata_1.CompileAnimationAnimateMetadata)) {
            var animateStep = finalStep;
            var animateStyles = animateStep.styles;
            // search through each of the style steps in the last animate step to
            // see // if the final state is referenced. If so then replace the
            // final state data with the states style values
            var finalStateDetected = false;
            animateStyles.forEach(function (styleMetadata) {
                var finalStateIndex = -1;
                var arr = styleMetadata.styles;
                for (var j = 0; j < arr.length; j++) {
                    var styleEntry = arr[j];
                    if (styleEntry[0] == ':') {
                        var stateName = styleEntry.substring(1);
                        if (stateName == core_1.FINAL_STATE_ALIAS || stateName == toState) {
                            finalStateDetected = true;
                            finalStateIndex = j;
                            break;
                        }
                    }
                }
                if (finalStateIndex >= 0) {
                    lastStepStyles.forEach(function (entry, count) {
                        if (count == 0) {
                            arr[finalStateIndex] = entry;
                        }
                        else {
                            collection_1.ListWrapper.insert(arr, finalStateIndex + count, entry);
                        }
                    });
                }
            });
            if (!finalStateDetected) {
                finalStep = null;
            }
        }
        else {
            finalStep = null;
        }
        if (!lang_1.isPresent(finalStep)) {
            finalStep = new compile_metadata_1.CompileAnimationStyleMetadata(0, lastStepStyles);
            sequence.steps.push(finalStep);
        }
    }
    return sequence;
}
function _populateMapFromKeyWithValue(keys, value) {
    var data = {};
    keys.forEach(function (key) {
        data[key] = value;
    });
    return data;
}
function _normalizeStyleMetadata(entry, stateStyles, errors) {
    var normalizedStyles = [];
    entry.styles.forEach(function (styleEntry) {
        if (lang_1.isString(styleEntry)) {
            collection_1.ListWrapper.addAll(normalizedStyles, _resolveStylesFromState(styleEntry, stateStyles, errors));
        }
        else {
            normalizedStyles.push(styleEntry);
        }
    });
    return normalizedStyles;
}
function _normalizeStyleSteps(entry, stateStyles, errors) {
    var steps = _normalizeStyleStepEntry(entry, stateStyles, errors);
    if (steps.length == 1) {
        return steps[0];
    }
    return new compile_metadata_1.CompileAnimationSequenceMetadata(steps);
}
function _mergeAnimationStyles(stylesList, newItem) {
    if (lang_1.isStringMap(newItem) && stylesList.length > 0) {
        var lastIndex = stylesList.length - 1;
        var lastItem = stylesList[lastIndex];
        if (lang_1.isStringMap(lastItem)) {
            stylesList[lastIndex] = collection_1.StringMapWrapper.merge(lastItem, newItem);
            return;
        }
    }
    stylesList.push(newItem);
}
function _normalizeStyleStepEntry(entry, stateStyles, errors) {
    var steps;
    if (entry instanceof compile_metadata_1.CompileAnimationWithStepsMetadata) {
        steps = entry.steps;
    }
    else {
        return [entry];
    }
    var newSteps = [];
    var combinedStyles;
    steps.forEach(function (step) {
        if (step instanceof compile_metadata_1.CompileAnimationStyleMetadata) {
            // this occurs when a style step is followed by a previous style step
            // or when the first style step is run. We want to concatenate all subsequent
            // style steps together into a single style step such that we have the correct
            // starting keyframe data to pass into the animation player.
            if (!lang_1.isPresent(combinedStyles)) {
                combinedStyles = [];
            }
            _normalizeStyleMetadata(step, stateStyles, errors).forEach(function (entry) {
                _mergeAnimationStyles(combinedStyles, entry);
            });
        }
        else {
            // it is important that we create a metadata entry of the combined styles
            // before we go on an process the animate, sequence or group metadata steps.
            // This will ensure that the AST will have the previous styles painted on
            // screen before any further animations that use the styles take place.
            if (lang_1.isPresent(combinedStyles)) {
                newSteps.push(new compile_metadata_1.CompileAnimationStyleMetadata(0, combinedStyles));
                combinedStyles = null;
            }
            if (step instanceof compile_metadata_1.CompileAnimationAnimateMetadata) {
                // we do not recurse into CompileAnimationAnimateMetadata since
                // those style steps are not going to be squashed
                step.styles.forEach(function (styleMetadata) {
                    styleMetadata.styles = _normalizeStyleMetadata(styleMetadata, stateStyles, errors);
                });
            }
            else if (step instanceof compile_metadata_1.CompileAnimationWithStepsMetadata) {
                var innerSteps = _normalizeStyleStepEntry(step, stateStyles, errors);
                step = step instanceof compile_metadata_1.CompileAnimationGroupMetadata
                    ? new compile_metadata_1.CompileAnimationGroupMetadata(innerSteps)
                    : new compile_metadata_1.CompileAnimationSequenceMetadata(innerSteps);
            }
            newSteps.push(step);
        }
    });
    // this happens when only styles were animated within the sequence
    if (lang_1.isPresent(combinedStyles)) {
        newSteps.push(new compile_metadata_1.CompileAnimationStyleMetadata(0, combinedStyles));
    }
    return newSteps;
}
function _resolveStylesFromState(stateName, stateStyles, errors) {
    var styles = [];
    if (stateName[0] != ':') {
        errors.push(new AnimationParseError("Animation states via styles must be prefixed with a \":\""));
    }
    else {
        var normalizedStateName = stateName.substring(1);
        var value = stateStyles[normalizedStateName];
        if (!lang_1.isPresent(value)) {
            errors.push(new AnimationParseError("Unable to apply styles due to missing a state " + normalizedStateName));
        }
        else {
            value.styles.forEach(function (stylesEntry) {
                if (lang_1.isStringMap(stylesEntry)) {
                    styles.push(stylesEntry);
                }
            });
        }
    }
    return styles;
}
var _AnimationTimings = (function () {
    function _AnimationTimings(duration, delay, easing) {
        this.duration = duration;
        this.delay = delay;
        this.easing = easing;
    }
    return _AnimationTimings;
}());
function _parseAnimationDefinitionAnimation(entry, currentTime, collectedStyles, stateStyles, errors) {
    var ast;
    var playTime = 0;
    var startingTime = currentTime;
    if (entry instanceof compile_metadata_1.CompileAnimationWithStepsMetadata) {
        var maxDuration = 0;
        var steps = [];
        var isGroup = entry instanceof compile_metadata_1.CompileAnimationGroupMetadata;
        var previousStyles;
        entry.steps.forEach(function (entry) {
            // these will get picked up by the next step...
            var time = isGroup ? startingTime : currentTime;
            if (entry instanceof compile_metadata_1.CompileAnimationStyleMetadata) {
                entry.styles.forEach(function (stylesEntry) {
                    // by this point we know that we only have stringmap values
                    var map = stylesEntry;
                    collection_1.StringMapWrapper.forEach(map, function (value, prop) {
                        collectedStyles.insertAtTime(prop, time, value);
                    });
                });
                previousStyles = entry.styles;
                return;
            }
            var innerAst = _parseAnimationDefinitionAnimation(entry, time, collectedStyles, stateStyles, errors);
            if (lang_1.isPresent(previousStyles)) {
                if (entry instanceof compile_metadata_1.CompileAnimationWithStepsMetadata) {
                    var startingStyles = new animation_ast_1.AnimationStylesAst(previousStyles);
                    steps.push(new animation_ast_1.AnimationStepAst(startingStyles, [], 0, 0, ''));
                }
                else {
                    var innerStep = innerAst;
                    collection_1.ListWrapper.addAll(innerStep.startingStyles.styles, previousStyles);
                }
                previousStyles = null;
            }
            var astDuration = innerAst.playTime;
            currentTime += astDuration;
            playTime += astDuration;
            maxDuration = math_1.Math.max(astDuration, maxDuration);
            steps.push(innerAst);
        });
        if (lang_1.isPresent(previousStyles)) {
            var startingStyles = new animation_ast_1.AnimationStylesAst(previousStyles);
            steps.push(new animation_ast_1.AnimationStepAst(startingStyles, [], 0, 0, ''));
        }
        if (isGroup) {
            ast = new animation_ast_1.AnimationGroupAst(steps);
            playTime = maxDuration;
            currentTime = startingTime + playTime;
        }
        else {
            ast = new animation_ast_1.AnimationSequenceAst(steps);
        }
    }
    else if (entry instanceof compile_metadata_1.CompileAnimationAnimateMetadata) {
        var timings = _parseTimeExpression(entry.timings, errors);
        var totalEntries = entry.styles.length;
        var totalOffsets = 0;
        entry.styles.forEach(function (styleEntry) {
            totalOffsets += lang_1.isPresent(styleEntry.offset) ? 1 : 0;
        });
        if (totalOffsets > 0 && totalOffsets < entry.styles.length) {
            errors.push(new AnimationParseError("Not all style() entries contain an offset"));
            totalOffsets = totalEntries;
        }
        var margin = totalOffsets == 0 ? (1 / totalEntries) : 0;
        var keyframes = [];
        var stylesList = [];
        var index = 0;
        entry.styles.forEach(function (styleMetadata) {
            var offset = styleMetadata.offset;
            var keyframeStyles = styleMetadata.styles.map(function (entry) {
                return entry;
            });
            if (!lang_1.isPresent(offset)) {
                offset = index == totalEntries - 1 ? _TERMINAL_KEYFRAME : (margin * index);
            }
            collection_1.ListWrapper.addAll(stylesList, keyframeStyles);
            var keyframe = new animation_ast_1.AnimationKeyframeAst(offset, new animation_ast_1.AnimationStylesAst(keyframeStyles));
            keyframes.push(keyframe);
            index++;
        });
        ast = new animation_ast_1.AnimationStepAst(new animation_ast_1.AnimationStylesAst([]), keyframes, timings.duration, timings.delay, timings.easing);
        playTime = timings.duration + timings.delay;
        currentTime += playTime;
        stylesList.forEach(function (entry) {
            collection_1.StringMapWrapper.forEach(entry, function (value, prop) { collectedStyles.insertAtTime(prop, currentTime, value); });
        });
    }
    else {
        // if the code reaches this stage then an error
        // has already been populated within the _normalizeStyleSteps()
        // operation...
        ast = new animation_ast_1.AnimationStepAst(null, [], 0, 0, '');
    }
    ast.playTime = playTime;
    ast.startTime = startingTime;
    return ast;
}
function _fillAnimationAstStartingKeyframes(ast, collectedStyles, errors) {
    // steps that only contain style will not be filled
    if ((ast instanceof animation_ast_1.AnimationStepAst) && ast.keyframes.length > 0) {
        var keyframes = ast.keyframes;
        if (keyframes.length == 1) {
            var endKeyframe = keyframes[0];
            var startKeyframe = _createStartKeyframeFromEndKeyframe(endKeyframe, ast.startTime, ast.playTime, collectedStyles, errors);
            ast.keyframes = [startKeyframe, endKeyframe];
        }
    }
    else if (ast instanceof animation_ast_1.AnimationWithStepsAst) {
        ast.steps.forEach(function (entry) { return _fillAnimationAstStartingKeyframes(entry, collectedStyles, errors); });
    }
}
function _parseTimeExpression(exp, errors) {
    var regex = /^([\.\d]+)(m?s)(?:\s+([\.\d]+)(m?s))?(?:\s+([-a-z]+))?/gi;
    var duration;
    var delay = 0;
    var easing = null;
    if (lang_1.isString(exp)) {
        var matches = lang_1.RegExpWrapper.firstMatch(regex, exp);
        if (!lang_1.isPresent(matches)) {
            errors.push(new AnimationParseError("The provided timing value \"" + exp + "\" is invalid."));
            return new _AnimationTimings(0, 0, null);
        }
        var durationMatch = lang_1.NumberWrapper.parseFloat(matches[1]);
        var durationUnit = matches[2];
        if (durationUnit == 's') {
            durationMatch *= _ONE_SECOND;
        }
        duration = math_1.Math.floor(durationMatch);
        var delayMatch = matches[3];
        var delayUnit = matches[4];
        if (lang_1.isPresent(delayMatch)) {
            var delayVal = lang_1.NumberWrapper.parseFloat(delayMatch);
            if (lang_1.isPresent(delayUnit) && delayUnit == 's') {
                delayVal *= _ONE_SECOND;
            }
            delay = math_1.Math.floor(delayVal);
        }
        var easingVal = matches[5];
        if (!lang_1.isBlank(easingVal)) {
            easing = easingVal;
        }
    }
    else {
        duration = exp;
    }
    return new _AnimationTimings(duration, delay, easing);
}
function _createStartKeyframeFromEndKeyframe(endKeyframe, startTime, duration, collectedStyles, errors) {
    var values = {};
    var endTime = startTime + duration;
    endKeyframe.styles.styles.forEach(function (styleData) {
        collection_1.StringMapWrapper.forEach(styleData, function (val, prop) {
            if (prop == 'offset')
                return;
            var resultIndex = collectedStyles.indexOfAtOrBeforeTime(prop, startTime);
            var resultEntry, nextEntry, value;
            if (!lang_1.isPresent(resultIndex)) {
                errors.push(new AnimationParseError("The CSS style:value entry \"" + prop + ":" + val + "\" cannot be animated because \"" + prop + "\" has not been styled within a previous style step"));
                value = null;
            }
            else {
                resultEntry = collectedStyles.getByIndex(prop, resultIndex);
                value = resultEntry.value;
                nextEntry = collectedStyles.getByIndex(prop, resultIndex + 1);
            }
            if (lang_1.isPresent(nextEntry) && !nextEntry.matches(endTime, val)) {
                errors.push(new AnimationParseError("The animated CSS property \"" + prop + "\" unexpectedly changes between steps \"" + resultEntry.time + "ms\" and \"" + endTime + "ms\" at \"" + nextEntry.time + "ms\""));
            }
            values[prop] = value;
        });
    });
    return new animation_ast_1.AnimationKeyframeAst(_INITIAL_KEYFRAME, new animation_ast_1.AnimationStylesAst([values]));
}
//# sourceMappingURL=animation_parser.js.map