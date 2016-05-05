import { BaseException } from '../facade/exceptions';
import { StringMapWrapper } from '../facade/collection';
import { isPresent, isBlank } from '../facade/lang';
import { Identifiers } from '../identifiers';
import * as o from '../output/output_ast';
import { AUTO_STYLE } from '@angular/core';
import { ANY_STATE, EMPTY_STATE } from '../../core_private';
import { parseAnimationEntry } from './animation_parser';
import { AnimationStateDeclarationAst } from './animation_ast';
export class CompiledAnimation {
    constructor(name, fnStatement, fnVariable) {
        this.name = name;
        this.fnStatement = fnStatement;
        this.fnVariable = fnVariable;
    }
}
export class AnimationCompiler {
    compileComponent(component) {
        var compiledAnimations = [];
        var index = 0;
        component.template.animations.forEach(entry => {
            var result = parseAnimationEntry(entry);
            if (result.errors.length > 0) {
                var errorMessage = '';
                result.errors.forEach((error) => { errorMessage += "\n- " + error.msg; });
                // todo (matsko): include the component name when throwing
                throw new BaseException(`Unable to parse the animation sequence for "${entry.name}" due to the following errors: ` +
                    errorMessage);
            }
            var factoryName = `${component.type.name}_${entry.name}_${index}`;
            index++;
            var visitor = new _AnimationBuilder(entry.name, factoryName);
            compiledAnimations.push(visitor.build(result.ast));
        });
        return compiledAnimations;
    }
}
var _ANIMATION_FACTORY_ELEMENT_VAR = o.variable('element');
var _ANIMATION_FACTORY_RENDERER_VAR = o.variable('renderer');
var _ANIMATION_CURRENT_STATE_VAR = o.variable('currentState');
var _ANIMATION_NEXT_STATE_VAR = o.variable('nextState');
var _ANIMATION_PLAYER_VAR = o.variable('player');
var _ANIMATION_START_STATE_STYLES_VAR = o.variable('startStateStyles');
var _ANIMATION_FINAL_STATE_STYLES_VAR = o.variable('finalStateStyles');
var _ANIMATION_STYLES_LOOKUP = o.variable('animationStateStyles');
var _ANIMATION_UTIL = o.importExpr(Identifiers.AnimationStyleUtil);
class _AnimationBuilder {
    constructor(animationName, factoryName) {
        this.animationName = animationName;
        this.factoryName = factoryName;
    }
    visitAnimationStyles(ast, stateMap) {
        var stylesEntries = ast.styles.map(entry => {
            return o.literalMap(StringMapWrapper.keys(entry).map(key => [key, o.literal(entry[key])]));
        });
        return o.importExpr(Identifiers.AnimationStyles).instantiate([o.literalArr(stylesEntries)]);
    }
    visitAnimationKeyframe(ast, stateMap) {
        return o.importExpr(Identifiers.AnimationKeyframe).instantiate([
            o.literal(ast.offset),
            ast.styles.visit(this, stateMap)
        ]);
    }
    visitAnimationStep(ast, stateMap) {
        var startingStyles = ast.startingStyles.visit(this, stateMap);
        var keyframes = ast.keyframes.map(keyframeEntry => keyframeEntry.visit(this, stateMap));
        return _ANIMATION_FACTORY_RENDERER_VAR.callMethod('animate', [
            _ANIMATION_FACTORY_ELEMENT_VAR,
            startingStyles,
            o.literalArr(keyframes),
            o.literal(ast.duration),
            o.literal(ast.delay),
            o.literal(ast.easing)
        ]);
    }
    visitAnimationSequence(ast, stateMap) {
        var playerExprs = ast.steps.map(step => step.visit(this, stateMap));
        return o.importExpr(Identifiers.AnimationSequencePlayer).instantiate([
            o.literalArr(playerExprs)]);
    }
    visitAnimationGroup(ast, stateMap) {
        var playerExprs = ast.steps.map(step => step.visit(this, stateMap));
        return o.importExpr(Identifiers.AnimationGroupPlayer).instantiate([
            o.literalArr(playerExprs)]);
    }
    visitAnimationStateDeclaration(ast, stateMap) {
        var flatStyles = {};
        ast.styles.styles.forEach(entry => {
            StringMapWrapper.forEach(entry, (value, key) => {
                if (value != AUTO_STYLE) {
                    flatStyles[key] = value;
                }
            });
        });
        stateMap.registerState(ast.stateName, flatStyles);
    }
    visitAnimationStateTransition(ast, stateMap) {
        var playerExpr = ast.animation.visit(this, stateMap);
        stateMap.registerState(ast.fromState);
        stateMap.registerState(ast.toState);
        return new o.IfStmt(_ANIMATION_PLAYER_VAR.equals(o.NULL_EXPR)
            .and(_compareToAnimationStateExpr(_ANIMATION_CURRENT_STATE_VAR, ast.fromState))
            .and(_compareToAnimationStateExpr(_ANIMATION_NEXT_STATE_VAR, ast.toState)), [
            _ANIMATION_FACTORY_RENDERER_VAR.callMethod('setElementStyles', [
                _ANIMATION_FACTORY_ELEMENT_VAR,
                _ANIMATION_UTIL.callMethod('clearStyles', [_ANIMATION_START_STATE_STYLES_VAR]),
            ]).toStmt(),
            _ANIMATION_PLAYER_VAR.set(playerExpr).toStmt()
        ]);
    }
    visitAnimationEntry(ast, stateMap) {
        var EMPTY_MAP = o.literalMap([]);
        var statements = [];
        statements.push(_ANIMATION_PLAYER_VAR.set(o.NULL_EXPR).toDeclStmt());
        var transitionStatements = [];
        ast.definitions.forEach(def => {
            var result = def.visit(this, stateMap);
            // the declaration state will be applied later
            if (!(def instanceof AnimationStateDeclarationAst)) {
                transitionStatements.push(result);
            }
        });
        var lookupMap = [];
        StringMapWrapper.forEach(stateMap.states, (value, stateName) => {
            var variableValue = EMPTY_MAP;
            if (isPresent(value)) {
                let styleMap = [];
                StringMapWrapper.forEach(value, (value, key) => {
                    styleMap.push([key, o.literal(value)]);
                });
                variableValue = o.literalMap(styleMap);
            }
            lookupMap.push([stateName, variableValue]);
        });
        statements.push(_ANIMATION_STYLES_LOOKUP.set(_ANIMATION_UTIL.instantiate([o.literalMap(lookupMap)])).toDeclStmt());
        statements.push(_ANIMATION_START_STATE_STYLES_VAR.set(_ANIMATION_STYLES_LOOKUP.callMethod('lookup', [_ANIMATION_CURRENT_STATE_VAR])).toDeclStmt());
        statements.push(_ANIMATION_FINAL_STATE_STYLES_VAR.set(_ANIMATION_STYLES_LOOKUP.callMethod('lookup', [_ANIMATION_NEXT_STATE_VAR])).toDeclStmt());
        statements = statements.concat(transitionStatements);
        statements.push(new o.IfStmt(_ANIMATION_PLAYER_VAR.equals(o.NULL_EXPR), [
            _ANIMATION_FACTORY_RENDERER_VAR.callMethod('setElementStyles', [
                _ANIMATION_FACTORY_ELEMENT_VAR,
                _ANIMATION_UTIL.callMethod('clearStyles', [_ANIMATION_START_STATE_STYLES_VAR]),
            ]).toStmt(),
            _ANIMATION_PLAYER_VAR.set(o.importExpr(Identifiers.NoOpAnimationPlayer).instantiate([])).toStmt()
        ]));
        statements.push(_ANIMATION_PLAYER_VAR.callMethod('onDone', [
            o.fn([], [
                _ANIMATION_FACTORY_RENDERER_VAR.callMethod('setElementStyles', [
                    _ANIMATION_FACTORY_ELEMENT_VAR,
                    o.importExpr(Identifiers.AnimationStyleUtil).callMethod('balanceStyles', [
                        _ANIMATION_START_STATE_STYLES_VAR,
                        _ANIMATION_FINAL_STATE_STYLES_VAR
                    ])
                ]).toStmt()
            ])
        ]).toStmt());
        statements.push(new o.ReturnStatement(_ANIMATION_PLAYER_VAR));
        return o.fn([
            new o.FnParam(_ANIMATION_FACTORY_RENDERER_VAR.name, o.importType(Identifiers.Renderer)),
            new o.FnParam(_ANIMATION_FACTORY_ELEMENT_VAR.name, o.DYNAMIC_TYPE),
            new o.FnParam(_ANIMATION_CURRENT_STATE_VAR.name, o.DYNAMIC_TYPE),
            new o.FnParam(_ANIMATION_NEXT_STATE_VAR.name, o.DYNAMIC_TYPE)
        ], statements);
    }
    build(ast) {
        var stateMap = new _AnimationBuilderStateMap();
        var fnStatement = ast.visit(this, stateMap).toDeclStmt(this.factoryName);
        var fnVariable = o.variable(this.factoryName);
        return new CompiledAnimation(this.animationName, fnStatement, fnVariable);
    }
}
class _AnimationBuilderStateMap {
    constructor() {
        this._states = {};
    }
    get states() { return this._states; }
    registerState(name, value = null) {
        var existingEntry = this._states[name];
        if (isBlank(existingEntry)) {
            this._states[name] = value;
        }
    }
}
function _compareToAnimationStateExpr(value, animationState) {
    if (animationState == EMPTY_STATE) {
        return value.equals(o.importExpr(Identifiers.uninitialized));
    }
    else if (animationState == ANY_STATE) {
        return o.not(value.equals(o.importExpr(Identifiers.uninitialized)));
    }
    else {
        return value.equals(o.literal(animationState));
    }
}
//# sourceMappingURL=animation_compiler.js.map