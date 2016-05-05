"use strict";
var exceptions_1 = require('../facade/exceptions');
var collection_1 = require('../facade/collection');
var lang_1 = require('../facade/lang');
var identifiers_1 = require('../identifiers');
var o = require('../output/output_ast');
var core_1 = require('@angular/core');
var core_private_1 = require('../../core_private');
var animation_parser_1 = require('./animation_parser');
var animation_ast_1 = require('./animation_ast');
var CompiledAnimation = (function () {
    function CompiledAnimation(name, fnStatement, fnVariable) {
        this.name = name;
        this.fnStatement = fnStatement;
        this.fnVariable = fnVariable;
    }
    return CompiledAnimation;
}());
exports.CompiledAnimation = CompiledAnimation;
var AnimationCompiler = (function () {
    function AnimationCompiler() {
    }
    AnimationCompiler.prototype.compileComponent = function (component) {
        var compiledAnimations = [];
        var index = 0;
        component.template.animations.forEach(function (entry) {
            var result = animation_parser_1.parseAnimationEntry(entry);
            if (result.errors.length > 0) {
                var errorMessage = '';
                result.errors.forEach(function (error) { errorMessage += "\n- " + error.msg; });
                // todo (matsko): include the component name when throwing
                throw new exceptions_1.BaseException(("Unable to parse the animation sequence for \"" + entry.name + "\" due to the following errors: ") +
                    errorMessage);
            }
            var factoryName = component.type.name + "_" + entry.name + "_" + index;
            index++;
            var visitor = new _AnimationBuilder(entry.name, factoryName);
            compiledAnimations.push(visitor.build(result.ast));
        });
        return compiledAnimations;
    };
    return AnimationCompiler;
}());
exports.AnimationCompiler = AnimationCompiler;
var _ANIMATION_FACTORY_ELEMENT_VAR = o.variable('element');
var _ANIMATION_FACTORY_RENDERER_VAR = o.variable('renderer');
var _ANIMATION_CURRENT_STATE_VAR = o.variable('currentState');
var _ANIMATION_NEXT_STATE_VAR = o.variable('nextState');
var _ANIMATION_PLAYER_VAR = o.variable('player');
var _ANIMATION_START_STATE_STYLES_VAR = o.variable('startStateStyles');
var _ANIMATION_FINAL_STATE_STYLES_VAR = o.variable('finalStateStyles');
var _ANIMATION_STYLES_LOOKUP = o.variable('animationStateStyles');
var _ANIMATION_UTIL = o.importExpr(identifiers_1.Identifiers.AnimationStyleUtil);
var _AnimationBuilder = (function () {
    function _AnimationBuilder(animationName, factoryName) {
        this.animationName = animationName;
        this.factoryName = factoryName;
    }
    _AnimationBuilder.prototype.visitAnimationStyles = function (ast, stateMap) {
        var stylesEntries = ast.styles.map(function (entry) {
            return o.literalMap(collection_1.StringMapWrapper.keys(entry).map(function (key) { return [key, o.literal(entry[key])]; }));
        });
        return o.importExpr(identifiers_1.Identifiers.AnimationStyles).instantiate([o.literalArr(stylesEntries)]);
    };
    _AnimationBuilder.prototype.visitAnimationKeyframe = function (ast, stateMap) {
        return o.importExpr(identifiers_1.Identifiers.AnimationKeyframe).instantiate([
            o.literal(ast.offset),
            ast.styles.visit(this, stateMap)
        ]);
    };
    _AnimationBuilder.prototype.visitAnimationStep = function (ast, stateMap) {
        var _this = this;
        var startingStyles = ast.startingStyles.visit(this, stateMap);
        var keyframes = ast.keyframes.map(function (keyframeEntry) { return keyframeEntry.visit(_this, stateMap); });
        return _ANIMATION_FACTORY_RENDERER_VAR.callMethod('animate', [
            _ANIMATION_FACTORY_ELEMENT_VAR,
            startingStyles,
            o.literalArr(keyframes),
            o.literal(ast.duration),
            o.literal(ast.delay),
            o.literal(ast.easing)
        ]);
    };
    _AnimationBuilder.prototype.visitAnimationSequence = function (ast, stateMap) {
        var _this = this;
        var playerExprs = ast.steps.map(function (step) { return step.visit(_this, stateMap); });
        return o.importExpr(identifiers_1.Identifiers.AnimationSequencePlayer).instantiate([
            o.literalArr(playerExprs)]);
    };
    _AnimationBuilder.prototype.visitAnimationGroup = function (ast, stateMap) {
        var _this = this;
        var playerExprs = ast.steps.map(function (step) { return step.visit(_this, stateMap); });
        return o.importExpr(identifiers_1.Identifiers.AnimationGroupPlayer).instantiate([
            o.literalArr(playerExprs)]);
    };
    _AnimationBuilder.prototype.visitAnimationStateDeclaration = function (ast, stateMap) {
        var flatStyles = {};
        ast.styles.styles.forEach(function (entry) {
            collection_1.StringMapWrapper.forEach(entry, function (value, key) {
                if (value != core_1.AUTO_STYLE) {
                    flatStyles[key] = value;
                }
            });
        });
        stateMap.registerState(ast.stateName, flatStyles);
    };
    _AnimationBuilder.prototype.visitAnimationStateTransition = function (ast, stateMap) {
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
    };
    _AnimationBuilder.prototype.visitAnimationEntry = function (ast, stateMap) {
        var _this = this;
        var EMPTY_MAP = o.literalMap([]);
        var statements = [];
        statements.push(_ANIMATION_PLAYER_VAR.set(o.NULL_EXPR).toDeclStmt());
        var transitionStatements = [];
        ast.definitions.forEach(function (def) {
            var result = def.visit(_this, stateMap);
            // the declaration state will be applied later
            if (!(def instanceof animation_ast_1.AnimationStateDeclarationAst)) {
                transitionStatements.push(result);
            }
        });
        var lookupMap = [];
        collection_1.StringMapWrapper.forEach(stateMap.states, function (value, stateName) {
            var variableValue = EMPTY_MAP;
            if (lang_1.isPresent(value)) {
                var styleMap_1 = [];
                collection_1.StringMapWrapper.forEach(value, function (value, key) {
                    styleMap_1.push([key, o.literal(value)]);
                });
                variableValue = o.literalMap(styleMap_1);
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
            _ANIMATION_PLAYER_VAR.set(o.importExpr(identifiers_1.Identifiers.NoOpAnimationPlayer).instantiate([])).toStmt()
        ]));
        statements.push(_ANIMATION_PLAYER_VAR.callMethod('onDone', [
            o.fn([], [
                _ANIMATION_FACTORY_RENDERER_VAR.callMethod('setElementStyles', [
                    _ANIMATION_FACTORY_ELEMENT_VAR,
                    o.importExpr(identifiers_1.Identifiers.AnimationStyleUtil).callMethod('balanceStyles', [
                        _ANIMATION_START_STATE_STYLES_VAR,
                        _ANIMATION_FINAL_STATE_STYLES_VAR
                    ])
                ]).toStmt()
            ])
        ]).toStmt());
        statements.push(new o.ReturnStatement(_ANIMATION_PLAYER_VAR));
        return o.fn([
            new o.FnParam(_ANIMATION_FACTORY_RENDERER_VAR.name, o.importType(identifiers_1.Identifiers.Renderer)),
            new o.FnParam(_ANIMATION_FACTORY_ELEMENT_VAR.name, o.DYNAMIC_TYPE),
            new o.FnParam(_ANIMATION_CURRENT_STATE_VAR.name, o.DYNAMIC_TYPE),
            new o.FnParam(_ANIMATION_NEXT_STATE_VAR.name, o.DYNAMIC_TYPE)
        ], statements);
    };
    _AnimationBuilder.prototype.build = function (ast) {
        var stateMap = new _AnimationBuilderStateMap();
        var fnStatement = ast.visit(this, stateMap).toDeclStmt(this.factoryName);
        var fnVariable = o.variable(this.factoryName);
        return new CompiledAnimation(this.animationName, fnStatement, fnVariable);
    };
    return _AnimationBuilder;
}());
var _AnimationBuilderStateMap = (function () {
    function _AnimationBuilderStateMap() {
        this._states = {};
    }
    Object.defineProperty(_AnimationBuilderStateMap.prototype, "states", {
        get: function () { return this._states; },
        enumerable: true,
        configurable: true
    });
    _AnimationBuilderStateMap.prototype.registerState = function (name, value) {
        if (value === void 0) { value = null; }
        var existingEntry = this._states[name];
        if (lang_1.isBlank(existingEntry)) {
            this._states[name] = value;
        }
    };
    return _AnimationBuilderStateMap;
}());
function _compareToAnimationStateExpr(value, animationState) {
    if (animationState == core_private_1.EMPTY_STATE) {
        return value.equals(o.importExpr(identifiers_1.Identifiers.uninitialized));
    }
    else if (animationState == core_private_1.ANY_STATE) {
        return o.not(value.equals(o.importExpr(identifiers_1.Identifiers.uninitialized)));
    }
    else {
        return value.equals(o.literal(animationState));
    }
}
//# sourceMappingURL=animation_compiler.js.map