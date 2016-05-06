import { ListWrapper, StringMapWrapper } from '../facade/collection';
import { Math } from '../facade/math';
import { RegExpWrapper, isArray, isPresent, isBlank, isString, isStringMap, NumberWrapper } from '../facade/lang';
import { CompileAnimationStateDeclarationMetadata, CompileAnimationWithStepsMetadata, CompileAnimationStyleMetadata, CompileAnimationAnimateMetadata, CompileAnimationGroupMetadata, CompileAnimationSequenceMetadata } from '../compile_metadata';
import { AUTO_STYLE, FINAL_STATE_ALIAS } from '@angular/core';
import { AnimationEntryAst, AnimationStateTransitionAst, AnimationStateDeclarationAst, AnimationKeyframeAst, AnimationStylesAst, AnimationWithStepsAst, AnimationSequenceAst, AnimationGroupAst, AnimationStepAst } from './animation_ast';
import { StylesCollection } from './styles_collection';
import { ParseError } from '../parse_util';
const _BASE_TEN = 10;
const _INITIAL_KEYFRAME = 0;
const _TERMINAL_KEYFRAME = 1;
const _ONE_SECOND = 1000;
export class AnimationParseError extends ParseError {
    constructor(message) {
        super(null, message);
    }
    toString() { return `${this.msg}`; }
}
export class ParsedAnimationResult {
    constructor(ast, errors) {
        this.ast = ast;
        this.errors = errors;
    }
}
export function parseAnimationEntry(entry) {
    var errors = [];
    var stateStyles = {};
    var definitions = [];
    var transitions = [];
    entry.definitions.forEach(def => {
        if (def instanceof CompileAnimationStateDeclarationMetadata) {
            var stateAst = _parseAnimationStateDeclaration(def, errors);
            definitions.push(stateAst);
            stateStyles[stateAst.stateName] = stateAst.styles;
        }
        else {
            transitions.push(def);
        }
    });
    transitions.forEach(transDef => {
        var transAst = _parseAnimationStateTransition(transDef, stateStyles, errors);
        definitions.push(transAst);
    });
    var ast = new AnimationEntryAst(entry.name, definitions);
    return new ParsedAnimationResult(ast, errors);
}
function _parseAnimationStateDeclaration(stateMetadata, errors) {
    var styleValues = [];
    stateMetadata.styles.styles.forEach(stylesEntry => {
        // TODO (matsko): change this when we get CSS class integration support
        if (isStringMap(stylesEntry)) {
            styleValues.push(stylesEntry);
        }
        else {
            errors.push(new AnimationParseError(`State based animations cannot contain references to other states`));
        }
    });
    var defStyles = new AnimationStylesAst(styleValues);
    return new AnimationStateDeclarationAst(stateMetadata.stateName, defStyles);
}
function _parseAnimationStateTransition(transitionStateMetadata, stateStyles, errors) {
    var styles = new StylesCollection();
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
    return new AnimationStateTransitionAst(transitionExpr.fromState, transitionExpr.toState, animationAst);
}
class _ParsedTransitionExprResult {
    constructor(fromState, toState) {
        this.fromState = fromState;
        this.toState = toState;
    }
}
function _parseAnimationTransitionExpr(eventStr, errors) {
    var stateTokens = eventStr.split(/\s*[=-]>\s*/g);
    if (!isPresent(stateTokens) || stateTokens.length < 2) {
        errors.push(new AnimationParseError(`the provided ${eventStr} is not of a supported format`));
    }
    return new _ParsedTransitionExprResult(stateTokens[0], stateTokens[1]);
}
function _fetchSylesFromState(stateName, stateStyles) {
    var entry = stateStyles[stateName];
    if (isPresent(entry)) {
        var styles = entry.styles;
        return new CompileAnimationStyleMetadata(0, styles);
    }
    return null;
}
function _computeLhsSetDifference(valuesA, valuesB) {
    var lhs = [];
    var rhs = [];
    var allValues = {};
    valuesA.forEach(value => {
        allValues[value] = 1;
    });
    valuesB.forEach(value => {
        var val = allValues[value];
        val = isPresent(val) ? val : 0;
        allValues[value] = val - 1;
    });
    StringMapWrapper.forEach(allValues, (count, value) => {
        if (count == -1)
            lhs.push(value);
        else if (count == 1)
            rhs.push(value);
    });
    return [lhs, rhs];
}
function _flattenStateStyles(styles) {
    var flatStyles = {};
    styles.forEach(styleEntry => {
        if (isStringMap(styleEntry)) {
            StringMapWrapper.forEach(styleEntry, (value, prop) => {
                flatStyles[prop] = value;
            });
        }
    });
    return flatStyles;
}
function _fillStartAndEndStateSteps(entry, fromState, toState, stateStyles, errors) {
    var sequence;
    var finalStep = null;
    if (entry instanceof CompileAnimationSequenceMetadata) {
        sequence = entry;
        finalStep = sequence.steps[sequence.steps.length - 1];
    }
    else {
        var entries = isArray(entry)
            ? entry
            : [entry];
        sequence = new CompileAnimationSequenceMetadata(entries);
    }
    var fromStateStyles = _fetchSylesFromState(fromState, stateStyles);
    var toStateStyles = _fetchSylesFromState(toState, stateStyles);
    var fromStyles = isPresent(fromStateStyles) ? _flattenStateStyles(fromStateStyles.styles) : {};
    var toStyles = isPresent(toStateStyles) ? _flattenStateStyles(toStateStyles.styles) : {};
    var fromStyleProps = StringMapWrapper.keys(fromStyles);
    var toStyleProps = StringMapWrapper.keys(toStyles);
    var missingStyles = _computeLhsSetDifference(fromStyleProps, toStyleProps);
    var missingFromStyles = missingStyles[0];
    var missingToStyles = missingStyles[1];
    let firstStepStyles = fromStyleProps.length > 0 ? [fromStyles] : [];
    if (missingFromStyles.length > 0) {
        firstStepStyles.push(_populateMapFromKeyWithValue(missingFromStyles, AUTO_STYLE));
    }
    if (firstStepStyles.length > 0) {
        let firstStep = new CompileAnimationStyleMetadata(0, firstStepStyles);
        ListWrapper.insert(sequence.steps, 0, firstStep);
    }
    var lastStepStyles = toStyleProps.length > 0 ? [toStyles] : [];
    if (missingToStyles.length > 0) {
        lastStepStyles.push(_populateMapFromKeyWithValue(missingToStyles, AUTO_STYLE));
    }
    // look at the final step
    // if it is an animate step where the final state value matches then apply
    if (lastStepStyles.length > 0) {
        if (isPresent(finalStep) && (finalStep instanceof CompileAnimationAnimateMetadata)) {
            let animateStep = finalStep;
            let animateStyles = animateStep.styles;
            // search through each of the style steps in the last animate step to
            // see // if the final state is referenced. If so then replace the
            // final state data with the states style values
            var finalStateDetected = false;
            animateStyles.forEach(styleMetadata => {
                var finalStateIndex = -1;
                var arr = styleMetadata.styles;
                for (var j = 0; j < arr.length; j++) {
                    var styleEntry = arr[j];
                    if (styleEntry[0] == ':') {
                        var stateName = styleEntry.substring(1);
                        if (stateName == FINAL_STATE_ALIAS || stateName == toState) {
                            finalStateDetected = true;
                            finalStateIndex = j;
                            break;
                        }
                    }
                }
                if (finalStateIndex >= 0) {
                    lastStepStyles.forEach((entry, count) => {
                        if (count == 0) {
                            arr[finalStateIndex] = entry;
                        }
                        else {
                            ListWrapper.insert(arr, finalStateIndex + count, entry);
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
        if (!isPresent(finalStep)) {
            finalStep = new CompileAnimationStyleMetadata(0, lastStepStyles);
            sequence.steps.push(finalStep);
        }
    }
    return sequence;
}
function _populateMapFromKeyWithValue(keys, value) {
    var data = {};
    keys.forEach(key => {
        data[key] = value;
    });
    return data;
}
function _normalizeStyleMetadata(entry, stateStyles, errors) {
    var normalizedStyles = [];
    entry.styles.forEach(styleEntry => {
        if (isString(styleEntry)) {
            ListWrapper.addAll(normalizedStyles, _resolveStylesFromState(styleEntry, stateStyles, errors));
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
    return new CompileAnimationSequenceMetadata(steps);
}
function _mergeAnimationStyles(stylesList, newItem) {
    if (isStringMap(newItem) && stylesList.length > 0) {
        var lastIndex = stylesList.length - 1;
        var lastItem = stylesList[lastIndex];
        if (isStringMap(lastItem)) {
            stylesList[lastIndex] = StringMapWrapper.merge(lastItem, newItem);
            return;
        }
    }
    stylesList.push(newItem);
}
function _normalizeStyleStepEntry(entry, stateStyles, errors) {
    var steps;
    if (entry instanceof CompileAnimationWithStepsMetadata) {
        steps = entry.steps;
    }
    else {
        return [entry];
    }
    var newSteps = [];
    var combinedStyles;
    steps.forEach(step => {
        if (step instanceof CompileAnimationStyleMetadata) {
            // this occurs when a style step is followed by a previous style step
            // or when the first style step is run. We want to concatenate all subsequent
            // style steps together into a single style step such that we have the correct
            // starting keyframe data to pass into the animation player.
            if (!isPresent(combinedStyles)) {
                combinedStyles = [];
            }
            _normalizeStyleMetadata(step, stateStyles, errors).forEach(entry => {
                _mergeAnimationStyles(combinedStyles, entry);
            });
        }
        else {
            // it is important that we create a metadata entry of the combined styles
            // before we go on an process the animate, sequence or group metadata steps.
            // This will ensure that the AST will have the previous styles painted on
            // screen before any further animations that use the styles take place.
            if (isPresent(combinedStyles)) {
                newSteps.push(new CompileAnimationStyleMetadata(0, combinedStyles));
                combinedStyles = null;
            }
            if (step instanceof CompileAnimationAnimateMetadata) {
                // we do not recurse into CompileAnimationAnimateMetadata since
                // those style steps are not going to be squashed
                step.styles.forEach(styleMetadata => {
                    styleMetadata.styles = _normalizeStyleMetadata(styleMetadata, stateStyles, errors);
                });
            }
            else if (step instanceof CompileAnimationWithStepsMetadata) {
                let innerSteps = _normalizeStyleStepEntry(step, stateStyles, errors);
                step = step instanceof CompileAnimationGroupMetadata
                    ? new CompileAnimationGroupMetadata(innerSteps)
                    : new CompileAnimationSequenceMetadata(innerSteps);
            }
            newSteps.push(step);
        }
    });
    // this happens when only styles were animated within the sequence
    if (isPresent(combinedStyles)) {
        newSteps.push(new CompileAnimationStyleMetadata(0, combinedStyles));
    }
    return newSteps;
}
function _resolveStylesFromState(stateName, stateStyles, errors) {
    var styles = [];
    if (stateName[0] != ':') {
        errors.push(new AnimationParseError(`Animation states via styles must be prefixed with a ":"`));
    }
    else {
        var normalizedStateName = stateName.substring(1);
        var value = stateStyles[normalizedStateName];
        if (!isPresent(value)) {
            errors.push(new AnimationParseError(`Unable to apply styles due to missing a state ${normalizedStateName}`));
        }
        else {
            value.styles.forEach(stylesEntry => {
                if (isStringMap(stylesEntry)) {
                    styles.push(stylesEntry);
                }
            });
        }
    }
    return styles;
}
class _AnimationTimings {
    constructor(duration, delay, easing) {
        this.duration = duration;
        this.delay = delay;
        this.easing = easing;
    }
}
function _parseAnimationDefinitionAnimation(entry, currentTime, collectedStyles, stateStyles, errors) {
    var ast;
    var playTime = 0;
    var startingTime = currentTime;
    if (entry instanceof CompileAnimationWithStepsMetadata) {
        var maxDuration = 0;
        var steps = [];
        var isGroup = entry instanceof CompileAnimationGroupMetadata;
        var previousStyles;
        entry.steps.forEach(entry => {
            // these will get picked up by the next step...
            var time = isGroup ? startingTime : currentTime;
            if (entry instanceof CompileAnimationStyleMetadata) {
                entry.styles.forEach(stylesEntry => {
                    // by this point we know that we only have stringmap values
                    var map = stylesEntry;
                    StringMapWrapper.forEach(map, (value, prop) => {
                        collectedStyles.insertAtTime(prop, time, value);
                    });
                });
                previousStyles = entry.styles;
                return;
            }
            var innerAst = _parseAnimationDefinitionAnimation(entry, time, collectedStyles, stateStyles, errors);
            if (isPresent(previousStyles)) {
                if (entry instanceof CompileAnimationWithStepsMetadata) {
                    let startingStyles = new AnimationStylesAst(previousStyles);
                    steps.push(new AnimationStepAst(startingStyles, [], 0, 0, ''));
                }
                else {
                    var innerStep = innerAst;
                    ListWrapper.addAll(innerStep.startingStyles.styles, previousStyles);
                }
                previousStyles = null;
            }
            var astDuration = innerAst.playTime;
            currentTime += astDuration;
            playTime += astDuration;
            maxDuration = Math.max(astDuration, maxDuration);
            steps.push(innerAst);
        });
        if (isPresent(previousStyles)) {
            let startingStyles = new AnimationStylesAst(previousStyles);
            steps.push(new AnimationStepAst(startingStyles, [], 0, 0, ''));
        }
        if (isGroup) {
            ast = new AnimationGroupAst(steps);
            playTime = maxDuration;
            currentTime = startingTime + playTime;
        }
        else {
            ast = new AnimationSequenceAst(steps);
        }
    }
    else if (entry instanceof CompileAnimationAnimateMetadata) {
        var timings = _parseTimeExpression(entry.timings, errors);
        var totalEntries = entry.styles.length;
        var totalOffsets = 0;
        entry.styles.forEach(styleEntry => {
            totalOffsets += isPresent(styleEntry.offset) ? 1 : 0;
        });
        if (totalOffsets > 0 && totalOffsets < entry.styles.length) {
            errors.push(new AnimationParseError(`Not all style() entries contain an offset`));
            totalOffsets = totalEntries;
        }
        var margin = totalOffsets == 0 ? (1 / totalEntries) : 0;
        var keyframes = [];
        var stylesList = [];
        var index = 0;
        entry.styles.forEach(styleMetadata => {
            var offset = styleMetadata.offset;
            var keyframeStyles = styleMetadata.styles.map(entry => {
                return entry;
            });
            if (!isPresent(offset)) {
                offset = index == totalEntries - 1 ? _TERMINAL_KEYFRAME : (margin * index);
            }
            ListWrapper.addAll(stylesList, keyframeStyles);
            var keyframe = new AnimationKeyframeAst(offset, new AnimationStylesAst(keyframeStyles));
            keyframes.push(keyframe);
            index++;
        });
        ast = new AnimationStepAst(new AnimationStylesAst([]), keyframes, timings.duration, timings.delay, timings.easing);
        playTime = timings.duration + timings.delay;
        currentTime += playTime;
        stylesList.forEach(entry => {
            StringMapWrapper.forEach(entry, (value, prop) => { collectedStyles.insertAtTime(prop, currentTime, value); });
        });
    }
    else {
        // if the code reaches this stage then an error
        // has already been populated within the _normalizeStyleSteps()
        // operation...
        ast = new AnimationStepAst(null, [], 0, 0, '');
    }
    ast.playTime = playTime;
    ast.startTime = startingTime;
    return ast;
}
function _fillAnimationAstStartingKeyframes(ast, collectedStyles, errors) {
    // steps that only contain style will not be filled
    if ((ast instanceof AnimationStepAst) && ast.keyframes.length > 0) {
        var keyframes = ast.keyframes;
        if (keyframes.length == 1) {
            var endKeyframe = keyframes[0];
            var startKeyframe = _createStartKeyframeFromEndKeyframe(endKeyframe, ast.startTime, ast.playTime, collectedStyles, errors);
            ast.keyframes = [startKeyframe, endKeyframe];
        }
    }
    else if (ast instanceof AnimationWithStepsAst) {
        ast.steps.forEach(entry => _fillAnimationAstStartingKeyframes(entry, collectedStyles, errors));
    }
}
function _parseTimeExpression(exp, errors) {
    var regex = /^([\.\d]+)(m?s)(?:\s+([\.\d]+)(m?s))?(?:\s+([-a-z]+))?/gi;
    var duration;
    var delay = 0;
    var easing = null;
    if (isString(exp)) {
        var matches = RegExpWrapper.firstMatch(regex, exp);
        if (!isPresent(matches)) {
            errors.push(new AnimationParseError(`The provided timing value "${exp}" is invalid.`));
            return new _AnimationTimings(0, 0, null);
        }
        var durationMatch = NumberWrapper.parseFloat(matches[1]);
        var durationUnit = matches[2];
        if (durationUnit == 's') {
            durationMatch *= _ONE_SECOND;
        }
        duration = Math.floor(durationMatch);
        var delayMatch = matches[3];
        var delayUnit = matches[4];
        if (isPresent(delayMatch)) {
            var delayVal = NumberWrapper.parseFloat(delayMatch);
            if (isPresent(delayUnit) && delayUnit == 's') {
                delayVal *= _ONE_SECOND;
            }
            delay = Math.floor(delayVal);
        }
        var easingVal = matches[5];
        if (!isBlank(easingVal)) {
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
    endKeyframe.styles.styles.forEach((styleData) => {
        StringMapWrapper.forEach(styleData, (val, prop) => {
            if (prop == 'offset')
                return;
            var resultIndex = collectedStyles.indexOfAtOrBeforeTime(prop, startTime);
            var resultEntry, nextEntry, value;
            if (!isPresent(resultIndex)) {
                errors.push(new AnimationParseError(`The CSS style:value entry "${prop}:${val}" cannot be animated because "${prop}" has not been styled within a previous style step`));
                value = null;
            }
            else {
                resultEntry = collectedStyles.getByIndex(prop, resultIndex);
                value = resultEntry.value;
                nextEntry = collectedStyles.getByIndex(prop, resultIndex + 1);
            }
            if (isPresent(nextEntry) && !nextEntry.matches(endTime, val)) {
                errors.push(new AnimationParseError(`The animated CSS property "${prop}" unexpectedly changes between steps "${resultEntry.time}ms" and "${endTime}ms" at "${nextEntry.time}ms"`));
            }
            values[prop] = value;
        });
    });
    return new AnimationKeyframeAst(_INITIAL_KEYFRAME, new AnimationStylesAst([values]));
}
//# sourceMappingURL=animation_parser.js.map