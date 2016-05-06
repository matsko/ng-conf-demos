(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';/**
 * @module
 * @description
 * The `di` module provides dependency injection container services.
 */
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
var metadata_1 = require('./di/metadata');
exports.InjectMetadata = metadata_1.InjectMetadata;
exports.OptionalMetadata = metadata_1.OptionalMetadata;
exports.InjectableMetadata = metadata_1.InjectableMetadata;
exports.SelfMetadata = metadata_1.SelfMetadata;
exports.HostMetadata = metadata_1.HostMetadata;
exports.SkipSelfMetadata = metadata_1.SkipSelfMetadata;
exports.DependencyMetadata = metadata_1.DependencyMetadata;
// we have to reexport * because Dart and TS export two different sets of types
__export(require('./di/decorators'));
var forward_ref_1 = require('./di/forward_ref');
exports.forwardRef = forward_ref_1.forwardRef;
exports.resolveForwardRef = forward_ref_1.resolveForwardRef;
var injector_1 = require('./di/injector');
exports.Injector = injector_1.Injector;
var provider_1 = require('./di/provider');
exports.Binding = provider_1.Binding;
exports.ProviderBuilder = provider_1.ProviderBuilder;
exports.ResolvedFactory = provider_1.ResolvedFactory;
exports.Dependency = provider_1.Dependency;
exports.bind = provider_1.bind;
exports.Provider = provider_1.Provider;
exports.provide = provider_1.provide;
var key_1 = require('./di/key');
exports.Key = key_1.Key;
var exceptions_1 = require('./di/exceptions');
exports.NoProviderError = exceptions_1.NoProviderError;
exports.AbstractProviderError = exceptions_1.AbstractProviderError;
exports.CyclicDependencyError = exceptions_1.CyclicDependencyError;
exports.InstantiationError = exceptions_1.InstantiationError;
exports.InvalidProviderError = exceptions_1.InvalidProviderError;
exports.NoAnnotationError = exceptions_1.NoAnnotationError;
exports.OutOfBoundsError = exceptions_1.OutOfBoundsError;
var opaque_token_1 = require('./di/opaque_token');
exports.OpaqueToken = opaque_token_1.OpaqueToken;
},{"./di/decorators":2,"./di/exceptions":3,"./di/forward_ref":4,"./di/injector":5,"./di/key":6,"./di/metadata":7,"./di/opaque_token":8,"./di/provider":9}],2:[function(require,module,exports){
'use strict';var metadata_1 = require('./metadata');
var decorators_1 = require('../util/decorators');
/**
 * Factory for creating {@link InjectMetadata}.
 */
exports.Inject = decorators_1.makeParamDecorator(metadata_1.InjectMetadata);
/**
 * Factory for creating {@link OptionalMetadata}.
 */
exports.Optional = decorators_1.makeParamDecorator(metadata_1.OptionalMetadata);
/**
 * Factory for creating {@link InjectableMetadata}.
 */
exports.Injectable = decorators_1.makeDecorator(metadata_1.InjectableMetadata);
/**
 * Factory for creating {@link SelfMetadata}.
 */
exports.Self = decorators_1.makeParamDecorator(metadata_1.SelfMetadata);
/**
 * Factory for creating {@link HostMetadata}.
 */
exports.Host = decorators_1.makeParamDecorator(metadata_1.HostMetadata);
/**
 * Factory for creating {@link SkipSelfMetadata}.
 */
exports.SkipSelf = decorators_1.makeParamDecorator(metadata_1.SkipSelfMetadata);
},{"../util/decorators":13,"./metadata":7}],3:[function(require,module,exports){
'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var collection_1 = require('angular2/src/facade/collection');
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
function findFirstClosedCycle(keys) {
    var res = [];
    for (var i = 0; i < keys.length; ++i) {
        if (collection_1.ListWrapper.contains(res, keys[i])) {
            res.push(keys[i]);
            return res;
        }
        else {
            res.push(keys[i]);
        }
    }
    return res;
}
function constructResolvingPath(keys) {
    if (keys.length > 1) {
        var reversed = findFirstClosedCycle(collection_1.ListWrapper.reversed(keys));
        var tokenStrs = reversed.map(function (k) { return lang_1.stringify(k.token); });
        return " (" + tokenStrs.join(' -> ') + ")";
    }
    else {
        return "";
    }
}
/**
 * Base class for all errors arising from misconfigured providers.
 */
var AbstractProviderError = (function (_super) {
    __extends(AbstractProviderError, _super);
    function AbstractProviderError(injector, key, constructResolvingMessage) {
        _super.call(this, "DI Exception");
        this.keys = [key];
        this.injectors = [injector];
        this.constructResolvingMessage = constructResolvingMessage;
        this.message = this.constructResolvingMessage(this.keys);
    }
    AbstractProviderError.prototype.addKey = function (injector, key) {
        this.injectors.push(injector);
        this.keys.push(key);
        this.message = this.constructResolvingMessage(this.keys);
    };
    Object.defineProperty(AbstractProviderError.prototype, "context", {
        get: function () { return this.injectors[this.injectors.length - 1].debugContext(); },
        enumerable: true,
        configurable: true
    });
    return AbstractProviderError;
})(exceptions_1.BaseException);
exports.AbstractProviderError = AbstractProviderError;
/**
 * Thrown when trying to retrieve a dependency by `Key` from {@link Injector}, but the
 * {@link Injector} does not have a {@link Provider} for {@link Key}.
 *
 * ### Example ([live demo](http://plnkr.co/edit/vq8D3FRB9aGbnWJqtEPE?p=preview))
 *
 * ```typescript
 * class A {
 *   constructor(b:B) {}
 * }
 *
 * expect(() => Injector.resolveAndCreate([A])).toThrowError();
 * ```
 */
var NoProviderError = (function (_super) {
    __extends(NoProviderError, _super);
    function NoProviderError(injector, key) {
        _super.call(this, injector, key, function (keys) {
            var first = lang_1.stringify(collection_1.ListWrapper.first(keys).token);
            return "No provider for " + first + "!" + constructResolvingPath(keys);
        });
    }
    return NoProviderError;
})(AbstractProviderError);
exports.NoProviderError = NoProviderError;
/**
 * Thrown when dependencies form a cycle.
 *
 * ### Example ([live demo](http://plnkr.co/edit/wYQdNos0Tzql3ei1EV9j?p=info))
 *
 * ```typescript
 * var injector = Injector.resolveAndCreate([
 *   provide("one", {useFactory: (two) => "two", deps: [[new Inject("two")]]}),
 *   provide("two", {useFactory: (one) => "one", deps: [[new Inject("one")]]})
 * ]);
 *
 * expect(() => injector.get("one")).toThrowError();
 * ```
 *
 * Retrieving `A` or `B` throws a `CyclicDependencyError` as the graph above cannot be constructed.
 */
var CyclicDependencyError = (function (_super) {
    __extends(CyclicDependencyError, _super);
    function CyclicDependencyError(injector, key) {
        _super.call(this, injector, key, function (keys) {
            return "Cannot instantiate cyclic dependency!" + constructResolvingPath(keys);
        });
    }
    return CyclicDependencyError;
})(AbstractProviderError);
exports.CyclicDependencyError = CyclicDependencyError;
/**
 * Thrown when a constructing type returns with an Error.
 *
 * The `InstantiationError` class contains the original error plus the dependency graph which caused
 * this object to be instantiated.
 *
 * ### Example ([live demo](http://plnkr.co/edit/7aWYdcqTQsP0eNqEdUAf?p=preview))
 *
 * ```typescript
 * class A {
 *   constructor() {
 *     throw new Error('message');
 *   }
 * }
 *
 * var injector = Injector.resolveAndCreate([A]);

 * try {
 *   injector.get(A);
 * } catch (e) {
 *   expect(e instanceof InstantiationError).toBe(true);
 *   expect(e.originalException.message).toEqual("message");
 *   expect(e.originalStack).toBeDefined();
 * }
 * ```
 */
var InstantiationError = (function (_super) {
    __extends(InstantiationError, _super);
    function InstantiationError(injector, originalException, originalStack, key) {
        _super.call(this, "DI Exception", originalException, originalStack, null);
        this.keys = [key];
        this.injectors = [injector];
    }
    InstantiationError.prototype.addKey = function (injector, key) {
        this.injectors.push(injector);
        this.keys.push(key);
    };
    Object.defineProperty(InstantiationError.prototype, "wrapperMessage", {
        get: function () {
            var first = lang_1.stringify(collection_1.ListWrapper.first(this.keys).token);
            return "Error during instantiation of " + first + "!" + constructResolvingPath(this.keys) + ".";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(InstantiationError.prototype, "causeKey", {
        get: function () { return this.keys[0]; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(InstantiationError.prototype, "context", {
        get: function () { return this.injectors[this.injectors.length - 1].debugContext(); },
        enumerable: true,
        configurable: true
    });
    return InstantiationError;
})(exceptions_1.WrappedException);
exports.InstantiationError = InstantiationError;
/**
 * Thrown when an object other then {@link Provider} (or `Type`) is passed to {@link Injector}
 * creation.
 *
 * ### Example ([live demo](http://plnkr.co/edit/YatCFbPAMCL0JSSQ4mvH?p=preview))
 *
 * ```typescript
 * expect(() => Injector.resolveAndCreate(["not a type"])).toThrowError();
 * ```
 */
var InvalidProviderError = (function (_super) {
    __extends(InvalidProviderError, _super);
    function InvalidProviderError(provider) {
        _super.call(this, "Invalid provider - only instances of Provider and Type are allowed, got: " +
            provider.toString());
    }
    return InvalidProviderError;
})(exceptions_1.BaseException);
exports.InvalidProviderError = InvalidProviderError;
/**
 * Thrown when the class has no annotation information.
 *
 * Lack of annotation information prevents the {@link Injector} from determining which dependencies
 * need to be injected into the constructor.
 *
 * ### Example ([live demo](http://plnkr.co/edit/rHnZtlNS7vJOPQ6pcVkm?p=preview))
 *
 * ```typescript
 * class A {
 *   constructor(b) {}
 * }
 *
 * expect(() => Injector.resolveAndCreate([A])).toThrowError();
 * ```
 *
 * This error is also thrown when the class not marked with {@link Injectable} has parameter types.
 *
 * ```typescript
 * class B {}
 *
 * class A {
 *   constructor(b:B) {} // no information about the parameter types of A is available at runtime.
 * }
 *
 * expect(() => Injector.resolveAndCreate([A,B])).toThrowError();
 * ```
 */
var NoAnnotationError = (function (_super) {
    __extends(NoAnnotationError, _super);
    function NoAnnotationError(typeOrFunc, params) {
        _super.call(this, NoAnnotationError._genMessage(typeOrFunc, params));
    }
    NoAnnotationError._genMessage = function (typeOrFunc, params) {
        var signature = [];
        for (var i = 0, ii = params.length; i < ii; i++) {
            var parameter = params[i];
            if (lang_1.isBlank(parameter) || parameter.length == 0) {
                signature.push('?');
            }
            else {
                signature.push(parameter.map(lang_1.stringify).join(' '));
            }
        }
        return "Cannot resolve all parameters for '" + lang_1.stringify(typeOrFunc) + "'(" +
            signature.join(', ') + "). " +
            "Make sure that all the parameters are decorated with Inject or have valid type annotations and that '" +
            lang_1.stringify(typeOrFunc) + "' is decorated with Injectable.";
    };
    return NoAnnotationError;
})(exceptions_1.BaseException);
exports.NoAnnotationError = NoAnnotationError;
/**
 * Thrown when getting an object by index.
 *
 * ### Example ([live demo](http://plnkr.co/edit/bRs0SX2OTQiJzqvjgl8P?p=preview))
 *
 * ```typescript
 * class A {}
 *
 * var injector = Injector.resolveAndCreate([A]);
 *
 * expect(() => injector.getAt(100)).toThrowError();
 * ```
 */
var OutOfBoundsError = (function (_super) {
    __extends(OutOfBoundsError, _super);
    function OutOfBoundsError(index) {
        _super.call(this, "Index " + index + " is out-of-bounds.");
    }
    return OutOfBoundsError;
})(exceptions_1.BaseException);
exports.OutOfBoundsError = OutOfBoundsError;
// TODO: add a working example after alpha38 is released
/**
 * Thrown when a multi provider and a regular provider are bound to the same token.
 *
 * ### Example
 *
 * ```typescript
 * expect(() => Injector.resolveAndCreate([
 *   new Provider("Strings", {useValue: "string1", multi: true}),
 *   new Provider("Strings", {useValue: "string2", multi: false})
 * ])).toThrowError();
 * ```
 */
var MixingMultiProvidersWithRegularProvidersError = (function (_super) {
    __extends(MixingMultiProvidersWithRegularProvidersError, _super);
    function MixingMultiProvidersWithRegularProvidersError(provider1, provider2) {
        _super.call(this, "Cannot mix multi providers and regular providers, got: " + provider1.toString() + " " +
            provider2.toString());
    }
    return MixingMultiProvidersWithRegularProvidersError;
})(exceptions_1.BaseException);
exports.MixingMultiProvidersWithRegularProvidersError = MixingMultiProvidersWithRegularProvidersError;
},{"angular2/src/facade/collection":16,"angular2/src/facade/exceptions":18,"angular2/src/facade/lang":19}],4:[function(require,module,exports){
'use strict';var lang_1 = require('angular2/src/facade/lang');
/**
 * Allows to refer to references which are not yet defined.
 *
 * For instance, `forwardRef` is used when the `token` which we need to refer to for the purposes of
 * DI is declared,
 * but not yet defined. It is also used when the `token` which we use when creating a query is not
 * yet defined.
 *
 * ### Example
 * {@example core/di/ts/forward_ref/forward_ref.ts region='forward_ref'}
 */
function forwardRef(forwardRefFn) {
    forwardRefFn.__forward_ref__ = forwardRef;
    forwardRefFn.toString = function () { return lang_1.stringify(this()); };
    return forwardRefFn;
}
exports.forwardRef = forwardRef;
/**
 * Lazily retrieves the reference value from a forwardRef.
 *
 * Acts as the identity function when given a non-forward-ref value.
 *
 * ### Example ([live demo](http://plnkr.co/edit/GU72mJrk1fiodChcmiDR?p=preview))
 *
 * ```typescript
 * var ref = forwardRef(() => "refValue");
 * expect(resolveForwardRef(ref)).toEqual("refValue");
 * expect(resolveForwardRef("regularValue")).toEqual("regularValue");
 * ```
 *
 * See: {@link forwardRef}
 */
function resolveForwardRef(type) {
    if (lang_1.isFunction(type) && type.hasOwnProperty('__forward_ref__') &&
        type.__forward_ref__ === forwardRef) {
        return type();
    }
    else {
        return type;
    }
}
exports.resolveForwardRef = resolveForwardRef;
},{"angular2/src/facade/lang":19}],5:[function(require,module,exports){
'use strict';var collection_1 = require('angular2/src/facade/collection');
var provider_1 = require('./provider');
var exceptions_1 = require('./exceptions');
var lang_1 = require('angular2/src/facade/lang');
var exceptions_2 = require('angular2/src/facade/exceptions');
var key_1 = require('./key');
var metadata_1 = require('./metadata');
// Threshold for the dynamic version
var _MAX_CONSTRUCTION_COUNTER = 10;
exports.UNDEFINED = lang_1.CONST_EXPR(new Object());
/**
 * Visibility of a {@link Provider}.
 */
(function (Visibility) {
    /**
     * A `Public` {@link Provider} is only visible to regular (as opposed to host) child injectors.
     */
    Visibility[Visibility["Public"] = 0] = "Public";
    /**
     * A `Private` {@link Provider} is only visible to host (as opposed to regular) child injectors.
     */
    Visibility[Visibility["Private"] = 1] = "Private";
    /**
     * A `PublicAndPrivate` {@link Provider} is visible to both host and regular child injectors.
     */
    Visibility[Visibility["PublicAndPrivate"] = 2] = "PublicAndPrivate";
})(exports.Visibility || (exports.Visibility = {}));
var Visibility = exports.Visibility;
function canSee(src, dst) {
    return (src === dst) ||
        (dst === Visibility.PublicAndPrivate || src === Visibility.PublicAndPrivate);
}
var ProtoInjectorInlineStrategy = (function () {
    function ProtoInjectorInlineStrategy(protoEI, bwv) {
        this.provider0 = null;
        this.provider1 = null;
        this.provider2 = null;
        this.provider3 = null;
        this.provider4 = null;
        this.provider5 = null;
        this.provider6 = null;
        this.provider7 = null;
        this.provider8 = null;
        this.provider9 = null;
        this.keyId0 = null;
        this.keyId1 = null;
        this.keyId2 = null;
        this.keyId3 = null;
        this.keyId4 = null;
        this.keyId5 = null;
        this.keyId6 = null;
        this.keyId7 = null;
        this.keyId8 = null;
        this.keyId9 = null;
        this.visibility0 = null;
        this.visibility1 = null;
        this.visibility2 = null;
        this.visibility3 = null;
        this.visibility4 = null;
        this.visibility5 = null;
        this.visibility6 = null;
        this.visibility7 = null;
        this.visibility8 = null;
        this.visibility9 = null;
        var length = bwv.length;
        if (length > 0) {
            this.provider0 = bwv[0].provider;
            this.keyId0 = bwv[0].getKeyId();
            this.visibility0 = bwv[0].visibility;
        }
        if (length > 1) {
            this.provider1 = bwv[1].provider;
            this.keyId1 = bwv[1].getKeyId();
            this.visibility1 = bwv[1].visibility;
        }
        if (length > 2) {
            this.provider2 = bwv[2].provider;
            this.keyId2 = bwv[2].getKeyId();
            this.visibility2 = bwv[2].visibility;
        }
        if (length > 3) {
            this.provider3 = bwv[3].provider;
            this.keyId3 = bwv[3].getKeyId();
            this.visibility3 = bwv[3].visibility;
        }
        if (length > 4) {
            this.provider4 = bwv[4].provider;
            this.keyId4 = bwv[4].getKeyId();
            this.visibility4 = bwv[4].visibility;
        }
        if (length > 5) {
            this.provider5 = bwv[5].provider;
            this.keyId5 = bwv[5].getKeyId();
            this.visibility5 = bwv[5].visibility;
        }
        if (length > 6) {
            this.provider6 = bwv[6].provider;
            this.keyId6 = bwv[6].getKeyId();
            this.visibility6 = bwv[6].visibility;
        }
        if (length > 7) {
            this.provider7 = bwv[7].provider;
            this.keyId7 = bwv[7].getKeyId();
            this.visibility7 = bwv[7].visibility;
        }
        if (length > 8) {
            this.provider8 = bwv[8].provider;
            this.keyId8 = bwv[8].getKeyId();
            this.visibility8 = bwv[8].visibility;
        }
        if (length > 9) {
            this.provider9 = bwv[9].provider;
            this.keyId9 = bwv[9].getKeyId();
            this.visibility9 = bwv[9].visibility;
        }
    }
    ProtoInjectorInlineStrategy.prototype.getProviderAtIndex = function (index) {
        if (index == 0)
            return this.provider0;
        if (index == 1)
            return this.provider1;
        if (index == 2)
            return this.provider2;
        if (index == 3)
            return this.provider3;
        if (index == 4)
            return this.provider4;
        if (index == 5)
            return this.provider5;
        if (index == 6)
            return this.provider6;
        if (index == 7)
            return this.provider7;
        if (index == 8)
            return this.provider8;
        if (index == 9)
            return this.provider9;
        throw new exceptions_1.OutOfBoundsError(index);
    };
    ProtoInjectorInlineStrategy.prototype.createInjectorStrategy = function (injector) {
        return new InjectorInlineStrategy(injector, this);
    };
    return ProtoInjectorInlineStrategy;
})();
exports.ProtoInjectorInlineStrategy = ProtoInjectorInlineStrategy;
var ProtoInjectorDynamicStrategy = (function () {
    function ProtoInjectorDynamicStrategy(protoInj, bwv) {
        var len = bwv.length;
        this.providers = collection_1.ListWrapper.createFixedSize(len);
        this.keyIds = collection_1.ListWrapper.createFixedSize(len);
        this.visibilities = collection_1.ListWrapper.createFixedSize(len);
        for (var i = 0; i < len; i++) {
            this.providers[i] = bwv[i].provider;
            this.keyIds[i] = bwv[i].getKeyId();
            this.visibilities[i] = bwv[i].visibility;
        }
    }
    ProtoInjectorDynamicStrategy.prototype.getProviderAtIndex = function (index) {
        if (index < 0 || index >= this.providers.length) {
            throw new exceptions_1.OutOfBoundsError(index);
        }
        return this.providers[index];
    };
    ProtoInjectorDynamicStrategy.prototype.createInjectorStrategy = function (ei) {
        return new InjectorDynamicStrategy(this, ei);
    };
    return ProtoInjectorDynamicStrategy;
})();
exports.ProtoInjectorDynamicStrategy = ProtoInjectorDynamicStrategy;
var ProtoInjector = (function () {
    function ProtoInjector(bwv) {
        this.numberOfProviders = bwv.length;
        this._strategy = bwv.length > _MAX_CONSTRUCTION_COUNTER ?
            new ProtoInjectorDynamicStrategy(this, bwv) :
            new ProtoInjectorInlineStrategy(this, bwv);
    }
    ProtoInjector.fromResolvedProviders = function (providers) {
        var bd = providers.map(function (b) { return new ProviderWithVisibility(b, Visibility.Public); });
        return new ProtoInjector(bd);
    };
    ProtoInjector.prototype.getProviderAtIndex = function (index) {
        return this._strategy.getProviderAtIndex(index);
    };
    return ProtoInjector;
})();
exports.ProtoInjector = ProtoInjector;
var InjectorInlineStrategy = (function () {
    function InjectorInlineStrategy(injector, protoStrategy) {
        this.injector = injector;
        this.protoStrategy = protoStrategy;
        this.obj0 = exports.UNDEFINED;
        this.obj1 = exports.UNDEFINED;
        this.obj2 = exports.UNDEFINED;
        this.obj3 = exports.UNDEFINED;
        this.obj4 = exports.UNDEFINED;
        this.obj5 = exports.UNDEFINED;
        this.obj6 = exports.UNDEFINED;
        this.obj7 = exports.UNDEFINED;
        this.obj8 = exports.UNDEFINED;
        this.obj9 = exports.UNDEFINED;
    }
    InjectorInlineStrategy.prototype.resetConstructionCounter = function () { this.injector._constructionCounter = 0; };
    InjectorInlineStrategy.prototype.instantiateProvider = function (provider, visibility) {
        return this.injector._new(provider, visibility);
    };
    InjectorInlineStrategy.prototype.getObjByKeyId = function (keyId, visibility) {
        var p = this.protoStrategy;
        var inj = this.injector;
        if (p.keyId0 === keyId && canSee(p.visibility0, visibility)) {
            if (this.obj0 === exports.UNDEFINED) {
                this.obj0 = inj._new(p.provider0, p.visibility0);
            }
            return this.obj0;
        }
        if (p.keyId1 === keyId && canSee(p.visibility1, visibility)) {
            if (this.obj1 === exports.UNDEFINED) {
                this.obj1 = inj._new(p.provider1, p.visibility1);
            }
            return this.obj1;
        }
        if (p.keyId2 === keyId && canSee(p.visibility2, visibility)) {
            if (this.obj2 === exports.UNDEFINED) {
                this.obj2 = inj._new(p.provider2, p.visibility2);
            }
            return this.obj2;
        }
        if (p.keyId3 === keyId && canSee(p.visibility3, visibility)) {
            if (this.obj3 === exports.UNDEFINED) {
                this.obj3 = inj._new(p.provider3, p.visibility3);
            }
            return this.obj3;
        }
        if (p.keyId4 === keyId && canSee(p.visibility4, visibility)) {
            if (this.obj4 === exports.UNDEFINED) {
                this.obj4 = inj._new(p.provider4, p.visibility4);
            }
            return this.obj4;
        }
        if (p.keyId5 === keyId && canSee(p.visibility5, visibility)) {
            if (this.obj5 === exports.UNDEFINED) {
                this.obj5 = inj._new(p.provider5, p.visibility5);
            }
            return this.obj5;
        }
        if (p.keyId6 === keyId && canSee(p.visibility6, visibility)) {
            if (this.obj6 === exports.UNDEFINED) {
                this.obj6 = inj._new(p.provider6, p.visibility6);
            }
            return this.obj6;
        }
        if (p.keyId7 === keyId && canSee(p.visibility7, visibility)) {
            if (this.obj7 === exports.UNDEFINED) {
                this.obj7 = inj._new(p.provider7, p.visibility7);
            }
            return this.obj7;
        }
        if (p.keyId8 === keyId && canSee(p.visibility8, visibility)) {
            if (this.obj8 === exports.UNDEFINED) {
                this.obj8 = inj._new(p.provider8, p.visibility8);
            }
            return this.obj8;
        }
        if (p.keyId9 === keyId && canSee(p.visibility9, visibility)) {
            if (this.obj9 === exports.UNDEFINED) {
                this.obj9 = inj._new(p.provider9, p.visibility9);
            }
            return this.obj9;
        }
        return exports.UNDEFINED;
    };
    InjectorInlineStrategy.prototype.getObjAtIndex = function (index) {
        if (index == 0)
            return this.obj0;
        if (index == 1)
            return this.obj1;
        if (index == 2)
            return this.obj2;
        if (index == 3)
            return this.obj3;
        if (index == 4)
            return this.obj4;
        if (index == 5)
            return this.obj5;
        if (index == 6)
            return this.obj6;
        if (index == 7)
            return this.obj7;
        if (index == 8)
            return this.obj8;
        if (index == 9)
            return this.obj9;
        throw new exceptions_1.OutOfBoundsError(index);
    };
    InjectorInlineStrategy.prototype.getMaxNumberOfObjects = function () { return _MAX_CONSTRUCTION_COUNTER; };
    return InjectorInlineStrategy;
})();
exports.InjectorInlineStrategy = InjectorInlineStrategy;
var InjectorDynamicStrategy = (function () {
    function InjectorDynamicStrategy(protoStrategy, injector) {
        this.protoStrategy = protoStrategy;
        this.injector = injector;
        this.objs = collection_1.ListWrapper.createFixedSize(protoStrategy.providers.length);
        collection_1.ListWrapper.fill(this.objs, exports.UNDEFINED);
    }
    InjectorDynamicStrategy.prototype.resetConstructionCounter = function () { this.injector._constructionCounter = 0; };
    InjectorDynamicStrategy.prototype.instantiateProvider = function (provider, visibility) {
        return this.injector._new(provider, visibility);
    };
    InjectorDynamicStrategy.prototype.getObjByKeyId = function (keyId, visibility) {
        var p = this.protoStrategy;
        for (var i = 0; i < p.keyIds.length; i++) {
            if (p.keyIds[i] === keyId && canSee(p.visibilities[i], visibility)) {
                if (this.objs[i] === exports.UNDEFINED) {
                    this.objs[i] = this.injector._new(p.providers[i], p.visibilities[i]);
                }
                return this.objs[i];
            }
        }
        return exports.UNDEFINED;
    };
    InjectorDynamicStrategy.prototype.getObjAtIndex = function (index) {
        if (index < 0 || index >= this.objs.length) {
            throw new exceptions_1.OutOfBoundsError(index);
        }
        return this.objs[index];
    };
    InjectorDynamicStrategy.prototype.getMaxNumberOfObjects = function () { return this.objs.length; };
    return InjectorDynamicStrategy;
})();
exports.InjectorDynamicStrategy = InjectorDynamicStrategy;
var ProviderWithVisibility = (function () {
    function ProviderWithVisibility(provider, visibility) {
        this.provider = provider;
        this.visibility = visibility;
    }
    ;
    ProviderWithVisibility.prototype.getKeyId = function () { return this.provider.key.id; };
    return ProviderWithVisibility;
})();
exports.ProviderWithVisibility = ProviderWithVisibility;
/**
 * A dependency injection container used for instantiating objects and resolving dependencies.
 *
 * An `Injector` is a replacement for a `new` operator, which can automatically resolve the
 * constructor dependencies.
 *
 * In typical use, application code asks for the dependencies in the constructor and they are
 * resolved by the `Injector`.
 *
 * ### Example ([live demo](http://plnkr.co/edit/jzjec0?p=preview))
 *
 * The following example creates an `Injector` configured to create `Engine` and `Car`.
 *
 * ```typescript
 * @Injectable()
 * class Engine {
 * }
 *
 * @Injectable()
 * class Car {
 *   constructor(public engine:Engine) {}
 * }
 *
 * var injector = Injector.resolveAndCreate([Car, Engine]);
 * var car = injector.get(Car);
 * expect(car instanceof Car).toBe(true);
 * expect(car.engine instanceof Engine).toBe(true);
 * ```
 *
 * Notice, we don't use the `new` operator because we explicitly want to have the `Injector`
 * resolve all of the object's dependencies automatically.
 */
var Injector = (function () {
    /**
     * Private
     */
    function Injector(_proto /* ProtoInjector */, _parent, _isHostBoundary, _depProvider, _debugContext) {
        if (_parent === void 0) { _parent = null; }
        if (_isHostBoundary === void 0) { _isHostBoundary = false; }
        if (_depProvider === void 0) { _depProvider = null; }
        if (_debugContext === void 0) { _debugContext = null; }
        this._isHostBoundary = _isHostBoundary;
        this._depProvider = _depProvider;
        this._debugContext = _debugContext;
        /** @internal */
        this._constructionCounter = 0;
        this._proto = _proto;
        this._parent = _parent;
        this._strategy = _proto._strategy.createInjectorStrategy(this);
    }
    /**
     * Turns an array of provider definitions into an array of resolved providers.
     *
     * A resolution is a process of flattening multiple nested arrays and converting individual
     * providers into an array of {@link ResolvedProvider}s.
     *
     * ### Example ([live demo](http://plnkr.co/edit/AiXTHi?p=preview))
     *
     * ```typescript
     * @Injectable()
     * class Engine {
     * }
     *
     * @Injectable()
     * class Car {
     *   constructor(public engine:Engine) {}
     * }
     *
     * var providers = Injector.resolve([Car, [[Engine]]]);
     *
     * expect(providers.length).toEqual(2);
     *
     * expect(providers[0] instanceof ResolvedProvider).toBe(true);
     * expect(providers[0].key.displayName).toBe("Car");
     * expect(providers[0].dependencies.length).toEqual(1);
     * expect(providers[0].factory).toBeDefined();
     *
     * expect(providers[1].key.displayName).toBe("Engine");
     * });
     * ```
     *
     * See {@link Injector#fromResolvedProviders} for more info.
     */
    Injector.resolve = function (providers) {
        return provider_1.resolveProviders(providers);
    };
    /**
     * Resolves an array of providers and creates an injector from those providers.
     *
     * The passed-in providers can be an array of `Type`, {@link Provider},
     * or a recursive array of more providers.
     *
     * ### Example ([live demo](http://plnkr.co/edit/ePOccA?p=preview))
     *
     * ```typescript
     * @Injectable()
     * class Engine {
     * }
     *
     * @Injectable()
     * class Car {
     *   constructor(public engine:Engine) {}
     * }
     *
     * var injector = Injector.resolveAndCreate([Car, Engine]);
     * expect(injector.get(Car) instanceof Car).toBe(true);
     * ```
     *
     * This function is slower than the corresponding `fromResolvedProviders`
     * because it needs to resolve the passed-in providers first.
     * See {@link Injector#resolve} and {@link Injector#fromResolvedProviders}.
     */
    Injector.resolveAndCreate = function (providers) {
        var resolvedProviders = Injector.resolve(providers);
        return Injector.fromResolvedProviders(resolvedProviders);
    };
    /**
     * Creates an injector from previously resolved providers.
     *
     * This API is the recommended way to construct injectors in performance-sensitive parts.
     *
     * ### Example ([live demo](http://plnkr.co/edit/KrSMci?p=preview))
     *
     * ```typescript
     * @Injectable()
     * class Engine {
     * }
     *
     * @Injectable()
     * class Car {
     *   constructor(public engine:Engine) {}
     * }
     *
     * var providers = Injector.resolve([Car, Engine]);
     * var injector = Injector.fromResolvedProviders(providers);
     * expect(injector.get(Car) instanceof Car).toBe(true);
     * ```
     */
    Injector.fromResolvedProviders = function (providers) {
        return new Injector(ProtoInjector.fromResolvedProviders(providers));
    };
    /**
     * @deprecated
     */
    Injector.fromResolvedBindings = function (providers) {
        return Injector.fromResolvedProviders(providers);
    };
    Object.defineProperty(Injector.prototype, "hostBoundary", {
        /**
         * Whether this injector is a boundary to a host.
         * @internal
         */
        get: function () { return this._isHostBoundary; },
        enumerable: true,
        configurable: true
    });
    /**
     * @internal
     */
    Injector.prototype.debugContext = function () { return this._debugContext(); };
    /**
     * Retrieves an instance from the injector based on the provided token.
     * Throws {@link NoProviderError} if not found.
     *
     * ### Example ([live demo](http://plnkr.co/edit/HeXSHg?p=preview))
     *
     * ```typescript
     * var injector = Injector.resolveAndCreate([
     *   provide("validToken", {useValue: "Value"})
     * ]);
     * expect(injector.get("validToken")).toEqual("Value");
     * expect(() => injector.get("invalidToken")).toThrowError();
     * ```
     *
     * `Injector` returns itself when given `Injector` as a token.
     *
     * ```typescript
     * var injector = Injector.resolveAndCreate([]);
     * expect(injector.get(Injector)).toBe(injector);
     * ```
     */
    Injector.prototype.get = function (token) {
        return this._getByKey(key_1.Key.get(token), null, null, false, Visibility.PublicAndPrivate);
    };
    /**
     * Retrieves an instance from the injector based on the provided token.
     * Returns null if not found.
     *
     * ### Example ([live demo](http://plnkr.co/edit/tpEbEy?p=preview))
     *
     * ```typescript
     * var injector = Injector.resolveAndCreate([
     *   provide("validToken", {useValue: "Value"})
     * ]);
     * expect(injector.getOptional("validToken")).toEqual("Value");
     * expect(injector.getOptional("invalidToken")).toBe(null);
     * ```
     *
     * `Injector` returns itself when given `Injector` as a token.
     *
     * ```typescript
     * var injector = Injector.resolveAndCreate([]);
     * expect(injector.getOptional(Injector)).toBe(injector);
     * ```
     */
    Injector.prototype.getOptional = function (token) {
        return this._getByKey(key_1.Key.get(token), null, null, true, Visibility.PublicAndPrivate);
    };
    /**
     * @internal
     */
    Injector.prototype.getAt = function (index) { return this._strategy.getObjAtIndex(index); };
    Object.defineProperty(Injector.prototype, "parent", {
        /**
         * Parent of this injector.
         *
         * <!-- TODO: Add a link to the section of the user guide talking about hierarchical injection.
         * -->
         *
         * ### Example ([live demo](http://plnkr.co/edit/eosMGo?p=preview))
         *
         * ```typescript
         * var parent = Injector.resolveAndCreate([]);
         * var child = parent.resolveAndCreateChild([]);
         * expect(child.parent).toBe(parent);
         * ```
         */
        get: function () { return this._parent; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Injector.prototype, "internalStrategy", {
        /**
         * @internal
         * Internal. Do not use.
         * We return `any` not to export the InjectorStrategy type.
         */
        get: function () { return this._strategy; },
        enumerable: true,
        configurable: true
    });
    /**
     * Resolves an array of providers and creates a child injector from those providers.
     *
     * <!-- TODO: Add a link to the section of the user guide talking about hierarchical injection.
     * -->
     *
     * The passed-in providers can be an array of `Type`, {@link Provider},
     * or a recursive array of more providers.
     *
     * ### Example ([live demo](http://plnkr.co/edit/opB3T4?p=preview))
     *
     * ```typescript
     * class ParentProvider {}
     * class ChildProvider {}
     *
     * var parent = Injector.resolveAndCreate([ParentProvider]);
     * var child = parent.resolveAndCreateChild([ChildProvider]);
     *
     * expect(child.get(ParentProvider) instanceof ParentProvider).toBe(true);
     * expect(child.get(ChildProvider) instanceof ChildProvider).toBe(true);
     * expect(child.get(ParentProvider)).toBe(parent.get(ParentProvider));
     * ```
     *
     * This function is slower than the corresponding `createChildFromResolved`
     * because it needs to resolve the passed-in providers first.
     * See {@link Injector#resolve} and {@link Injector#createChildFromResolved}.
     */
    Injector.prototype.resolveAndCreateChild = function (providers) {
        var resolvedProviders = Injector.resolve(providers);
        return this.createChildFromResolved(resolvedProviders);
    };
    /**
     * Creates a child injector from previously resolved providers.
     *
     * <!-- TODO: Add a link to the section of the user guide talking about hierarchical injection.
     * -->
     *
     * This API is the recommended way to construct injectors in performance-sensitive parts.
     *
     * ### Example ([live demo](http://plnkr.co/edit/VhyfjN?p=preview))
     *
     * ```typescript
     * class ParentProvider {}
     * class ChildProvider {}
     *
     * var parentProviders = Injector.resolve([ParentProvider]);
     * var childProviders = Injector.resolve([ChildProvider]);
     *
     * var parent = Injector.fromResolvedProviders(parentProviders);
     * var child = parent.createChildFromResolved(childProviders);
     *
     * expect(child.get(ParentProvider) instanceof ParentProvider).toBe(true);
     * expect(child.get(ChildProvider) instanceof ChildProvider).toBe(true);
     * expect(child.get(ParentProvider)).toBe(parent.get(ParentProvider));
     * ```
     */
    Injector.prototype.createChildFromResolved = function (providers) {
        var bd = providers.map(function (b) { return new ProviderWithVisibility(b, Visibility.Public); });
        var proto = new ProtoInjector(bd);
        var inj = new Injector(proto);
        inj._parent = this;
        return inj;
    };
    /**
     * Resolves a provider and instantiates an object in the context of the injector.
     *
     * The created object does not get cached by the injector.
     *
     * ### Example ([live demo](http://plnkr.co/edit/yvVXoB?p=preview))
     *
     * ```typescript
     * @Injectable()
     * class Engine {
     * }
     *
     * @Injectable()
     * class Car {
     *   constructor(public engine:Engine) {}
     * }
     *
     * var injector = Injector.resolveAndCreate([Engine]);
     *
     * var car = injector.resolveAndInstantiate(Car);
     * expect(car.engine).toBe(injector.get(Engine));
     * expect(car).not.toBe(injector.resolveAndInstantiate(Car));
     * ```
     */
    Injector.prototype.resolveAndInstantiate = function (provider) {
        return this.instantiateResolved(Injector.resolve([provider])[0]);
    };
    /**
     * Instantiates an object using a resolved provider in the context of the injector.
     *
     * The created object does not get cached by the injector.
     *
     * ### Example ([live demo](http://plnkr.co/edit/ptCImQ?p=preview))
     *
     * ```typescript
     * @Injectable()
     * class Engine {
     * }
     *
     * @Injectable()
     * class Car {
     *   constructor(public engine:Engine) {}
     * }
     *
     * var injector = Injector.resolveAndCreate([Engine]);
     * var carProvider = Injector.resolve([Car])[0];
     * var car = injector.instantiateResolved(carProvider);
     * expect(car.engine).toBe(injector.get(Engine));
     * expect(car).not.toBe(injector.instantiateResolved(carProvider));
     * ```
     */
    Injector.prototype.instantiateResolved = function (provider) {
        return this._instantiateProvider(provider, Visibility.PublicAndPrivate);
    };
    /** @internal */
    Injector.prototype._new = function (provider, visibility) {
        if (this._constructionCounter++ > this._strategy.getMaxNumberOfObjects()) {
            throw new exceptions_1.CyclicDependencyError(this, provider.key);
        }
        return this._instantiateProvider(provider, visibility);
    };
    Injector.prototype._instantiateProvider = function (provider, visibility) {
        if (provider.multiProvider) {
            var res = collection_1.ListWrapper.createFixedSize(provider.resolvedFactories.length);
            for (var i = 0; i < provider.resolvedFactories.length; ++i) {
                res[i] = this._instantiate(provider, provider.resolvedFactories[i], visibility);
            }
            return res;
        }
        else {
            return this._instantiate(provider, provider.resolvedFactories[0], visibility);
        }
    };
    Injector.prototype._instantiate = function (provider, resolvedFactory, visibility) {
        var factory = resolvedFactory.factory;
        var deps = resolvedFactory.dependencies;
        var length = deps.length;
        var d0;
        var d1;
        var d2;
        var d3;
        var d4;
        var d5;
        var d6;
        var d7;
        var d8;
        var d9;
        var d10;
        var d11;
        var d12;
        var d13;
        var d14;
        var d15;
        var d16;
        var d17;
        var d18;
        var d19;
        try {
            d0 = length > 0 ? this._getByDependency(provider, deps[0], visibility) : null;
            d1 = length > 1 ? this._getByDependency(provider, deps[1], visibility) : null;
            d2 = length > 2 ? this._getByDependency(provider, deps[2], visibility) : null;
            d3 = length > 3 ? this._getByDependency(provider, deps[3], visibility) : null;
            d4 = length > 4 ? this._getByDependency(provider, deps[4], visibility) : null;
            d5 = length > 5 ? this._getByDependency(provider, deps[5], visibility) : null;
            d6 = length > 6 ? this._getByDependency(provider, deps[6], visibility) : null;
            d7 = length > 7 ? this._getByDependency(provider, deps[7], visibility) : null;
            d8 = length > 8 ? this._getByDependency(provider, deps[8], visibility) : null;
            d9 = length > 9 ? this._getByDependency(provider, deps[9], visibility) : null;
            d10 = length > 10 ? this._getByDependency(provider, deps[10], visibility) : null;
            d11 = length > 11 ? this._getByDependency(provider, deps[11], visibility) : null;
            d12 = length > 12 ? this._getByDependency(provider, deps[12], visibility) : null;
            d13 = length > 13 ? this._getByDependency(provider, deps[13], visibility) : null;
            d14 = length > 14 ? this._getByDependency(provider, deps[14], visibility) : null;
            d15 = length > 15 ? this._getByDependency(provider, deps[15], visibility) : null;
            d16 = length > 16 ? this._getByDependency(provider, deps[16], visibility) : null;
            d17 = length > 17 ? this._getByDependency(provider, deps[17], visibility) : null;
            d18 = length > 18 ? this._getByDependency(provider, deps[18], visibility) : null;
            d19 = length > 19 ? this._getByDependency(provider, deps[19], visibility) : null;
        }
        catch (e) {
            if (e instanceof exceptions_1.AbstractProviderError || e instanceof exceptions_1.InstantiationError) {
                e.addKey(this, provider.key);
            }
            throw e;
        }
        var obj;
        try {
            switch (length) {
                case 0:
                    obj = factory();
                    break;
                case 1:
                    obj = factory(d0);
                    break;
                case 2:
                    obj = factory(d0, d1);
                    break;
                case 3:
                    obj = factory(d0, d1, d2);
                    break;
                case 4:
                    obj = factory(d0, d1, d2, d3);
                    break;
                case 5:
                    obj = factory(d0, d1, d2, d3, d4);
                    break;
                case 6:
                    obj = factory(d0, d1, d2, d3, d4, d5);
                    break;
                case 7:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6);
                    break;
                case 8:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7);
                    break;
                case 9:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8);
                    break;
                case 10:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9);
                    break;
                case 11:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10);
                    break;
                case 12:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11);
                    break;
                case 13:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12);
                    break;
                case 14:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13);
                    break;
                case 15:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14);
                    break;
                case 16:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15);
                    break;
                case 17:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16);
                    break;
                case 18:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16, d17);
                    break;
                case 19:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16, d17, d18);
                    break;
                case 20:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16, d17, d18, d19);
                    break;
                default:
                    throw new exceptions_2.BaseException("Cannot instantiate '" + provider.key.displayName + "' because it has more than 20 dependencies");
            }
        }
        catch (e) {
            throw new exceptions_1.InstantiationError(this, e, e.stack, provider.key);
        }
        return obj;
    };
    Injector.prototype._getByDependency = function (provider, dep, providerVisibility) {
        var special = lang_1.isPresent(this._depProvider) ?
            this._depProvider.getDependency(this, provider, dep) :
            exports.UNDEFINED;
        if (special !== exports.UNDEFINED) {
            return special;
        }
        else {
            return this._getByKey(dep.key, dep.lowerBoundVisibility, dep.upperBoundVisibility, dep.optional, providerVisibility);
        }
    };
    Injector.prototype._getByKey = function (key, lowerBoundVisibility, upperBoundVisibility, optional, providerVisibility) {
        if (key === INJECTOR_KEY) {
            return this;
        }
        if (upperBoundVisibility instanceof metadata_1.SelfMetadata) {
            return this._getByKeySelf(key, optional, providerVisibility);
        }
        else if (upperBoundVisibility instanceof metadata_1.HostMetadata) {
            return this._getByKeyHost(key, optional, providerVisibility, lowerBoundVisibility);
        }
        else {
            return this._getByKeyDefault(key, optional, providerVisibility, lowerBoundVisibility);
        }
    };
    /** @internal */
    Injector.prototype._throwOrNull = function (key, optional) {
        if (optional) {
            return null;
        }
        else {
            throw new exceptions_1.NoProviderError(this, key);
        }
    };
    /** @internal */
    Injector.prototype._getByKeySelf = function (key, optional, providerVisibility) {
        var obj = this._strategy.getObjByKeyId(key.id, providerVisibility);
        return (obj !== exports.UNDEFINED) ? obj : this._throwOrNull(key, optional);
    };
    /** @internal */
    Injector.prototype._getByKeyHost = function (key, optional, providerVisibility, lowerBoundVisibility) {
        var inj = this;
        if (lowerBoundVisibility instanceof metadata_1.SkipSelfMetadata) {
            if (inj._isHostBoundary) {
                return this._getPrivateDependency(key, optional, inj);
            }
            else {
                inj = inj._parent;
            }
        }
        while (inj != null) {
            var obj = inj._strategy.getObjByKeyId(key.id, providerVisibility);
            if (obj !== exports.UNDEFINED)
                return obj;
            if (lang_1.isPresent(inj._parent) && inj._isHostBoundary) {
                return this._getPrivateDependency(key, optional, inj);
            }
            else {
                inj = inj._parent;
            }
        }
        return this._throwOrNull(key, optional);
    };
    /** @internal */
    Injector.prototype._getPrivateDependency = function (key, optional, inj) {
        var obj = inj._parent._strategy.getObjByKeyId(key.id, Visibility.Private);
        return (obj !== exports.UNDEFINED) ? obj : this._throwOrNull(key, optional);
    };
    /** @internal */
    Injector.prototype._getByKeyDefault = function (key, optional, providerVisibility, lowerBoundVisibility) {
        var inj = this;
        if (lowerBoundVisibility instanceof metadata_1.SkipSelfMetadata) {
            providerVisibility = inj._isHostBoundary ? Visibility.PublicAndPrivate : Visibility.Public;
            inj = inj._parent;
        }
        while (inj != null) {
            var obj = inj._strategy.getObjByKeyId(key.id, providerVisibility);
            if (obj !== exports.UNDEFINED)
                return obj;
            providerVisibility = inj._isHostBoundary ? Visibility.PublicAndPrivate : Visibility.Public;
            inj = inj._parent;
        }
        return this._throwOrNull(key, optional);
    };
    Object.defineProperty(Injector.prototype, "displayName", {
        get: function () {
            return "Injector(providers: [" + _mapProviders(this, function (b) { return (" \"" + b.key.displayName + "\" "); }).join(", ") + "])";
        },
        enumerable: true,
        configurable: true
    });
    Injector.prototype.toString = function () { return this.displayName; };
    return Injector;
})();
exports.Injector = Injector;
var INJECTOR_KEY = key_1.Key.get(Injector);
function _mapProviders(injector, fn) {
    var res = [];
    for (var i = 0; i < injector._proto.numberOfProviders; ++i) {
        res.push(fn(injector._proto.getProviderAtIndex(i)));
    }
    return res;
}
},{"./exceptions":3,"./key":6,"./metadata":7,"./provider":9,"angular2/src/facade/collection":16,"angular2/src/facade/exceptions":18,"angular2/src/facade/lang":19}],6:[function(require,module,exports){
'use strict';var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var forward_ref_1 = require('./forward_ref');
/**
 * A unique object used for retrieving items from the {@link Injector}.
 *
 * Keys have:
 * - a system-wide unique `id`.
 * - a `token`.
 *
 * `Key` is used internally by {@link Injector} because its system-wide unique `id` allows the
 * injector to store created objects in a more efficient way.
 *
 * `Key` should not be created directly. {@link Injector} creates keys automatically when resolving
 * providers.
 */
var Key = (function () {
    /**
     * Private
     */
    function Key(token, id) {
        this.token = token;
        this.id = id;
        if (lang_1.isBlank(token)) {
            throw new exceptions_1.BaseException('Token must be defined!');
        }
    }
    Object.defineProperty(Key.prototype, "displayName", {
        /**
         * Returns a stringified token.
         */
        get: function () { return lang_1.stringify(this.token); },
        enumerable: true,
        configurable: true
    });
    /**
     * Retrieves a `Key` for a token.
     */
    Key.get = function (token) { return _globalKeyRegistry.get(forward_ref_1.resolveForwardRef(token)); };
    Object.defineProperty(Key, "numberOfKeys", {
        /**
         * @returns the number of keys registered in the system.
         */
        get: function () { return _globalKeyRegistry.numberOfKeys; },
        enumerable: true,
        configurable: true
    });
    return Key;
})();
exports.Key = Key;
/**
 * @internal
 */
var KeyRegistry = (function () {
    function KeyRegistry() {
        this._allKeys = new Map();
    }
    KeyRegistry.prototype.get = function (token) {
        if (token instanceof Key)
            return token;
        if (this._allKeys.has(token)) {
            return this._allKeys.get(token);
        }
        var newKey = new Key(token, Key.numberOfKeys);
        this._allKeys.set(token, newKey);
        return newKey;
    };
    Object.defineProperty(KeyRegistry.prototype, "numberOfKeys", {
        get: function () { return this._allKeys.size; },
        enumerable: true,
        configurable: true
    });
    return KeyRegistry;
})();
exports.KeyRegistry = KeyRegistry;
var _globalKeyRegistry = new KeyRegistry();
},{"./forward_ref":4,"angular2/src/facade/exceptions":18,"angular2/src/facade/lang":19}],7:[function(require,module,exports){
'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var lang_1 = require("angular2/src/facade/lang");
/**
 * A parameter metadata that specifies a dependency.
 *
 * ### Example ([live demo](http://plnkr.co/edit/6uHYJK?p=preview))
 *
 * ```typescript
 * class Engine {}
 *
 * @Injectable()
 * class Car {
 *   engine;
 *   constructor(@Inject("MyEngine") engine:Engine) {
 *     this.engine = engine;
 *   }
 * }
 *
 * var injector = Injector.resolveAndCreate([
 *  provide("MyEngine", {useClass: Engine}),
 *  Car
 * ]);
 *
 * expect(injector.get(Car).engine instanceof Engine).toBe(true);
 * ```
 *
 * When `@Inject()` is not present, {@link Injector} will use the type annotation of the parameter.
 *
 * ### Example
 *
 * ```typescript
 * class Engine {}
 *
 * @Injectable()
 * class Car {
 *   constructor(public engine: Engine) {} //same as constructor(@Inject(Engine) engine:Engine)
 * }
 *
 * var injector = Injector.resolveAndCreate([Engine, Car]);
 * expect(injector.get(Car).engine instanceof Engine).toBe(true);
 * ```
 */
var InjectMetadata = (function () {
    function InjectMetadata(token) {
        this.token = token;
    }
    InjectMetadata.prototype.toString = function () { return "@Inject(" + lang_1.stringify(this.token) + ")"; };
    InjectMetadata = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [Object])
    ], InjectMetadata);
    return InjectMetadata;
})();
exports.InjectMetadata = InjectMetadata;
/**
 * A parameter metadata that marks a dependency as optional. {@link Injector} provides `null` if
 * the dependency is not found.
 *
 * ### Example ([live demo](http://plnkr.co/edit/AsryOm?p=preview))
 *
 * ```typescript
 * class Engine {}
 *
 * @Injectable()
 * class Car {
 *   engine;
 *   constructor(@Optional() engine:Engine) {
 *     this.engine = engine;
 *   }
 * }
 *
 * var injector = Injector.resolveAndCreate([Car]);
 * expect(injector.get(Car).engine).toBeNull();
 * ```
 */
var OptionalMetadata = (function () {
    function OptionalMetadata() {
    }
    OptionalMetadata.prototype.toString = function () { return "@Optional()"; };
    OptionalMetadata = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [])
    ], OptionalMetadata);
    return OptionalMetadata;
})();
exports.OptionalMetadata = OptionalMetadata;
/**
 * `DependencyMetadata` is used by the framework to extend DI.
 * This is internal to Angular and should not be used directly.
 */
var DependencyMetadata = (function () {
    function DependencyMetadata() {
    }
    Object.defineProperty(DependencyMetadata.prototype, "token", {
        get: function () { return null; },
        enumerable: true,
        configurable: true
    });
    DependencyMetadata = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [])
    ], DependencyMetadata);
    return DependencyMetadata;
})();
exports.DependencyMetadata = DependencyMetadata;
/**
 * A marker metadata that marks a class as available to {@link Injector} for creation.
 *
 * ### Example ([live demo](http://plnkr.co/edit/Wk4DMQ?p=preview))
 *
 * ```typescript
 * @Injectable()
 * class UsefulService {}
 *
 * @Injectable()
 * class NeedsService {
 *   constructor(public service:UsefulService) {}
 * }
 *
 * var injector = Injector.resolveAndCreate([NeedsService, UsefulService]);
 * expect(injector.get(NeedsService).service instanceof UsefulService).toBe(true);
 * ```
 * {@link Injector} will throw {@link NoAnnotationError} when trying to instantiate a class that
 * does not have `@Injectable` marker, as shown in the example below.
 *
 * ```typescript
 * class UsefulService {}
 *
 * class NeedsService {
 *   constructor(public service:UsefulService) {}
 * }
 *
 * var injector = Injector.resolveAndCreate([NeedsService, UsefulService]);
 * expect(() => injector.get(NeedsService)).toThrowError();
 * ```
 */
var InjectableMetadata = (function () {
    function InjectableMetadata() {
    }
    InjectableMetadata = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [])
    ], InjectableMetadata);
    return InjectableMetadata;
})();
exports.InjectableMetadata = InjectableMetadata;
/**
 * Specifies that an {@link Injector} should retrieve a dependency only from itself.
 *
 * ### Example ([live demo](http://plnkr.co/edit/NeagAg?p=preview))
 *
 * ```typescript
 * class Dependency {
 * }
 *
 * @Injectable()
 * class NeedsDependency {
 *   dependency;
 *   constructor(@Self() dependency:Dependency) {
 *     this.dependency = dependency;
 *   }
 * }
 *
 * var inj = Injector.resolveAndCreate([Dependency, NeedsDependency]);
 * var nd = inj.get(NeedsDependency);
 *
 * expect(nd.dependency instanceof Dependency).toBe(true);
 *
 * var inj = Injector.resolveAndCreate([Dependency]);
 * var child = inj.resolveAndCreateChild([NeedsDependency]);
 * expect(() => child.get(NeedsDependency)).toThrowError();
 * ```
 */
var SelfMetadata = (function () {
    function SelfMetadata() {
    }
    SelfMetadata.prototype.toString = function () { return "@Self()"; };
    SelfMetadata = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [])
    ], SelfMetadata);
    return SelfMetadata;
})();
exports.SelfMetadata = SelfMetadata;
/**
 * Specifies that the dependency resolution should start from the parent injector.
 *
 * ### Example ([live demo](http://plnkr.co/edit/Wchdzb?p=preview))
 *
 * ```typescript
 * class Dependency {
 * }
 *
 * @Injectable()
 * class NeedsDependency {
 *   dependency;
 *   constructor(@SkipSelf() dependency:Dependency) {
 *     this.dependency = dependency;
 *   }
 * }
 *
 * var parent = Injector.resolveAndCreate([Dependency]);
 * var child = parent.resolveAndCreateChild([NeedsDependency]);
 * expect(child.get(NeedsDependency).dependency instanceof Depedency).toBe(true);
 *
 * var inj = Injector.resolveAndCreate([Dependency, NeedsDependency]);
 * expect(() => inj.get(NeedsDependency)).toThrowError();
 * ```
 */
var SkipSelfMetadata = (function () {
    function SkipSelfMetadata() {
    }
    SkipSelfMetadata.prototype.toString = function () { return "@SkipSelf()"; };
    SkipSelfMetadata = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [])
    ], SkipSelfMetadata);
    return SkipSelfMetadata;
})();
exports.SkipSelfMetadata = SkipSelfMetadata;
/**
 * Specifies that an injector should retrieve a dependency from any injector until reaching the
 * closest host.
 *
 * In Angular, a component element is automatically declared as a host for all the injectors in
 * its view.
 *
 * ### Example ([live demo](http://plnkr.co/edit/GX79pV?p=preview))
 *
 * In the following example `App` contains `ParentCmp`, which contains `ChildDirective`.
 * So `ParentCmp` is the host of `ChildDirective`.
 *
 * `ChildDirective` depends on two services: `HostService` and `OtherService`.
 * `HostService` is defined at `ParentCmp`, and `OtherService` is defined at `App`.
 *
 *```typescript
 * class OtherService {}
 * class HostService {}
 *
 * @Directive({
 *   selector: 'child-directive'
 * })
 * class ChildDirective {
 *   constructor(@Optional() @Host() os:OtherService, @Optional() @Host() hs:HostService){
 *     console.log("os is null", os);
 *     console.log("hs is NOT null", hs);
 *   }
 * }
 *
 * @Component({
 *   selector: 'parent-cmp',
 *   providers: [HostService],
 *   template: `
 *     Dir: <child-directive></child-directive>
 *   `,
 *   directives: [ChildDirective]
 * })
 * class ParentCmp {
 * }
 *
 * @Component({
 *   selector: 'app',
 *   providers: [OtherService],
 *   template: `
 *     Parent: <parent-cmp></parent-cmp>
 *   `,
 *   directives: [ParentCmp]
 * })
 * class App {
 * }
 *
 * bootstrap(App);
 *```
 */
var HostMetadata = (function () {
    function HostMetadata() {
    }
    HostMetadata.prototype.toString = function () { return "@Host()"; };
    HostMetadata = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [])
    ], HostMetadata);
    return HostMetadata;
})();
exports.HostMetadata = HostMetadata;
},{"angular2/src/facade/lang":19}],8:[function(require,module,exports){
'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var lang_1 = require('angular2/src/facade/lang');
/**
 * Creates a token that can be used in a DI Provider.
 *
 * ### Example ([live demo](http://plnkr.co/edit/Ys9ezXpj2Mnoy3Uc8KBp?p=preview))
 *
 * ```typescript
 * var t = new OpaqueToken("value");
 *
 * var injector = Injector.resolveAndCreate([
 *   provide(t, {useValue: "bindingValue"})
 * ]);
 *
 * expect(injector.get(t)).toEqual("bindingValue");
 * ```
 *
 * Using an `OpaqueToken` is preferable to using strings as tokens because of possible collisions
 * caused by multiple providers using the same string as two different tokens.
 *
 * Using an `OpaqueToken` is preferable to using an `Object` as tokens because it provides better
 * error messages.
 */
var OpaqueToken = (function () {
    function OpaqueToken(_desc) {
        this._desc = _desc;
    }
    OpaqueToken.prototype.toString = function () { return "Token " + this._desc; };
    OpaqueToken = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [String])
    ], OpaqueToken);
    return OpaqueToken;
})();
exports.OpaqueToken = OpaqueToken;
},{"angular2/src/facade/lang":19}],9:[function(require,module,exports){
'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var collection_1 = require('angular2/src/facade/collection');
var reflection_1 = require('angular2/src/core/reflection/reflection');
var key_1 = require('./key');
var metadata_1 = require('./metadata');
var exceptions_2 = require('./exceptions');
var forward_ref_1 = require('./forward_ref');
/**
 * `Dependency` is used by the framework to extend DI.
 * This is internal to Angular and should not be used directly.
 */
var Dependency = (function () {
    function Dependency(key, optional, lowerBoundVisibility, upperBoundVisibility, properties) {
        this.key = key;
        this.optional = optional;
        this.lowerBoundVisibility = lowerBoundVisibility;
        this.upperBoundVisibility = upperBoundVisibility;
        this.properties = properties;
    }
    Dependency.fromKey = function (key) { return new Dependency(key, false, null, null, []); };
    return Dependency;
})();
exports.Dependency = Dependency;
var _EMPTY_LIST = lang_1.CONST_EXPR([]);
/**
 * Describes how the {@link Injector} should instantiate a given token.
 *
 * See {@link provide}.
 *
 * ### Example ([live demo](http://plnkr.co/edit/GNAyj6K6PfYg2NBzgwZ5?p%3Dpreview&p=preview))
 *
 * ```javascript
 * var injector = Injector.resolveAndCreate([
 *   new Provider("message", { useValue: 'Hello' })
 * ]);
 *
 * expect(injector.get("message")).toEqual('Hello');
 * ```
 */
var Provider = (function () {
    function Provider(token, _a) {
        var useClass = _a.useClass, useValue = _a.useValue, useExisting = _a.useExisting, useFactory = _a.useFactory, deps = _a.deps, multi = _a.multi;
        this.token = token;
        this.useClass = useClass;
        this.useValue = useValue;
        this.useExisting = useExisting;
        this.useFactory = useFactory;
        this.dependencies = deps;
        this._multi = multi;
    }
    Object.defineProperty(Provider.prototype, "multi", {
        // TODO: Provide a full working example after alpha38 is released.
        /**
         * Creates multiple providers matching the same token (a multi-provider).
         *
         * Multi-providers are used for creating pluggable service, where the system comes
         * with some default providers, and the user can register additional providers.
         * The combination of the default providers and the additional providers will be
         * used to drive the behavior of the system.
         *
         * ### Example
         *
         * ```typescript
         * var injector = Injector.resolveAndCreate([
         *   new Provider("Strings", { useValue: "String1", multi: true}),
         *   new Provider("Strings", { useValue: "String2", multi: true})
         * ]);
         *
         * expect(injector.get("Strings")).toEqual(["String1", "String2"]);
         * ```
         *
         * Multi-providers and regular providers cannot be mixed. The following
         * will throw an exception:
         *
         * ```typescript
         * var injector = Injector.resolveAndCreate([
         *   new Provider("Strings", { useValue: "String1", multi: true }),
         *   new Provider("Strings", { useValue: "String2"})
         * ]);
         * ```
         */
        get: function () { return lang_1.normalizeBool(this._multi); },
        enumerable: true,
        configurable: true
    });
    Provider = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [Object, Object])
    ], Provider);
    return Provider;
})();
exports.Provider = Provider;
/**
 * See {@link Provider} instead.
 *
 * @deprecated
 */
var Binding = (function (_super) {
    __extends(Binding, _super);
    function Binding(token, _a) {
        var toClass = _a.toClass, toValue = _a.toValue, toAlias = _a.toAlias, toFactory = _a.toFactory, deps = _a.deps, multi = _a.multi;
        _super.call(this, token, {
            useClass: toClass,
            useValue: toValue,
            useExisting: toAlias,
            useFactory: toFactory,
            deps: deps,
            multi: multi
        });
    }
    Object.defineProperty(Binding.prototype, "toClass", {
        /**
         * @deprecated
         */
        get: function () { return this.useClass; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Binding.prototype, "toAlias", {
        /**
         * @deprecated
         */
        get: function () { return this.useExisting; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Binding.prototype, "toFactory", {
        /**
         * @deprecated
         */
        get: function () { return this.useFactory; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Binding.prototype, "toValue", {
        /**
         * @deprecated
         */
        get: function () { return this.useValue; },
        enumerable: true,
        configurable: true
    });
    Binding = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [Object, Object])
    ], Binding);
    return Binding;
})(Provider);
exports.Binding = Binding;
var ResolvedProvider_ = (function () {
    function ResolvedProvider_(key, resolvedFactories, multiProvider) {
        this.key = key;
        this.resolvedFactories = resolvedFactories;
        this.multiProvider = multiProvider;
    }
    Object.defineProperty(ResolvedProvider_.prototype, "resolvedFactory", {
        get: function () { return this.resolvedFactories[0]; },
        enumerable: true,
        configurable: true
    });
    return ResolvedProvider_;
})();
exports.ResolvedProvider_ = ResolvedProvider_;
/**
 * An internal resolved representation of a factory function created by resolving {@link Provider}.
 */
var ResolvedFactory = (function () {
    function ResolvedFactory(
        /**
         * Factory function which can return an instance of an object represented by a key.
         */
        factory, 
        /**
         * Arguments (dependencies) to the `factory` function.
         */
        dependencies) {
        this.factory = factory;
        this.dependencies = dependencies;
    }
    return ResolvedFactory;
})();
exports.ResolvedFactory = ResolvedFactory;
/**
 * Creates a {@link Provider}.
 *
 * To construct a {@link Provider}, bind a `token` to either a class, a value, a factory function,
 * or
 * to an existing `token`.
 * See {@link ProviderBuilder} for more details.
 *
 * The `token` is most commonly a class or {@link angular2/di/OpaqueToken}.
 *
 * @deprecated
 */
function bind(token) {
    return new ProviderBuilder(token);
}
exports.bind = bind;
/**
 * Creates a {@link Provider}.
 *
 * See {@link Provider} for more details.
 *
 * <!-- TODO: improve the docs -->
 */
function provide(token, _a) {
    var useClass = _a.useClass, useValue = _a.useValue, useExisting = _a.useExisting, useFactory = _a.useFactory, deps = _a.deps, multi = _a.multi;
    return new Provider(token, {
        useClass: useClass,
        useValue: useValue,
        useExisting: useExisting,
        useFactory: useFactory,
        deps: deps,
        multi: multi
    });
}
exports.provide = provide;
/**
 * Helper class for the {@link bind} function.
 */
var ProviderBuilder = (function () {
    function ProviderBuilder(token) {
        this.token = token;
    }
    /**
     * Binds a DI token to a class.
     *
     * ### Example ([live demo](http://plnkr.co/edit/ZpBCSYqv6e2ud5KXLdxQ?p=preview))
     *
     * Because `toAlias` and `toClass` are often confused, the example contains
     * both use cases for easy comparison.
     *
     * ```typescript
     * class Vehicle {}
     *
     * class Car extends Vehicle {}
     *
     * var injectorClass = Injector.resolveAndCreate([
     *   Car,
     *   provide(Vehicle, {useClass: Car})
     * ]);
     * var injectorAlias = Injector.resolveAndCreate([
     *   Car,
     *   provide(Vehicle, {useExisting: Car})
     * ]);
     *
     * expect(injectorClass.get(Vehicle)).not.toBe(injectorClass.get(Car));
     * expect(injectorClass.get(Vehicle) instanceof Car).toBe(true);
     *
     * expect(injectorAlias.get(Vehicle)).toBe(injectorAlias.get(Car));
     * expect(injectorAlias.get(Vehicle) instanceof Car).toBe(true);
     * ```
     */
    ProviderBuilder.prototype.toClass = function (type) {
        if (!lang_1.isType(type)) {
            throw new exceptions_1.BaseException("Trying to create a class provider but \"" + lang_1.stringify(type) + "\" is not a class!");
        }
        return new Provider(this.token, { useClass: type });
    };
    /**
     * Binds a DI token to a value.
     *
     * ### Example ([live demo](http://plnkr.co/edit/G024PFHmDL0cJFgfZK8O?p=preview))
     *
     * ```typescript
     * var injector = Injector.resolveAndCreate([
     *   provide('message', {useValue: 'Hello'})
     * ]);
     *
     * expect(injector.get('message')).toEqual('Hello');
     * ```
     */
    ProviderBuilder.prototype.toValue = function (value) { return new Provider(this.token, { useValue: value }); };
    /**
     * Binds a DI token to an existing token.
     *
     * Angular will return the same instance as if the provided token was used. (This is
     * in contrast to `useClass` where a separate instance of `useClass` will be returned.)
     *
     * ### Example ([live demo](http://plnkr.co/edit/uBaoF2pN5cfc5AfZapNw?p=preview))
     *
     * Because `toAlias` and `toClass` are often confused, the example contains
     * both use cases for easy comparison.
     *
     * ```typescript
     * class Vehicle {}
     *
     * class Car extends Vehicle {}
     *
     * var injectorAlias = Injector.resolveAndCreate([
     *   Car,
     *   provide(Vehicle, {useExisting: Car})
     * ]);
     * var injectorClass = Injector.resolveAndCreate([
     *   Car,
     *   provide(Vehicle, {useClass: Car})
     * ]);
     *
     * expect(injectorAlias.get(Vehicle)).toBe(injectorAlias.get(Car));
     * expect(injectorAlias.get(Vehicle) instanceof Car).toBe(true);
     *
     * expect(injectorClass.get(Vehicle)).not.toBe(injectorClass.get(Car));
     * expect(injectorClass.get(Vehicle) instanceof Car).toBe(true);
     * ```
     */
    ProviderBuilder.prototype.toAlias = function (aliasToken) {
        if (lang_1.isBlank(aliasToken)) {
            throw new exceptions_1.BaseException("Can not alias " + lang_1.stringify(this.token) + " to a blank value!");
        }
        return new Provider(this.token, { useExisting: aliasToken });
    };
    /**
     * Binds a DI token to a function which computes the value.
     *
     * ### Example ([live demo](http://plnkr.co/edit/OejNIfTT3zb1iBxaIYOb?p=preview))
     *
     * ```typescript
     * var injector = Injector.resolveAndCreate([
     *   provide(Number, {useFactory: () => { return 1+2; }}),
     *   provide(String, {useFactory: (v) => { return "Value: " + v; }, deps: [Number]})
     * ]);
     *
     * expect(injector.get(Number)).toEqual(3);
     * expect(injector.get(String)).toEqual('Value: 3');
     * ```
     */
    ProviderBuilder.prototype.toFactory = function (factory, dependencies) {
        if (!lang_1.isFunction(factory)) {
            throw new exceptions_1.BaseException("Trying to create a factory provider but \"" + lang_1.stringify(factory) + "\" is not a function!");
        }
        return new Provider(this.token, { useFactory: factory, deps: dependencies });
    };
    return ProviderBuilder;
})();
exports.ProviderBuilder = ProviderBuilder;
/**
 * Resolve a single provider.
 */
function resolveFactory(provider) {
    var factoryFn;
    var resolvedDeps;
    if (lang_1.isPresent(provider.useClass)) {
        var useClass = forward_ref_1.resolveForwardRef(provider.useClass);
        factoryFn = reflection_1.reflector.factory(useClass);
        resolvedDeps = _dependenciesFor(useClass);
    }
    else if (lang_1.isPresent(provider.useExisting)) {
        factoryFn = function (aliasInstance) { return aliasInstance; };
        resolvedDeps = [Dependency.fromKey(key_1.Key.get(provider.useExisting))];
    }
    else if (lang_1.isPresent(provider.useFactory)) {
        factoryFn = provider.useFactory;
        resolvedDeps = _constructDependencies(provider.useFactory, provider.dependencies);
    }
    else {
        factoryFn = function () { return provider.useValue; };
        resolvedDeps = _EMPTY_LIST;
    }
    return new ResolvedFactory(factoryFn, resolvedDeps);
}
exports.resolveFactory = resolveFactory;
/**
 * Converts the {@link Provider} into {@link ResolvedProvider}.
 *
 * {@link Injector} internally only uses {@link ResolvedProvider}, {@link Provider} contains
 * convenience provider syntax.
 */
function resolveProvider(provider) {
    return new ResolvedProvider_(key_1.Key.get(provider.token), [resolveFactory(provider)], provider.multi);
}
exports.resolveProvider = resolveProvider;
/**
 * Resolve a list of Providers.
 */
function resolveProviders(providers) {
    var normalized = _normalizeProviders(providers, []);
    var resolved = normalized.map(resolveProvider);
    return collection_1.MapWrapper.values(mergeResolvedProviders(resolved, new Map()));
}
exports.resolveProviders = resolveProviders;
/**
 * Merges a list of ResolvedProviders into a list where
 * each key is contained exactly once and multi providers
 * have been merged.
 */
function mergeResolvedProviders(providers, normalizedProvidersMap) {
    for (var i = 0; i < providers.length; i++) {
        var provider = providers[i];
        var existing = normalizedProvidersMap.get(provider.key.id);
        if (lang_1.isPresent(existing)) {
            if (provider.multiProvider !== existing.multiProvider) {
                throw new exceptions_2.MixingMultiProvidersWithRegularProvidersError(existing, provider);
            }
            if (provider.multiProvider) {
                for (var j = 0; j < provider.resolvedFactories.length; j++) {
                    existing.resolvedFactories.push(provider.resolvedFactories[j]);
                }
            }
            else {
                normalizedProvidersMap.set(provider.key.id, provider);
            }
        }
        else {
            var resolvedProvider;
            if (provider.multiProvider) {
                resolvedProvider = new ResolvedProvider_(provider.key, collection_1.ListWrapper.clone(provider.resolvedFactories), provider.multiProvider);
            }
            else {
                resolvedProvider = provider;
            }
            normalizedProvidersMap.set(provider.key.id, resolvedProvider);
        }
    }
    return normalizedProvidersMap;
}
exports.mergeResolvedProviders = mergeResolvedProviders;
function _normalizeProviders(providers, res) {
    providers.forEach(function (b) {
        if (b instanceof lang_1.Type) {
            res.push(provide(b, { useClass: b }));
        }
        else if (b instanceof Provider) {
            res.push(b);
        }
        else if (b instanceof Array) {
            _normalizeProviders(b, res);
        }
        else if (b instanceof ProviderBuilder) {
            throw new exceptions_2.InvalidProviderError(b.token);
        }
        else {
            throw new exceptions_2.InvalidProviderError(b);
        }
    });
    return res;
}
function _constructDependencies(factoryFunction, dependencies) {
    if (lang_1.isBlank(dependencies)) {
        return _dependenciesFor(factoryFunction);
    }
    else {
        var params = dependencies.map(function (t) { return [t]; });
        return dependencies.map(function (t) { return _extractToken(factoryFunction, t, params); });
    }
}
function _dependenciesFor(typeOrFunc) {
    var params = reflection_1.reflector.parameters(typeOrFunc);
    if (lang_1.isBlank(params))
        return [];
    if (params.some(lang_1.isBlank)) {
        throw new exceptions_2.NoAnnotationError(typeOrFunc, params);
    }
    return params.map(function (p) { return _extractToken(typeOrFunc, p, params); });
}
function _extractToken(typeOrFunc, metadata /*any[] | any*/, params) {
    var depProps = [];
    var token = null;
    var optional = false;
    if (!lang_1.isArray(metadata)) {
        if (metadata instanceof metadata_1.InjectMetadata) {
            return _createDependency(metadata.token, optional, null, null, depProps);
        }
        else {
            return _createDependency(metadata, optional, null, null, depProps);
        }
    }
    var lowerBoundVisibility = null;
    var upperBoundVisibility = null;
    for (var i = 0; i < metadata.length; ++i) {
        var paramMetadata = metadata[i];
        if (paramMetadata instanceof lang_1.Type) {
            token = paramMetadata;
        }
        else if (paramMetadata instanceof metadata_1.InjectMetadata) {
            token = paramMetadata.token;
        }
        else if (paramMetadata instanceof metadata_1.OptionalMetadata) {
            optional = true;
        }
        else if (paramMetadata instanceof metadata_1.SelfMetadata) {
            upperBoundVisibility = paramMetadata;
        }
        else if (paramMetadata instanceof metadata_1.HostMetadata) {
            upperBoundVisibility = paramMetadata;
        }
        else if (paramMetadata instanceof metadata_1.SkipSelfMetadata) {
            lowerBoundVisibility = paramMetadata;
        }
        else if (paramMetadata instanceof metadata_1.DependencyMetadata) {
            if (lang_1.isPresent(paramMetadata.token)) {
                token = paramMetadata.token;
            }
            depProps.push(paramMetadata);
        }
    }
    token = forward_ref_1.resolveForwardRef(token);
    if (lang_1.isPresent(token)) {
        return _createDependency(token, optional, lowerBoundVisibility, upperBoundVisibility, depProps);
    }
    else {
        throw new exceptions_2.NoAnnotationError(typeOrFunc, params);
    }
}
function _createDependency(token, optional, lowerBoundVisibility, upperBoundVisibility, depProps) {
    return new Dependency(key_1.Key.get(token), optional, lowerBoundVisibility, upperBoundVisibility, depProps);
}
},{"./exceptions":3,"./forward_ref":4,"./key":6,"./metadata":7,"angular2/src/core/reflection/reflection":10,"angular2/src/facade/collection":16,"angular2/src/facade/exceptions":18,"angular2/src/facade/lang":19}],10:[function(require,module,exports){
'use strict';var reflector_1 = require('./reflector');
var reflector_2 = require('./reflector');
exports.Reflector = reflector_2.Reflector;
exports.ReflectionInfo = reflector_2.ReflectionInfo;
var reflection_capabilities_1 = require('./reflection_capabilities');
/**
 * The {@link Reflector} used internally in Angular to access metadata
 * about symbols.
 */
exports.reflector = new reflector_1.Reflector(new reflection_capabilities_1.ReflectionCapabilities());
},{"./reflection_capabilities":11,"./reflector":12}],11:[function(require,module,exports){
'use strict';var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var ReflectionCapabilities = (function () {
    function ReflectionCapabilities(reflect) {
        this._reflect = lang_1.isPresent(reflect) ? reflect : lang_1.global.Reflect;
    }
    ReflectionCapabilities.prototype.isReflectionEnabled = function () { return true; };
    ReflectionCapabilities.prototype.factory = function (t) {
        switch (t.length) {
            case 0:
                return function () { return new t(); };
            case 1:
                return function (a1) { return new t(a1); };
            case 2:
                return function (a1, a2) { return new t(a1, a2); };
            case 3:
                return function (a1, a2, a3) { return new t(a1, a2, a3); };
            case 4:
                return function (a1, a2, a3, a4) { return new t(a1, a2, a3, a4); };
            case 5:
                return function (a1, a2, a3, a4, a5) { return new t(a1, a2, a3, a4, a5); };
            case 6:
                return function (a1, a2, a3, a4, a5, a6) {
                    return new t(a1, a2, a3, a4, a5, a6);
                };
            case 7:
                return function (a1, a2, a3, a4, a5, a6, a7) {
                    return new t(a1, a2, a3, a4, a5, a6, a7);
                };
            case 8:
                return function (a1, a2, a3, a4, a5, a6, a7, a8) {
                    return new t(a1, a2, a3, a4, a5, a6, a7, a8);
                };
            case 9:
                return function (a1, a2, a3, a4, a5, a6, a7, a8, a9) {
                    return new t(a1, a2, a3, a4, a5, a6, a7, a8, a9);
                };
            case 10:
                return function (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
                    return new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
                };
            case 11:
                return function (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) {
                    return new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11);
                };
            case 12:
                return function (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12) {
                    return new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12);
                };
            case 13:
                return function (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13) {
                    return new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13);
                };
            case 14:
                return function (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14) {
                    return new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14);
                };
            case 15:
                return function (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15) {
                    return new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15);
                };
            case 16:
                return function (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16) {
                    return new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16);
                };
            case 17:
                return function (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17) {
                    return new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17);
                };
            case 18:
                return function (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18) {
                    return new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18);
                };
            case 19:
                return function (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19) {
                    return new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19);
                };
            case 20:
                return function (a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19, a20) {
                    return new t(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19, a20);
                };
        }
        ;
        throw new Error("Cannot create a factory for '" + lang_1.stringify(t) + "' because its constructor has more than 20 arguments");
    };
    /** @internal */
    ReflectionCapabilities.prototype._zipTypesAndAnnotations = function (paramTypes, paramAnnotations) {
        var result;
        if (typeof paramTypes === 'undefined') {
            result = new Array(paramAnnotations.length);
        }
        else {
            result = new Array(paramTypes.length);
        }
        for (var i = 0; i < result.length; i++) {
            // TS outputs Object for parameters without types, while Traceur omits
            // the annotations. For now we preserve the Traceur behavior to aid
            // migration, but this can be revisited.
            if (typeof paramTypes === 'undefined') {
                result[i] = [];
            }
            else if (paramTypes[i] != Object) {
                result[i] = [paramTypes[i]];
            }
            else {
                result[i] = [];
            }
            if (lang_1.isPresent(paramAnnotations) && lang_1.isPresent(paramAnnotations[i])) {
                result[i] = result[i].concat(paramAnnotations[i]);
            }
        }
        return result;
    };
    ReflectionCapabilities.prototype.parameters = function (typeOrFunc) {
        // Prefer the direct API.
        if (lang_1.isPresent(typeOrFunc.parameters)) {
            return typeOrFunc.parameters;
        }
        if (lang_1.isPresent(this._reflect) && lang_1.isPresent(this._reflect.getMetadata)) {
            var paramAnnotations = this._reflect.getMetadata('parameters', typeOrFunc);
            var paramTypes = this._reflect.getMetadata('design:paramtypes', typeOrFunc);
            if (lang_1.isPresent(paramTypes) || lang_1.isPresent(paramAnnotations)) {
                return this._zipTypesAndAnnotations(paramTypes, paramAnnotations);
            }
        }
        // The array has to be filled with `undefined` because holes would be skipped by `some`
        var parameters = new Array(typeOrFunc.length);
        parameters.fill(undefined);
        return parameters;
    };
    ReflectionCapabilities.prototype.annotations = function (typeOrFunc) {
        // Prefer the direct API.
        if (lang_1.isPresent(typeOrFunc.annotations)) {
            var annotations = typeOrFunc.annotations;
            if (lang_1.isFunction(annotations) && annotations.annotations) {
                annotations = annotations.annotations;
            }
            return annotations;
        }
        if (lang_1.isPresent(this._reflect) && lang_1.isPresent(this._reflect.getMetadata)) {
            var annotations = this._reflect.getMetadata('annotations', typeOrFunc);
            if (lang_1.isPresent(annotations))
                return annotations;
        }
        return [];
    };
    ReflectionCapabilities.prototype.propMetadata = function (typeOrFunc) {
        // Prefer the direct API.
        if (lang_1.isPresent(typeOrFunc.propMetadata)) {
            var propMetadata = typeOrFunc.propMetadata;
            if (lang_1.isFunction(propMetadata) && propMetadata.propMetadata) {
                propMetadata = propMetadata.propMetadata;
            }
            return propMetadata;
        }
        if (lang_1.isPresent(this._reflect) && lang_1.isPresent(this._reflect.getMetadata)) {
            var propMetadata = this._reflect.getMetadata('propMetadata', typeOrFunc);
            if (lang_1.isPresent(propMetadata))
                return propMetadata;
        }
        return {};
    };
    ReflectionCapabilities.prototype.interfaces = function (type) {
        throw new exceptions_1.BaseException("JavaScript does not support interfaces");
    };
    ReflectionCapabilities.prototype.getter = function (name) { return new Function('o', 'return o.' + name + ';'); };
    ReflectionCapabilities.prototype.setter = function (name) {
        return new Function('o', 'v', 'return o.' + name + ' = v;');
    };
    ReflectionCapabilities.prototype.method = function (name) {
        var functionBody = "if (!o." + name + ") throw new Error('\"" + name + "\" is undefined');\n        return o." + name + ".apply(o, args);";
        return new Function('o', 'args', functionBody);
    };
    // There is not a concept of import uri in Js, but this is useful in developing Dart applications.
    ReflectionCapabilities.prototype.importUri = function (type) { return './'; };
    return ReflectionCapabilities;
})();
exports.ReflectionCapabilities = ReflectionCapabilities;
},{"angular2/src/facade/exceptions":18,"angular2/src/facade/lang":19}],12:[function(require,module,exports){
'use strict';var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var collection_1 = require('angular2/src/facade/collection');
/**
 * Reflective information about a symbol, including annotations, interfaces, and other metadata.
 */
var ReflectionInfo = (function () {
    function ReflectionInfo(annotations, parameters, factory, interfaces, propMetadata) {
        this.annotations = annotations;
        this.parameters = parameters;
        this.factory = factory;
        this.interfaces = interfaces;
        this.propMetadata = propMetadata;
    }
    return ReflectionInfo;
})();
exports.ReflectionInfo = ReflectionInfo;
/**
 * Provides access to reflection data about symbols. Used internally by Angular
 * to power dependency injection and compilation.
 */
var Reflector = (function () {
    function Reflector(reflectionCapabilities) {
        /** @internal */
        this._injectableInfo = new collection_1.Map();
        /** @internal */
        this._getters = new collection_1.Map();
        /** @internal */
        this._setters = new collection_1.Map();
        /** @internal */
        this._methods = new collection_1.Map();
        this._usedKeys = null;
        this.reflectionCapabilities = reflectionCapabilities;
    }
    Reflector.prototype.isReflectionEnabled = function () { return this.reflectionCapabilities.isReflectionEnabled(); };
    /**
     * Causes `this` reflector to track keys used to access
     * {@link ReflectionInfo} objects.
     */
    Reflector.prototype.trackUsage = function () { this._usedKeys = new collection_1.Set(); };
    /**
     * Lists types for which reflection information was not requested since
     * {@link #trackUsage} was called. This list could later be audited as
     * potential dead code.
     */
    Reflector.prototype.listUnusedKeys = function () {
        var _this = this;
        if (this._usedKeys == null) {
            throw new exceptions_1.BaseException('Usage tracking is disabled');
        }
        var allTypes = collection_1.MapWrapper.keys(this._injectableInfo);
        return allTypes.filter(function (key) { return !collection_1.SetWrapper.has(_this._usedKeys, key); });
    };
    Reflector.prototype.registerFunction = function (func, funcInfo) {
        this._injectableInfo.set(func, funcInfo);
    };
    Reflector.prototype.registerType = function (type, typeInfo) {
        this._injectableInfo.set(type, typeInfo);
    };
    Reflector.prototype.registerGetters = function (getters) { _mergeMaps(this._getters, getters); };
    Reflector.prototype.registerSetters = function (setters) { _mergeMaps(this._setters, setters); };
    Reflector.prototype.registerMethods = function (methods) { _mergeMaps(this._methods, methods); };
    Reflector.prototype.factory = function (type) {
        if (this._containsReflectionInfo(type)) {
            var res = this._getReflectionInfo(type).factory;
            return lang_1.isPresent(res) ? res : null;
        }
        else {
            return this.reflectionCapabilities.factory(type);
        }
    };
    Reflector.prototype.parameters = function (typeOrFunc) {
        if (this._injectableInfo.has(typeOrFunc)) {
            var res = this._getReflectionInfo(typeOrFunc).parameters;
            return lang_1.isPresent(res) ? res : [];
        }
        else {
            return this.reflectionCapabilities.parameters(typeOrFunc);
        }
    };
    Reflector.prototype.annotations = function (typeOrFunc) {
        if (this._injectableInfo.has(typeOrFunc)) {
            var res = this._getReflectionInfo(typeOrFunc).annotations;
            return lang_1.isPresent(res) ? res : [];
        }
        else {
            return this.reflectionCapabilities.annotations(typeOrFunc);
        }
    };
    Reflector.prototype.propMetadata = function (typeOrFunc) {
        if (this._injectableInfo.has(typeOrFunc)) {
            var res = this._getReflectionInfo(typeOrFunc).propMetadata;
            return lang_1.isPresent(res) ? res : {};
        }
        else {
            return this.reflectionCapabilities.propMetadata(typeOrFunc);
        }
    };
    Reflector.prototype.interfaces = function (type) {
        if (this._injectableInfo.has(type)) {
            var res = this._getReflectionInfo(type).interfaces;
            return lang_1.isPresent(res) ? res : [];
        }
        else {
            return this.reflectionCapabilities.interfaces(type);
        }
    };
    Reflector.prototype.getter = function (name) {
        if (this._getters.has(name)) {
            return this._getters.get(name);
        }
        else {
            return this.reflectionCapabilities.getter(name);
        }
    };
    Reflector.prototype.setter = function (name) {
        if (this._setters.has(name)) {
            return this._setters.get(name);
        }
        else {
            return this.reflectionCapabilities.setter(name);
        }
    };
    Reflector.prototype.method = function (name) {
        if (this._methods.has(name)) {
            return this._methods.get(name);
        }
        else {
            return this.reflectionCapabilities.method(name);
        }
    };
    /** @internal */
    Reflector.prototype._getReflectionInfo = function (typeOrFunc) {
        if (lang_1.isPresent(this._usedKeys)) {
            this._usedKeys.add(typeOrFunc);
        }
        return this._injectableInfo.get(typeOrFunc);
    };
    /** @internal */
    Reflector.prototype._containsReflectionInfo = function (typeOrFunc) { return this._injectableInfo.has(typeOrFunc); };
    Reflector.prototype.importUri = function (type) { return this.reflectionCapabilities.importUri(type); };
    return Reflector;
})();
exports.Reflector = Reflector;
function _mergeMaps(target, config) {
    collection_1.StringMapWrapper.forEach(config, function (v, k) { return target.set(k, v); });
}
},{"angular2/src/facade/collection":16,"angular2/src/facade/exceptions":18,"angular2/src/facade/lang":19}],13:[function(require,module,exports){
'use strict';var lang_1 = require('angular2/src/facade/lang');
var _nextClassId = 0;
function extractAnnotation(annotation) {
    if (lang_1.isFunction(annotation) && annotation.hasOwnProperty('annotation')) {
        // it is a decorator, extract annotation
        annotation = annotation.annotation;
    }
    return annotation;
}
function applyParams(fnOrArray, key) {
    if (fnOrArray === Object || fnOrArray === String || fnOrArray === Function ||
        fnOrArray === Number || fnOrArray === Array) {
        throw new Error("Can not use native " + lang_1.stringify(fnOrArray) + " as constructor");
    }
    if (lang_1.isFunction(fnOrArray)) {
        return fnOrArray;
    }
    else if (fnOrArray instanceof Array) {
        var annotations = fnOrArray;
        var fn = fnOrArray[fnOrArray.length - 1];
        if (!lang_1.isFunction(fn)) {
            throw new Error("Last position of Class method array must be Function in key " + key + " was '" + lang_1.stringify(fn) + "'");
        }
        var annoLength = annotations.length - 1;
        if (annoLength != fn.length) {
            throw new Error("Number of annotations (" + annoLength + ") does not match number of arguments (" + fn.length + ") in the function: " + lang_1.stringify(fn));
        }
        var paramsAnnotations = [];
        for (var i = 0, ii = annotations.length - 1; i < ii; i++) {
            var paramAnnotations = [];
            paramsAnnotations.push(paramAnnotations);
            var annotation = annotations[i];
            if (annotation instanceof Array) {
                for (var j = 0; j < annotation.length; j++) {
                    paramAnnotations.push(extractAnnotation(annotation[j]));
                }
            }
            else if (lang_1.isFunction(annotation)) {
                paramAnnotations.push(extractAnnotation(annotation));
            }
            else {
                paramAnnotations.push(annotation);
            }
        }
        Reflect.defineMetadata('parameters', paramsAnnotations, fn);
        return fn;
    }
    else {
        throw new Error("Only Function or Array is supported in Class definition for key '" + key + "' is '" + lang_1.stringify(fnOrArray) + "'");
    }
}
/**
 * Provides a way for expressing ES6 classes with parameter annotations in ES5.
 *
 * ## Basic Example
 *
 * ```
 * var Greeter = ng.Class({
 *   constructor: function(name) {
 *     this.name = name;
 *   },
 *
 *   greet: function() {
 *     alert('Hello ' + this.name + '!');
 *   }
 * });
 * ```
 *
 * is equivalent to ES6:
 *
 * ```
 * class Greeter {
 *   constructor(name) {
 *     this.name = name;
 *   }
 *
 *   greet() {
 *     alert('Hello ' + this.name + '!');
 *   }
 * }
 * ```
 *
 * or equivalent to ES5:
 *
 * ```
 * var Greeter = function (name) {
 *   this.name = name;
 * }
 *
 * Greeter.prototype.greet = function () {
 *   alert('Hello ' + this.name + '!');
 * }
 * ```
 *
 * ### Example with parameter annotations
 *
 * ```
 * var MyService = ng.Class({
 *   constructor: [String, [new Query(), QueryList], function(name, queryList) {
 *     ...
 *   }]
 * });
 * ```
 *
 * is equivalent to ES6:
 *
 * ```
 * class MyService {
 *   constructor(name: string, @Query() queryList: QueryList) {
 *     ...
 *   }
 * }
 * ```
 *
 * ### Example with inheritance
 *
 * ```
 * var Shape = ng.Class({
 *   constructor: (color) {
 *     this.color = color;
 *   }
 * });
 *
 * var Square = ng.Class({
 *   extends: Shape,
 *   constructor: function(color, size) {
 *     Shape.call(this, color);
 *     this.size = size;
 *   }
 * });
 * ```
 */
function Class(clsDef) {
    var constructor = applyParams(clsDef.hasOwnProperty('constructor') ? clsDef.constructor : undefined, 'constructor');
    var proto = constructor.prototype;
    if (clsDef.hasOwnProperty('extends')) {
        if (lang_1.isFunction(clsDef.extends)) {
            constructor.prototype = proto =
                Object.create(clsDef.extends.prototype);
        }
        else {
            throw new Error("Class definition 'extends' property must be a constructor function was: " + lang_1.stringify(clsDef.extends));
        }
    }
    for (var key in clsDef) {
        if (key != 'extends' && key != 'prototype' && clsDef.hasOwnProperty(key)) {
            proto[key] = applyParams(clsDef[key], key);
        }
    }
    if (this && this.annotations instanceof Array) {
        Reflect.defineMetadata('annotations', this.annotations, constructor);
    }
    if (!constructor['name']) {
        constructor['overriddenName'] = "class" + _nextClassId++;
    }
    return constructor;
}
exports.Class = Class;
var Reflect = lang_1.global.Reflect;
if (!(Reflect && Reflect.getMetadata)) {
    throw 'reflect-metadata shim is required when using class decorators';
}
function makeDecorator(annotationCls, chainFn) {
    if (chainFn === void 0) { chainFn = null; }
    function DecoratorFactory(objOrType) {
        var annotationInstance = new annotationCls(objOrType);
        if (this instanceof annotationCls) {
            return annotationInstance;
        }
        else {
            var chainAnnotation = lang_1.isFunction(this) && this.annotations instanceof Array ? this.annotations : [];
            chainAnnotation.push(annotationInstance);
            var TypeDecorator = function TypeDecorator(cls) {
                var annotations = Reflect.getOwnMetadata('annotations', cls);
                annotations = annotations || [];
                annotations.push(annotationInstance);
                Reflect.defineMetadata('annotations', annotations, cls);
                return cls;
            };
            TypeDecorator.annotations = chainAnnotation;
            TypeDecorator.Class = Class;
            if (chainFn)
                chainFn(TypeDecorator);
            return TypeDecorator;
        }
    }
    DecoratorFactory.prototype = Object.create(annotationCls.prototype);
    return DecoratorFactory;
}
exports.makeDecorator = makeDecorator;
function makeParamDecorator(annotationCls) {
    function ParamDecoratorFactory() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        var annotationInstance = Object.create(annotationCls.prototype);
        annotationCls.apply(annotationInstance, args);
        if (this instanceof annotationCls) {
            return annotationInstance;
        }
        else {
            ParamDecorator.annotation = annotationInstance;
            return ParamDecorator;
        }
        function ParamDecorator(cls, unusedKey, index) {
            var parameters = Reflect.getMetadata('parameters', cls);
            parameters = parameters || [];
            // there might be gaps if some in between parameters do not have annotations.
            // we pad with nulls.
            while (parameters.length <= index) {
                parameters.push(null);
            }
            parameters[index] = parameters[index] || [];
            var annotationsForParam = parameters[index];
            annotationsForParam.push(annotationInstance);
            Reflect.defineMetadata('parameters', parameters, cls);
            return cls;
        }
    }
    ParamDecoratorFactory.prototype = Object.create(annotationCls.prototype);
    return ParamDecoratorFactory;
}
exports.makeParamDecorator = makeParamDecorator;
function makePropDecorator(decoratorCls) {
    function PropDecoratorFactory() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        var decoratorInstance = Object.create(decoratorCls.prototype);
        decoratorCls.apply(decoratorInstance, args);
        if (this instanceof decoratorCls) {
            return decoratorInstance;
        }
        else {
            return function PropDecorator(target, name) {
                var meta = Reflect.getOwnMetadata('propMetadata', target.constructor);
                meta = meta || {};
                meta[name] = meta[name] || [];
                meta[name].unshift(decoratorInstance);
                Reflect.defineMetadata('propMetadata', meta, target.constructor);
            };
        }
    }
    PropDecoratorFactory.prototype = Object.create(decoratorCls.prototype);
    return PropDecoratorFactory;
}
exports.makePropDecorator = makePropDecorator;
},{"angular2/src/facade/lang":19}],14:[function(require,module,exports){
'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var lang_1 = require('angular2/src/facade/lang');
var promise_1 = require('angular2/src/facade/promise');
exports.PromiseWrapper = promise_1.PromiseWrapper;
var Subject_1 = require('rxjs/Subject');
var PromiseObservable_1 = require('rxjs/observable/PromiseObservable');
var toPromise_1 = require('rxjs/operator/toPromise');
var Observable_1 = require('rxjs/Observable');
exports.Observable = Observable_1.Observable;
var Subject_2 = require('rxjs/Subject');
exports.Subject = Subject_2.Subject;
var TimerWrapper = (function () {
    function TimerWrapper() {
    }
    TimerWrapper.setTimeout = function (fn, millis) {
        return lang_1.global.setTimeout(fn, millis);
    };
    TimerWrapper.clearTimeout = function (id) { lang_1.global.clearTimeout(id); };
    TimerWrapper.setInterval = function (fn, millis) {
        return lang_1.global.setInterval(fn, millis);
    };
    TimerWrapper.clearInterval = function (id) { lang_1.global.clearInterval(id); };
    return TimerWrapper;
})();
exports.TimerWrapper = TimerWrapper;
var ObservableWrapper = (function () {
    function ObservableWrapper() {
    }
    // TODO(vsavkin): when we use rxnext, try inferring the generic type from the first arg
    ObservableWrapper.subscribe = function (emitter, onNext, onError, onComplete) {
        if (onComplete === void 0) { onComplete = function () { }; }
        onError = (typeof onError === "function") && onError || lang_1.noop;
        onComplete = (typeof onComplete === "function") && onComplete || lang_1.noop;
        return emitter.subscribe({ next: onNext, error: onError, complete: onComplete });
    };
    ObservableWrapper.isObservable = function (obs) { return !!obs.subscribe; };
    /**
     * Returns whether `obs` has any subscribers listening to events.
     */
    ObservableWrapper.hasSubscribers = function (obs) { return obs.observers.length > 0; };
    ObservableWrapper.dispose = function (subscription) { subscription.unsubscribe(); };
    /**
     * @deprecated - use callEmit() instead
     */
    ObservableWrapper.callNext = function (emitter, value) { emitter.next(value); };
    ObservableWrapper.callEmit = function (emitter, value) { emitter.emit(value); };
    ObservableWrapper.callError = function (emitter, error) { emitter.error(error); };
    ObservableWrapper.callComplete = function (emitter) { emitter.complete(); };
    ObservableWrapper.fromPromise = function (promise) {
        return PromiseObservable_1.PromiseObservable.create(promise);
    };
    ObservableWrapper.toPromise = function (obj) { return toPromise_1.toPromise.call(obj); };
    return ObservableWrapper;
})();
exports.ObservableWrapper = ObservableWrapper;
/**
 * Use by directives and components to emit custom Events.
 *
 * ### Examples
 *
 * In the following example, `Zippy` alternatively emits `open` and `close` events when its
 * title gets clicked:
 *
 * ```
 * @Component({
 *   selector: 'zippy',
 *   template: `
 *   <div class="zippy">
 *     <div (click)="toggle()">Toggle</div>
 *     <div [hidden]="!visible">
 *       <ng-content></ng-content>
 *     </div>
 *  </div>`})
 * export class Zippy {
 *   visible: boolean = true;
 *   @Output() open: EventEmitter<any> = new EventEmitter();
 *   @Output() close: EventEmitter<any> = new EventEmitter();
 *
 *   toggle() {
 *     this.visible = !this.visible;
 *     if (this.visible) {
 *       this.open.emit(null);
 *     } else {
 *       this.close.emit(null);
 *     }
 *   }
 * }
 * ```
 *
 * Use Rx.Observable but provides an adapter to make it work as specified here:
 * https://github.com/jhusain/observable-spec
 *
 * Once a reference implementation of the spec is available, switch to it.
 */
var EventEmitter = (function (_super) {
    __extends(EventEmitter, _super);
    /**
     * Creates an instance of [EventEmitter], which depending on [isAsync],
     * delivers events synchronously or asynchronously.
     */
    function EventEmitter(isAsync) {
        if (isAsync === void 0) { isAsync = true; }
        _super.call(this);
        this._isAsync = isAsync;
    }
    EventEmitter.prototype.emit = function (value) { _super.prototype.next.call(this, value); };
    /**
     * @deprecated - use .emit(value) instead
     */
    EventEmitter.prototype.next = function (value) { _super.prototype.next.call(this, value); };
    EventEmitter.prototype.subscribe = function (generatorOrNext, error, complete) {
        var schedulerFn;
        var errorFn = function (err) { return null; };
        var completeFn = function () { return null; };
        if (generatorOrNext && typeof generatorOrNext === 'object') {
            schedulerFn = this._isAsync ? function (value) { setTimeout(function () { return generatorOrNext.next(value); }); } :
                function (value) { generatorOrNext.next(value); };
            if (generatorOrNext.error) {
                errorFn = this._isAsync ? function (err) { setTimeout(function () { return generatorOrNext.error(err); }); } :
                    function (err) { generatorOrNext.error(err); };
            }
            if (generatorOrNext.complete) {
                completeFn = this._isAsync ? function () { setTimeout(function () { return generatorOrNext.complete(); }); } :
                    function () { generatorOrNext.complete(); };
            }
        }
        else {
            schedulerFn = this._isAsync ? function (value) { setTimeout(function () { return generatorOrNext(value); }); } :
                function (value) { generatorOrNext(value); };
            if (error) {
                errorFn =
                    this._isAsync ? function (err) { setTimeout(function () { return error(err); }); } : function (err) { error(err); };
            }
            if (complete) {
                completeFn =
                    this._isAsync ? function () { setTimeout(function () { return complete(); }); } : function () { complete(); };
            }
        }
        return _super.prototype.subscribe.call(this, schedulerFn, errorFn, completeFn);
    };
    return EventEmitter;
})(Subject_1.Subject);
exports.EventEmitter = EventEmitter;
},{"angular2/src/facade/lang":19,"angular2/src/facade/promise":21,"rxjs/Observable":47,"rxjs/Subject":49,"rxjs/observable/PromiseObservable":52,"rxjs/operator/toPromise":53}],15:[function(require,module,exports){
'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * A base class for the WrappedException that can be used to identify
 * a WrappedException from ExceptionHandler without adding circular
 * dependency.
 */
var BaseWrappedException = (function (_super) {
    __extends(BaseWrappedException, _super);
    function BaseWrappedException(message) {
        _super.call(this, message);
    }
    Object.defineProperty(BaseWrappedException.prototype, "wrapperMessage", {
        get: function () { return ''; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseWrappedException.prototype, "wrapperStack", {
        get: function () { return null; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseWrappedException.prototype, "originalException", {
        get: function () { return null; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseWrappedException.prototype, "originalStack", {
        get: function () { return null; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseWrappedException.prototype, "context", {
        get: function () { return null; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseWrappedException.prototype, "message", {
        get: function () { return ''; },
        enumerable: true,
        configurable: true
    });
    return BaseWrappedException;
})(Error);
exports.BaseWrappedException = BaseWrappedException;
},{}],16:[function(require,module,exports){
'use strict';var lang_1 = require('angular2/src/facade/lang');
exports.Map = lang_1.global.Map;
exports.Set = lang_1.global.Set;
// Safari and Internet Explorer do not support the iterable parameter to the
// Map constructor.  We work around that by manually adding the items.
var createMapFromPairs = (function () {
    try {
        if (new exports.Map([[1, 2]]).size === 1) {
            return function createMapFromPairs(pairs) { return new exports.Map(pairs); };
        }
    }
    catch (e) {
    }
    return function createMapAndPopulateFromPairs(pairs) {
        var map = new exports.Map();
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i];
            map.set(pair[0], pair[1]);
        }
        return map;
    };
})();
var createMapFromMap = (function () {
    try {
        if (new exports.Map(new exports.Map())) {
            return function createMapFromMap(m) { return new exports.Map(m); };
        }
    }
    catch (e) {
    }
    return function createMapAndPopulateFromMap(m) {
        var map = new exports.Map();
        m.forEach(function (v, k) { map.set(k, v); });
        return map;
    };
})();
var _clearValues = (function () {
    if ((new exports.Map()).keys().next) {
        return function _clearValues(m) {
            var keyIterator = m.keys();
            var k;
            while (!((k = keyIterator.next()).done)) {
                m.set(k.value, null);
            }
        };
    }
    else {
        return function _clearValuesWithForeEach(m) {
            m.forEach(function (v, k) { m.set(k, null); });
        };
    }
})();
// Safari doesn't implement MapIterator.next(), which is used is Traceur's polyfill of Array.from
// TODO(mlaval): remove the work around once we have a working polyfill of Array.from
var _arrayFromMap = (function () {
    try {
        if ((new exports.Map()).values().next) {
            return function createArrayFromMap(m, getValues) {
                return getValues ? Array.from(m.values()) : Array.from(m.keys());
            };
        }
    }
    catch (e) {
    }
    return function createArrayFromMapWithForeach(m, getValues) {
        var res = ListWrapper.createFixedSize(m.size), i = 0;
        m.forEach(function (v, k) {
            res[i] = getValues ? v : k;
            i++;
        });
        return res;
    };
})();
var MapWrapper = (function () {
    function MapWrapper() {
    }
    MapWrapper.clone = function (m) { return createMapFromMap(m); };
    MapWrapper.createFromStringMap = function (stringMap) {
        var result = new exports.Map();
        for (var prop in stringMap) {
            result.set(prop, stringMap[prop]);
        }
        return result;
    };
    MapWrapper.toStringMap = function (m) {
        var r = {};
        m.forEach(function (v, k) { return r[k] = v; });
        return r;
    };
    MapWrapper.createFromPairs = function (pairs) { return createMapFromPairs(pairs); };
    MapWrapper.clearValues = function (m) { _clearValues(m); };
    MapWrapper.iterable = function (m) { return m; };
    MapWrapper.keys = function (m) { return _arrayFromMap(m, false); };
    MapWrapper.values = function (m) { return _arrayFromMap(m, true); };
    return MapWrapper;
})();
exports.MapWrapper = MapWrapper;
/**
 * Wraps Javascript Objects
 */
var StringMapWrapper = (function () {
    function StringMapWrapper() {
    }
    StringMapWrapper.create = function () {
        // Note: We are not using Object.create(null) here due to
        // performance!
        // http://jsperf.com/ng2-object-create-null
        return {};
    };
    StringMapWrapper.contains = function (map, key) {
        return map.hasOwnProperty(key);
    };
    StringMapWrapper.get = function (map, key) {
        return map.hasOwnProperty(key) ? map[key] : undefined;
    };
    StringMapWrapper.set = function (map, key, value) { map[key] = value; };
    StringMapWrapper.keys = function (map) { return Object.keys(map); };
    StringMapWrapper.isEmpty = function (map) {
        for (var prop in map) {
            return false;
        }
        return true;
    };
    StringMapWrapper.delete = function (map, key) { delete map[key]; };
    StringMapWrapper.forEach = function (map, callback) {
        for (var prop in map) {
            if (map.hasOwnProperty(prop)) {
                callback(map[prop], prop);
            }
        }
    };
    StringMapWrapper.merge = function (m1, m2) {
        var m = {};
        for (var attr in m1) {
            if (m1.hasOwnProperty(attr)) {
                m[attr] = m1[attr];
            }
        }
        for (var attr in m2) {
            if (m2.hasOwnProperty(attr)) {
                m[attr] = m2[attr];
            }
        }
        return m;
    };
    StringMapWrapper.equals = function (m1, m2) {
        var k1 = Object.keys(m1);
        var k2 = Object.keys(m2);
        if (k1.length != k2.length) {
            return false;
        }
        var key;
        for (var i = 0; i < k1.length; i++) {
            key = k1[i];
            if (m1[key] !== m2[key]) {
                return false;
            }
        }
        return true;
    };
    return StringMapWrapper;
})();
exports.StringMapWrapper = StringMapWrapper;
var ListWrapper = (function () {
    function ListWrapper() {
    }
    // JS has no way to express a statically fixed size list, but dart does so we
    // keep both methods.
    ListWrapper.createFixedSize = function (size) { return new Array(size); };
    ListWrapper.createGrowableSize = function (size) { return new Array(size); };
    ListWrapper.clone = function (array) { return array.slice(0); };
    ListWrapper.createImmutable = function (array) {
        var result = ListWrapper.clone(array);
        Object.seal(result);
        return result;
    };
    ListWrapper.forEachWithIndex = function (array, fn) {
        for (var i = 0; i < array.length; i++) {
            fn(array[i], i);
        }
    };
    ListWrapper.first = function (array) {
        if (!array)
            return null;
        return array[0];
    };
    ListWrapper.last = function (array) {
        if (!array || array.length == 0)
            return null;
        return array[array.length - 1];
    };
    ListWrapper.indexOf = function (array, value, startIndex) {
        if (startIndex === void 0) { startIndex = 0; }
        return array.indexOf(value, startIndex);
    };
    ListWrapper.contains = function (list, el) { return list.indexOf(el) !== -1; };
    ListWrapper.reversed = function (array) {
        var a = ListWrapper.clone(array);
        return a.reverse();
    };
    ListWrapper.concat = function (a, b) { return a.concat(b); };
    ListWrapper.insert = function (list, index, value) { list.splice(index, 0, value); };
    ListWrapper.removeAt = function (list, index) {
        var res = list[index];
        list.splice(index, 1);
        return res;
    };
    ListWrapper.removeAll = function (list, items) {
        for (var i = 0; i < items.length; ++i) {
            var index = list.indexOf(items[i]);
            list.splice(index, 1);
        }
    };
    ListWrapper.remove = function (list, el) {
        var index = list.indexOf(el);
        if (index > -1) {
            list.splice(index, 1);
            return true;
        }
        return false;
    };
    ListWrapper.clear = function (list) { list.length = 0; };
    ListWrapper.isEmpty = function (list) { return list.length == 0; };
    ListWrapper.fill = function (list, value, start, end) {
        if (start === void 0) { start = 0; }
        if (end === void 0) { end = null; }
        list.fill(value, start, end === null ? list.length : end);
    };
    ListWrapper.equals = function (a, b) {
        if (a.length != b.length)
            return false;
        for (var i = 0; i < a.length; ++i) {
            if (a[i] !== b[i])
                return false;
        }
        return true;
    };
    ListWrapper.slice = function (l, from, to) {
        if (from === void 0) { from = 0; }
        if (to === void 0) { to = null; }
        return l.slice(from, to === null ? undefined : to);
    };
    ListWrapper.splice = function (l, from, length) { return l.splice(from, length); };
    ListWrapper.sort = function (l, compareFn) {
        if (lang_1.isPresent(compareFn)) {
            l.sort(compareFn);
        }
        else {
            l.sort();
        }
    };
    ListWrapper.toString = function (l) { return l.toString(); };
    ListWrapper.toJSON = function (l) { return JSON.stringify(l); };
    ListWrapper.maximum = function (list, predicate) {
        if (list.length == 0) {
            return null;
        }
        var solution = null;
        var maxValue = -Infinity;
        for (var index = 0; index < list.length; index++) {
            var candidate = list[index];
            if (lang_1.isBlank(candidate)) {
                continue;
            }
            var candidateValue = predicate(candidate);
            if (candidateValue > maxValue) {
                solution = candidate;
                maxValue = candidateValue;
            }
        }
        return solution;
    };
    ListWrapper.isImmutable = function (list) { return Object.isSealed(list); };
    return ListWrapper;
})();
exports.ListWrapper = ListWrapper;
function isListLikeIterable(obj) {
    if (!lang_1.isJsObject(obj))
        return false;
    return lang_1.isArray(obj) ||
        (!(obj instanceof exports.Map) &&
            lang_1.getSymbolIterator() in obj); // JS Iterable have a Symbol.iterator prop
}
exports.isListLikeIterable = isListLikeIterable;
function areIterablesEqual(a, b, comparator) {
    var iterator1 = a[lang_1.getSymbolIterator()]();
    var iterator2 = b[lang_1.getSymbolIterator()]();
    while (true) {
        var item1 = iterator1.next();
        var item2 = iterator2.next();
        if (item1.done && item2.done)
            return true;
        if (item1.done || item2.done)
            return false;
        if (!comparator(item1.value, item2.value))
            return false;
    }
}
exports.areIterablesEqual = areIterablesEqual;
function iterateListLike(obj, fn) {
    if (lang_1.isArray(obj)) {
        for (var i = 0; i < obj.length; i++) {
            fn(obj[i]);
        }
    }
    else {
        var iterator = obj[lang_1.getSymbolIterator()]();
        var item;
        while (!((item = iterator.next()).done)) {
            fn(item.value);
        }
    }
}
exports.iterateListLike = iterateListLike;
// Safari and Internet Explorer do not support the iterable parameter to the
// Set constructor.  We work around that by manually adding the items.
var createSetFromList = (function () {
    var test = new exports.Set([1, 2, 3]);
    if (test.size === 3) {
        return function createSetFromList(lst) { return new exports.Set(lst); };
    }
    else {
        return function createSetAndPopulateFromList(lst) {
            var res = new exports.Set(lst);
            if (res.size !== lst.length) {
                for (var i = 0; i < lst.length; i++) {
                    res.add(lst[i]);
                }
            }
            return res;
        };
    }
})();
var SetWrapper = (function () {
    function SetWrapper() {
    }
    SetWrapper.createFromList = function (lst) { return createSetFromList(lst); };
    SetWrapper.has = function (s, key) { return s.has(key); };
    SetWrapper.delete = function (m, k) { m.delete(k); };
    return SetWrapper;
})();
exports.SetWrapper = SetWrapper;
},{"angular2/src/facade/lang":19}],17:[function(require,module,exports){
'use strict';var lang_1 = require('angular2/src/facade/lang');
var base_wrapped_exception_1 = require('angular2/src/facade/base_wrapped_exception');
var collection_1 = require('angular2/src/facade/collection');
var _ArrayLogger = (function () {
    function _ArrayLogger() {
        this.res = [];
    }
    _ArrayLogger.prototype.log = function (s) { this.res.push(s); };
    _ArrayLogger.prototype.logError = function (s) { this.res.push(s); };
    _ArrayLogger.prototype.logGroup = function (s) { this.res.push(s); };
    _ArrayLogger.prototype.logGroupEnd = function () { };
    ;
    return _ArrayLogger;
})();
/**
 * Provides a hook for centralized exception handling.
 *
 * The default implementation of `ExceptionHandler` prints error messages to the `Console`. To
 * intercept error handling,
 * write a custom exception handler that replaces this default as appropriate for your app.
 *
 * ### Example
 *
 * ```javascript
 *
 * class MyExceptionHandler implements ExceptionHandler {
 *   call(error, stackTrace = null, reason = null) {
 *     // do something with the exception
 *   }
 * }
 *
 * bootstrap(MyApp, [provide(ExceptionHandler, {useClass: MyExceptionHandler})])
 *
 * ```
 */
var ExceptionHandler = (function () {
    function ExceptionHandler(_logger, _rethrowException) {
        if (_rethrowException === void 0) { _rethrowException = true; }
        this._logger = _logger;
        this._rethrowException = _rethrowException;
    }
    ExceptionHandler.exceptionToString = function (exception, stackTrace, reason) {
        if (stackTrace === void 0) { stackTrace = null; }
        if (reason === void 0) { reason = null; }
        var l = new _ArrayLogger();
        var e = new ExceptionHandler(l, false);
        e.call(exception, stackTrace, reason);
        return l.res.join("\n");
    };
    ExceptionHandler.prototype.call = function (exception, stackTrace, reason) {
        if (stackTrace === void 0) { stackTrace = null; }
        if (reason === void 0) { reason = null; }
        var originalException = this._findOriginalException(exception);
        var originalStack = this._findOriginalStack(exception);
        var context = this._findContext(exception);
        this._logger.logGroup("EXCEPTION: " + this._extractMessage(exception));
        if (lang_1.isPresent(stackTrace) && lang_1.isBlank(originalStack)) {
            this._logger.logError("STACKTRACE:");
            this._logger.logError(this._longStackTrace(stackTrace));
        }
        if (lang_1.isPresent(reason)) {
            this._logger.logError("REASON: " + reason);
        }
        if (lang_1.isPresent(originalException)) {
            this._logger.logError("ORIGINAL EXCEPTION: " + this._extractMessage(originalException));
        }
        if (lang_1.isPresent(originalStack)) {
            this._logger.logError("ORIGINAL STACKTRACE:");
            this._logger.logError(this._longStackTrace(originalStack));
        }
        if (lang_1.isPresent(context)) {
            this._logger.logError("ERROR CONTEXT:");
            this._logger.logError(context);
        }
        this._logger.logGroupEnd();
        // We rethrow exceptions, so operations like 'bootstrap' will result in an error
        // when an exception happens. If we do not rethrow, bootstrap will always succeed.
        if (this._rethrowException)
            throw exception;
    };
    /** @internal */
    ExceptionHandler.prototype._extractMessage = function (exception) {
        return exception instanceof base_wrapped_exception_1.BaseWrappedException ? exception.wrapperMessage :
            exception.toString();
    };
    /** @internal */
    ExceptionHandler.prototype._longStackTrace = function (stackTrace) {
        return collection_1.isListLikeIterable(stackTrace) ? stackTrace.join("\n\n-----async gap-----\n") :
            stackTrace.toString();
    };
    /** @internal */
    ExceptionHandler.prototype._findContext = function (exception) {
        try {
            if (!(exception instanceof base_wrapped_exception_1.BaseWrappedException))
                return null;
            return lang_1.isPresent(exception.context) ? exception.context :
                this._findContext(exception.originalException);
        }
        catch (e) {
            // exception.context can throw an exception. if it happens, we ignore the context.
            return null;
        }
    };
    /** @internal */
    ExceptionHandler.prototype._findOriginalException = function (exception) {
        if (!(exception instanceof base_wrapped_exception_1.BaseWrappedException))
            return null;
        var e = exception.originalException;
        while (e instanceof base_wrapped_exception_1.BaseWrappedException && lang_1.isPresent(e.originalException)) {
            e = e.originalException;
        }
        return e;
    };
    /** @internal */
    ExceptionHandler.prototype._findOriginalStack = function (exception) {
        if (!(exception instanceof base_wrapped_exception_1.BaseWrappedException))
            return null;
        var e = exception;
        var stack = exception.originalStack;
        while (e instanceof base_wrapped_exception_1.BaseWrappedException && lang_1.isPresent(e.originalException)) {
            e = e.originalException;
            if (e instanceof base_wrapped_exception_1.BaseWrappedException && lang_1.isPresent(e.originalException)) {
                stack = e.originalStack;
            }
        }
        return stack;
    };
    return ExceptionHandler;
})();
exports.ExceptionHandler = ExceptionHandler;
},{"angular2/src/facade/base_wrapped_exception":15,"angular2/src/facade/collection":16,"angular2/src/facade/lang":19}],18:[function(require,module,exports){
'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var base_wrapped_exception_1 = require('./base_wrapped_exception');
var exception_handler_1 = require('./exception_handler');
var exception_handler_2 = require('./exception_handler');
exports.ExceptionHandler = exception_handler_2.ExceptionHandler;
var BaseException = (function (_super) {
    __extends(BaseException, _super);
    function BaseException(message) {
        if (message === void 0) { message = "--"; }
        _super.call(this, message);
        this.message = message;
        this.stack = (new Error(message)).stack;
    }
    BaseException.prototype.toString = function () { return this.message; };
    return BaseException;
})(Error);
exports.BaseException = BaseException;
/**
 * Wraps an exception and provides additional context or information.
 */
var WrappedException = (function (_super) {
    __extends(WrappedException, _super);
    function WrappedException(_wrapperMessage, _originalException, _originalStack, _context) {
        _super.call(this, _wrapperMessage);
        this._wrapperMessage = _wrapperMessage;
        this._originalException = _originalException;
        this._originalStack = _originalStack;
        this._context = _context;
        this._wrapperStack = (new Error(_wrapperMessage)).stack;
    }
    Object.defineProperty(WrappedException.prototype, "wrapperMessage", {
        get: function () { return this._wrapperMessage; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WrappedException.prototype, "wrapperStack", {
        get: function () { return this._wrapperStack; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WrappedException.prototype, "originalException", {
        get: function () { return this._originalException; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WrappedException.prototype, "originalStack", {
        get: function () { return this._originalStack; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WrappedException.prototype, "context", {
        get: function () { return this._context; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WrappedException.prototype, "message", {
        get: function () { return exception_handler_1.ExceptionHandler.exceptionToString(this); },
        enumerable: true,
        configurable: true
    });
    WrappedException.prototype.toString = function () { return this.message; };
    return WrappedException;
})(base_wrapped_exception_1.BaseWrappedException);
exports.WrappedException = WrappedException;
function makeTypeError(message) {
    return new TypeError(message);
}
exports.makeTypeError = makeTypeError;
function unimplemented() {
    throw new BaseException('unimplemented');
}
exports.unimplemented = unimplemented;
},{"./base_wrapped_exception":15,"./exception_handler":17}],19:[function(require,module,exports){
'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var globalScope;
if (typeof window === 'undefined') {
    if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
        // TODO: Replace any with WorkerGlobalScope from lib.webworker.d.ts #3492
        globalScope = self;
    }
    else {
        globalScope = global;
    }
}
else {
    globalScope = window;
}
exports.IS_DART = false;
// Need to declare a new variable for global here since TypeScript
// exports the original value of the symbol.
var _global = globalScope;
exports.global = _global;
exports.Type = Function;
function getTypeNameForDebugging(type) {
    return type['name'];
}
exports.getTypeNameForDebugging = getTypeNameForDebugging;
exports.Math = _global.Math;
exports.Date = _global.Date;
var _devMode = true;
var _modeLocked = false;
function lockMode() {
    _modeLocked = true;
}
exports.lockMode = lockMode;
/**
 * Disable Angular's development mode, which turns off assertions and other
 * checks within the framework.
 *
 * One important assertion this disables verifies that a change detection pass
 * does not result in additional changes to any bindings (also known as
 * unidirectional data flow).
 */
function enableProdMode() {
    if (_modeLocked) {
        // Cannot use BaseException as that ends up importing from facade/lang.
        throw 'Cannot enable prod mode after platform setup.';
    }
    _devMode = false;
}
exports.enableProdMode = enableProdMode;
function assertionsEnabled() {
    return _devMode;
}
exports.assertionsEnabled = assertionsEnabled;
// TODO: remove calls to assert in production environment
// Note: Can't just export this and import in in other files
// as `assert` is a reserved keyword in Dart
_global.assert = function assert(condition) {
    // TODO: to be fixed properly via #2830, noop for now
};
// This function is needed only to properly support Dart's const expressions
// see https://github.com/angular/ts2dart/pull/151 for more info
function CONST_EXPR(expr) {
    return expr;
}
exports.CONST_EXPR = CONST_EXPR;
function CONST() {
    return function (target) { return target; };
}
exports.CONST = CONST;
function isPresent(obj) {
    return obj !== undefined && obj !== null;
}
exports.isPresent = isPresent;
function isBlank(obj) {
    return obj === undefined || obj === null;
}
exports.isBlank = isBlank;
function isString(obj) {
    return typeof obj === "string";
}
exports.isString = isString;
function isFunction(obj) {
    return typeof obj === "function";
}
exports.isFunction = isFunction;
function isType(obj) {
    return isFunction(obj);
}
exports.isType = isType;
function isStringMap(obj) {
    return typeof obj === 'object' && obj !== null;
}
exports.isStringMap = isStringMap;
function isPromise(obj) {
    return obj instanceof _global.Promise;
}
exports.isPromise = isPromise;
function isArray(obj) {
    return Array.isArray(obj);
}
exports.isArray = isArray;
function isNumber(obj) {
    return typeof obj === 'number';
}
exports.isNumber = isNumber;
function isDate(obj) {
    return obj instanceof exports.Date && !isNaN(obj.valueOf());
}
exports.isDate = isDate;
function noop() { }
exports.noop = noop;
function stringify(token) {
    if (typeof token === 'string') {
        return token;
    }
    if (token === undefined || token === null) {
        return '' + token;
    }
    if (token.name) {
        return token.name;
    }
    if (token.overriddenName) {
        return token.overriddenName;
    }
    var res = token.toString();
    var newLineIndex = res.indexOf("\n");
    return (newLineIndex === -1) ? res : res.substring(0, newLineIndex);
}
exports.stringify = stringify;
// serialize / deserialize enum exist only for consistency with dart API
// enums in typescript don't need to be serialized
function serializeEnum(val) {
    return val;
}
exports.serializeEnum = serializeEnum;
function deserializeEnum(val, values) {
    return val;
}
exports.deserializeEnum = deserializeEnum;
var StringWrapper = (function () {
    function StringWrapper() {
    }
    StringWrapper.fromCharCode = function (code) { return String.fromCharCode(code); };
    StringWrapper.charCodeAt = function (s, index) { return s.charCodeAt(index); };
    StringWrapper.split = function (s, regExp) { return s.split(regExp); };
    StringWrapper.equals = function (s, s2) { return s === s2; };
    StringWrapper.stripLeft = function (s, charVal) {
        if (s && s.length) {
            var pos = 0;
            for (var i = 0; i < s.length; i++) {
                if (s[i] != charVal)
                    break;
                pos++;
            }
            s = s.substring(pos);
        }
        return s;
    };
    StringWrapper.stripRight = function (s, charVal) {
        if (s && s.length) {
            var pos = s.length;
            for (var i = s.length - 1; i >= 0; i--) {
                if (s[i] != charVal)
                    break;
                pos--;
            }
            s = s.substring(0, pos);
        }
        return s;
    };
    StringWrapper.replace = function (s, from, replace) {
        return s.replace(from, replace);
    };
    StringWrapper.replaceAll = function (s, from, replace) {
        return s.replace(from, replace);
    };
    StringWrapper.slice = function (s, from, to) {
        if (from === void 0) { from = 0; }
        if (to === void 0) { to = null; }
        return s.slice(from, to === null ? undefined : to);
    };
    StringWrapper.replaceAllMapped = function (s, from, cb) {
        return s.replace(from, function () {
            var matches = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                matches[_i - 0] = arguments[_i];
            }
            // Remove offset & string from the result array
            matches.splice(-2, 2);
            // The callback receives match, p1, ..., pn
            return cb(matches);
        });
    };
    StringWrapper.contains = function (s, substr) { return s.indexOf(substr) != -1; };
    StringWrapper.compare = function (a, b) {
        if (a < b) {
            return -1;
        }
        else if (a > b) {
            return 1;
        }
        else {
            return 0;
        }
    };
    return StringWrapper;
})();
exports.StringWrapper = StringWrapper;
var StringJoiner = (function () {
    function StringJoiner(parts) {
        if (parts === void 0) { parts = []; }
        this.parts = parts;
    }
    StringJoiner.prototype.add = function (part) { this.parts.push(part); };
    StringJoiner.prototype.toString = function () { return this.parts.join(""); };
    return StringJoiner;
})();
exports.StringJoiner = StringJoiner;
var NumberParseError = (function (_super) {
    __extends(NumberParseError, _super);
    function NumberParseError(message) {
        _super.call(this);
        this.message = message;
    }
    NumberParseError.prototype.toString = function () { return this.message; };
    return NumberParseError;
})(Error);
exports.NumberParseError = NumberParseError;
var NumberWrapper = (function () {
    function NumberWrapper() {
    }
    NumberWrapper.toFixed = function (n, fractionDigits) { return n.toFixed(fractionDigits); };
    NumberWrapper.equal = function (a, b) { return a === b; };
    NumberWrapper.parseIntAutoRadix = function (text) {
        var result = parseInt(text);
        if (isNaN(result)) {
            throw new NumberParseError("Invalid integer literal when parsing " + text);
        }
        return result;
    };
    NumberWrapper.parseInt = function (text, radix) {
        if (radix == 10) {
            if (/^(\-|\+)?[0-9]+$/.test(text)) {
                return parseInt(text, radix);
            }
        }
        else if (radix == 16) {
            if (/^(\-|\+)?[0-9ABCDEFabcdef]+$/.test(text)) {
                return parseInt(text, radix);
            }
        }
        else {
            var result = parseInt(text, radix);
            if (!isNaN(result)) {
                return result;
            }
        }
        throw new NumberParseError("Invalid integer literal when parsing " + text + " in base " +
            radix);
    };
    // TODO: NaN is a valid literal but is returned by parseFloat to indicate an error.
    NumberWrapper.parseFloat = function (text) { return parseFloat(text); };
    Object.defineProperty(NumberWrapper, "NaN", {
        get: function () { return NaN; },
        enumerable: true,
        configurable: true
    });
    NumberWrapper.isNaN = function (value) { return isNaN(value); };
    NumberWrapper.isInteger = function (value) { return Number.isInteger(value); };
    return NumberWrapper;
})();
exports.NumberWrapper = NumberWrapper;
exports.RegExp = _global.RegExp;
var RegExpWrapper = (function () {
    function RegExpWrapper() {
    }
    RegExpWrapper.create = function (regExpStr, flags) {
        if (flags === void 0) { flags = ''; }
        flags = flags.replace(/g/g, '');
        return new _global.RegExp(regExpStr, flags + 'g');
    };
    RegExpWrapper.firstMatch = function (regExp, input) {
        // Reset multimatch regex state
        regExp.lastIndex = 0;
        return regExp.exec(input);
    };
    RegExpWrapper.test = function (regExp, input) {
        regExp.lastIndex = 0;
        return regExp.test(input);
    };
    RegExpWrapper.matcher = function (regExp, input) {
        // Reset regex state for the case
        // someone did not loop over all matches
        // last time.
        regExp.lastIndex = 0;
        return { re: regExp, input: input };
    };
    return RegExpWrapper;
})();
exports.RegExpWrapper = RegExpWrapper;
var RegExpMatcherWrapper = (function () {
    function RegExpMatcherWrapper() {
    }
    RegExpMatcherWrapper.next = function (matcher) {
        return matcher.re.exec(matcher.input);
    };
    return RegExpMatcherWrapper;
})();
exports.RegExpMatcherWrapper = RegExpMatcherWrapper;
var FunctionWrapper = (function () {
    function FunctionWrapper() {
    }
    FunctionWrapper.apply = function (fn, posArgs) { return fn.apply(null, posArgs); };
    return FunctionWrapper;
})();
exports.FunctionWrapper = FunctionWrapper;
// JS has NaN !== NaN
function looseIdentical(a, b) {
    return a === b || typeof a === "number" && typeof b === "number" && isNaN(a) && isNaN(b);
}
exports.looseIdentical = looseIdentical;
// JS considers NaN is the same as NaN for map Key (while NaN !== NaN otherwise)
// see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
function getMapKey(value) {
    return value;
}
exports.getMapKey = getMapKey;
function normalizeBlank(obj) {
    return isBlank(obj) ? null : obj;
}
exports.normalizeBlank = normalizeBlank;
function normalizeBool(obj) {
    return isBlank(obj) ? false : obj;
}
exports.normalizeBool = normalizeBool;
function isJsObject(o) {
    return o !== null && (typeof o === "function" || typeof o === "object");
}
exports.isJsObject = isJsObject;
function print(obj) {
    console.log(obj);
}
exports.print = print;
// Can't be all uppercase as our transpiler would think it is a special directive...
var Json = (function () {
    function Json() {
    }
    Json.parse = function (s) { return _global.JSON.parse(s); };
    Json.stringify = function (data) {
        // Dart doesn't take 3 arguments
        return _global.JSON.stringify(data, null, 2);
    };
    return Json;
})();
exports.Json = Json;
var DateWrapper = (function () {
    function DateWrapper() {
    }
    DateWrapper.create = function (year, month, day, hour, minutes, seconds, milliseconds) {
        if (month === void 0) { month = 1; }
        if (day === void 0) { day = 1; }
        if (hour === void 0) { hour = 0; }
        if (minutes === void 0) { minutes = 0; }
        if (seconds === void 0) { seconds = 0; }
        if (milliseconds === void 0) { milliseconds = 0; }
        return new exports.Date(year, month - 1, day, hour, minutes, seconds, milliseconds);
    };
    DateWrapper.fromISOString = function (str) { return new exports.Date(str); };
    DateWrapper.fromMillis = function (ms) { return new exports.Date(ms); };
    DateWrapper.toMillis = function (date) { return date.getTime(); };
    DateWrapper.now = function () { return new exports.Date(); };
    DateWrapper.toJson = function (date) { return date.toJSON(); };
    return DateWrapper;
})();
exports.DateWrapper = DateWrapper;
function setValueOnPath(global, path, value) {
    var parts = path.split('.');
    var obj = global;
    while (parts.length > 1) {
        var name = parts.shift();
        if (obj.hasOwnProperty(name) && isPresent(obj[name])) {
            obj = obj[name];
        }
        else {
            obj = obj[name] = {};
        }
    }
    if (obj === undefined || obj === null) {
        obj = {};
    }
    obj[parts.shift()] = value;
}
exports.setValueOnPath = setValueOnPath;
var _symbolIterator = null;
function getSymbolIterator() {
    if (isBlank(_symbolIterator)) {
        if (isPresent(Symbol) && isPresent(Symbol.iterator)) {
            _symbolIterator = Symbol.iterator;
        }
        else {
            // es6-shim specific logic
            var keys = Object.getOwnPropertyNames(Map.prototype);
            for (var i = 0; i < keys.length; ++i) {
                var key = keys[i];
                if (key !== 'entries' && key !== 'size' &&
                    Map.prototype[key] === Map.prototype['entries']) {
                    _symbolIterator = key;
                }
            }
        }
    }
    return _symbolIterator;
}
exports.getSymbolIterator = getSymbolIterator;
function evalExpression(sourceUrl, expr, declarations, vars) {
    var fnBody = declarations + "\nreturn " + expr + "\n//# sourceURL=" + sourceUrl;
    var fnArgNames = [];
    var fnArgValues = [];
    for (var argName in vars) {
        fnArgNames.push(argName);
        fnArgValues.push(vars[argName]);
    }
    return new (Function.bind.apply(Function, [void 0].concat(fnArgNames.concat(fnBody))))().apply(void 0, fnArgValues);
}
exports.evalExpression = evalExpression;
function isPrimitive(obj) {
    return !isJsObject(obj);
}
exports.isPrimitive = isPrimitive;
function hasConstructor(value, type) {
    return value.constructor === type;
}
exports.hasConstructor = hasConstructor;
},{}],20:[function(require,module,exports){
'use strict';var lang_1 = require('angular2/src/facade/lang');
exports.Math = lang_1.global.Math;
exports.NaN = typeof exports.NaN;
},{"angular2/src/facade/lang":19}],21:[function(require,module,exports){
'use strict';var PromiseWrapper = (function () {
    function PromiseWrapper() {
    }
    PromiseWrapper.resolve = function (obj) { return Promise.resolve(obj); };
    PromiseWrapper.reject = function (obj, _) { return Promise.reject(obj); };
    // Note: We can't rename this method into `catch`, as this is not a valid
    // method name in Dart.
    PromiseWrapper.catchError = function (promise, onError) {
        return promise.catch(onError);
    };
    PromiseWrapper.all = function (promises) {
        if (promises.length == 0)
            return Promise.resolve([]);
        return Promise.all(promises);
    };
    PromiseWrapper.then = function (promise, success, rejection) {
        return promise.then(success, rejection);
    };
    PromiseWrapper.wrap = function (computation) {
        return new Promise(function (res, rej) {
            try {
                res(computation());
            }
            catch (e) {
                rej(e);
            }
        });
    };
    PromiseWrapper.scheduleMicrotask = function (computation) {
        PromiseWrapper.then(PromiseWrapper.resolve(null), computation, function (_) { });
    };
    PromiseWrapper.isPromise = function (obj) { return obj instanceof Promise; };
    PromiseWrapper.completer = function () {
        var resolve;
        var reject;
        var p = new Promise(function (res, rej) {
            resolve = res;
            reject = rej;
        });
        return { promise: p, resolve: resolve, reject: reject };
    };
    return PromiseWrapper;
})();
exports.PromiseWrapper = PromiseWrapper;
},{}],22:[function(require,module,exports){
'use strict';/// <reference path="../angular2/typings/node/node.d.ts" />
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
var di_1 = require('angular2/src/core/di');
var common_1 = require('./common');
__export(require('./common'));
var selenium_webdriver_adapter_1 = require('./src/webdriver/selenium_webdriver_adapter');
exports.SeleniumWebDriverAdapter = selenium_webdriver_adapter_1.SeleniumWebDriverAdapter;
var fs = require('fs');
// TODO(tbosch): right now we bind the `writeFile` method
// in benchpres/benchpress.es6. This does not work for Dart,
// find another way...
// Note: Can't do the `require` call in a facade as it can't be loaded into the browser
// for our unit tests via karma.
common_1.Options.DEFAULT_PROVIDERS.push(di_1.bind(common_1.Options.WRITE_FILE).toValue(writeFile));
function writeFile(filename, content) {
    return new Promise(function (resolve, reject) {
        fs.writeFile(filename, content, function (error) {
            if (error) {
                reject(error);
            }
            else {
                resolve();
            }
        });
    });
}
},{"./common":23,"./src/webdriver/selenium_webdriver_adapter":46,"angular2/src/core/di":1,"fs":undefined}],23:[function(require,module,exports){
'use strict';var sampler_1 = require('./src/sampler');
exports.Sampler = sampler_1.Sampler;
exports.SampleState = sampler_1.SampleState;
var metric_1 = require('./src/metric');
exports.Metric = metric_1.Metric;
var validator_1 = require('./src/validator');
exports.Validator = validator_1.Validator;
var reporter_1 = require('./src/reporter');
exports.Reporter = reporter_1.Reporter;
var web_driver_extension_1 = require('./src/web_driver_extension');
exports.WebDriverExtension = web_driver_extension_1.WebDriverExtension;
exports.PerfLogFeatures = web_driver_extension_1.PerfLogFeatures;
var web_driver_adapter_1 = require('./src/web_driver_adapter');
exports.WebDriverAdapter = web_driver_adapter_1.WebDriverAdapter;
var size_validator_1 = require('./src/validator/size_validator');
exports.SizeValidator = size_validator_1.SizeValidator;
var regression_slope_validator_1 = require('./src/validator/regression_slope_validator');
exports.RegressionSlopeValidator = regression_slope_validator_1.RegressionSlopeValidator;
var console_reporter_1 = require('./src/reporter/console_reporter');
exports.ConsoleReporter = console_reporter_1.ConsoleReporter;
var json_file_reporter_1 = require('./src/reporter/json_file_reporter');
exports.JsonFileReporter = json_file_reporter_1.JsonFileReporter;
var sample_description_1 = require('./src/sample_description');
exports.SampleDescription = sample_description_1.SampleDescription;
var perflog_metric_1 = require('./src/metric/perflog_metric');
exports.PerflogMetric = perflog_metric_1.PerflogMetric;
var chrome_driver_extension_1 = require('./src/webdriver/chrome_driver_extension');
exports.ChromeDriverExtension = chrome_driver_extension_1.ChromeDriverExtension;
var firefox_driver_extension_1 = require('./src/webdriver/firefox_driver_extension');
exports.FirefoxDriverExtension = firefox_driver_extension_1.FirefoxDriverExtension;
var ios_driver_extension_1 = require('./src/webdriver/ios_driver_extension');
exports.IOsDriverExtension = ios_driver_extension_1.IOsDriverExtension;
var runner_1 = require('./src/runner');
exports.Runner = runner_1.Runner;
var common_options_1 = require('./src/common_options');
exports.Options = common_options_1.Options;
var measure_values_1 = require('./src/measure_values');
exports.MeasureValues = measure_values_1.MeasureValues;
var multi_metric_1 = require('./src/metric/multi_metric');
exports.MultiMetric = multi_metric_1.MultiMetric;
var multi_reporter_1 = require('./src/reporter/multi_reporter');
exports.MultiReporter = multi_reporter_1.MultiReporter;
var di_1 = require('angular2/src/core/di');
exports.bind = di_1.bind;
exports.provide = di_1.provide;
exports.Injector = di_1.Injector;
exports.OpaqueToken = di_1.OpaqueToken;
},{"./src/common_options":25,"./src/measure_values":26,"./src/metric":27,"./src/metric/multi_metric":28,"./src/metric/perflog_metric":29,"./src/reporter":30,"./src/reporter/console_reporter":31,"./src/reporter/json_file_reporter":32,"./src/reporter/multi_reporter":33,"./src/runner":34,"./src/sample_description":35,"./src/sampler":36,"./src/validator":38,"./src/validator/regression_slope_validator":39,"./src/validator/size_validator":40,"./src/web_driver_adapter":41,"./src/web_driver_extension":42,"./src/webdriver/chrome_driver_extension":43,"./src/webdriver/firefox_driver_extension":44,"./src/webdriver/ios_driver_extension":45,"angular2/src/core/di":1}],24:[function(require,module,exports){
'use strict';require('reflect-metadata');
require('es6-shim');
module.exports = require('./benchpress.js');
// when bundling benchpress to one file, this is used
// for getting exports out of browserify's scope.
global.__benchpressExports = module.exports;
},{"./benchpress.js":22,"es6-shim":undefined,"reflect-metadata":undefined}],25:[function(require,module,exports){
'use strict';var di_1 = require('angular2/src/core/di');
var lang_1 = require('angular2/src/facade/lang');
var Options = (function () {
    function Options() {
    }
    Object.defineProperty(Options, "DEFAULT_PROVIDERS", {
        get: function () { return _DEFAULT_PROVIDERS; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Options, "SAMPLE_ID", {
        // TODO(tbosch): use static initializer when our transpiler supports it
        get: function () { return _SAMPLE_ID; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Options, "DEFAULT_DESCRIPTION", {
        // TODO(tbosch): use static initializer when our transpiler supports it
        get: function () { return _DEFAULT_DESCRIPTION; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Options, "SAMPLE_DESCRIPTION", {
        // TODO(tbosch): use static initializer when our transpiler supports it
        get: function () { return _SAMPLE_DESCRIPTION; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Options, "FORCE_GC", {
        // TODO(tbosch): use static initializer when our transpiler supports it
        get: function () { return _FORCE_GC; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Options, "PREPARE", {
        // TODO(tbosch): use static initializer when our transpiler supports it
        get: function () { return _PREPARE; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Options, "EXECUTE", {
        // TODO(tbosch): use static initializer when our transpiler supports it
        get: function () { return _EXECUTE; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Options, "CAPABILITIES", {
        // TODO(tbosch): use static initializer when our transpiler supports it
        get: function () { return _CAPABILITIES; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Options, "USER_AGENT", {
        // TODO(tbosch): use static initializer when our transpiler supports it
        get: function () { return _USER_AGENT; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Options, "NOW", {
        // TODO(tbosch): use static initializer when our transpiler supports it
        get: function () { return _NOW; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Options, "WRITE_FILE", {
        // TODO(tbosch): use static values when our transpiler supports them
        get: function () { return _WRITE_FILE; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Options, "MICRO_METRICS", {
        // TODO(tbosch): use static values when our transpiler supports them
        get: function () { return _MICRO_METRICS; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Options, "RECEIVED_DATA", {
        // TODO(tbosch): use static values when our transpiler supports them
        get: function () { return _RECEIVED_DATA; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Options, "REQUEST_COUNT", {
        // TODO(tbosch): use static values when our transpiler supports them
        get: function () { return _REQUEST_COUNT; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Options, "CAPTURE_FRAMES", {
        // TODO(tbosch): use static values when our transpiler supports them
        get: function () { return _CAPTURE_FRAMES; },
        enumerable: true,
        configurable: true
    });
    return Options;
})();
exports.Options = Options;
var _SAMPLE_ID = new di_1.OpaqueToken('Options.sampleId');
var _DEFAULT_DESCRIPTION = new di_1.OpaqueToken('Options.defaultDescription');
var _SAMPLE_DESCRIPTION = new di_1.OpaqueToken('Options.sampleDescription');
var _FORCE_GC = new di_1.OpaqueToken('Options.forceGc');
var _PREPARE = new di_1.OpaqueToken('Options.prepare');
var _EXECUTE = new di_1.OpaqueToken('Options.execute');
var _CAPABILITIES = new di_1.OpaqueToken('Options.capabilities');
var _USER_AGENT = new di_1.OpaqueToken('Options.userAgent');
var _MICRO_METRICS = new di_1.OpaqueToken('Options.microMetrics');
var _NOW = new di_1.OpaqueToken('Options.now');
var _WRITE_FILE = new di_1.OpaqueToken('Options.writeFile');
var _RECEIVED_DATA = new di_1.OpaqueToken('Options.receivedData');
var _REQUEST_COUNT = new di_1.OpaqueToken('Options.requestCount');
var _CAPTURE_FRAMES = new di_1.OpaqueToken('Options.frameCapture');
var _DEFAULT_PROVIDERS = [
    di_1.bind(_DEFAULT_DESCRIPTION)
        .toValue({}),
    di_1.provide(_SAMPLE_DESCRIPTION, { useValue: {} }),
    di_1.provide(_FORCE_GC, { useValue: false }),
    di_1.provide(_PREPARE, { useValue: false }),
    di_1.provide(_MICRO_METRICS, { useValue: {} }),
    di_1.provide(_NOW, { useValue: function () { return lang_1.DateWrapper.now(); } }),
    di_1.provide(_RECEIVED_DATA, { useValue: false }),
    di_1.provide(_REQUEST_COUNT, { useValue: false }),
    di_1.provide(_CAPTURE_FRAMES, { useValue: false })
];
},{"angular2/src/core/di":1,"angular2/src/facade/lang":19}],26:[function(require,module,exports){
'use strict';var lang_1 = require('angular2/src/facade/lang');
var MeasureValues = (function () {
    function MeasureValues(runIndex, timeStamp, values) {
        this.runIndex = runIndex;
        this.timeStamp = timeStamp;
        this.values = values;
    }
    MeasureValues.prototype.toJson = function () {
        return {
            'timeStamp': lang_1.DateWrapper.toJson(this.timeStamp),
            'runIndex': this.runIndex,
            'values': this.values
        };
    };
    return MeasureValues;
})();
exports.MeasureValues = MeasureValues;
},{"angular2/src/facade/lang":19}],27:[function(require,module,exports){
'use strict';var di_1 = require('angular2/src/core/di');
var exceptions_1 = require('angular2/src/facade/exceptions');
/**
 * A metric is measures values
 */
var Metric = (function () {
    function Metric() {
    }
    Metric.bindTo = function (delegateToken) {
        return [di_1.bind(Metric).toFactory(function (delegate) { return delegate; }, [delegateToken])];
    };
    /**
     * Starts measuring
     */
    Metric.prototype.beginMeasure = function () { throw new exceptions_1.BaseException('NYI'); };
    /**
     * Ends measuring and reports the data
     * since the begin call.
     * @param restart: Whether to restart right after this.
     */
    Metric.prototype.endMeasure = function (restart) { throw new exceptions_1.BaseException('NYI'); };
    /**
     * Describes the metrics provided by this metric implementation.
     * (e.g. units, ...)
     */
    Metric.prototype.describe = function () { throw new exceptions_1.BaseException('NYI'); };
    return Metric;
})();
exports.Metric = Metric;
},{"angular2/src/core/di":1,"angular2/src/facade/exceptions":18}],28:[function(require,module,exports){
'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var di_1 = require('angular2/src/core/di');
var collection_1 = require('angular2/src/facade/collection');
var async_1 = require('angular2/src/facade/async');
var metric_1 = require('../metric');
var MultiMetric = (function (_super) {
    __extends(MultiMetric, _super);
    function MultiMetric(_metrics) {
        _super.call(this);
        this._metrics = _metrics;
    }
    MultiMetric.createBindings = function (childTokens) {
        return [
            di_1.bind(_CHILDREN)
                .toFactory(function (injector) { return childTokens.map(function (token) { return injector.get(token); }); }, [di_1.Injector]),
            di_1.bind(MultiMetric).toFactory(function (children) { return new MultiMetric(children); }, [_CHILDREN])
        ];
    };
    /**
     * Starts measuring
     */
    MultiMetric.prototype.beginMeasure = function () {
        return async_1.PromiseWrapper.all(this._metrics.map(function (metric) { return metric.beginMeasure(); }));
    };
    /**
     * Ends measuring and reports the data
     * since the begin call.
     * @param restart: Whether to restart right after this.
     */
    MultiMetric.prototype.endMeasure = function (restart) {
        return async_1.PromiseWrapper.all(this._metrics.map(function (metric) { return metric.endMeasure(restart); }))
            .then(function (values) { return mergeStringMaps(values); });
    };
    /**
     * Describes the metrics provided by this metric implementation.
     * (e.g. units, ...)
     */
    MultiMetric.prototype.describe = function () {
        return mergeStringMaps(this._metrics.map(function (metric) { return metric.describe(); }));
    };
    return MultiMetric;
})(metric_1.Metric);
exports.MultiMetric = MultiMetric;
function mergeStringMaps(maps) {
    var result = {};
    maps.forEach(function (map) { collection_1.StringMapWrapper.forEach(map, function (value, prop) { result[prop] = value; }); });
    return result;
}
var _CHILDREN = new di_1.OpaqueToken('MultiMetric.children');
},{"../metric":27,"angular2/src/core/di":1,"angular2/src/facade/async":14,"angular2/src/facade/collection":16}],29:[function(require,module,exports){
'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var async_1 = require('angular2/src/facade/async');
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var collection_1 = require('angular2/src/facade/collection');
var di_1 = require('angular2/src/core/di');
var web_driver_extension_1 = require('../web_driver_extension');
var metric_1 = require('../metric');
var common_options_1 = require('../common_options');
/**
 * A metric that reads out the performance log
 */
var PerflogMetric = (function (_super) {
    __extends(PerflogMetric, _super);
    /**
     * @param driverExtension
     * @param setTimeout
     * @param microMetrics Name and description of metrics provided via console.time / console.timeEnd
     **/
    function PerflogMetric(_driverExtension, _setTimeout, _microMetrics, _forceGc, _captureFrames, _receivedData, _requestCount) {
        _super.call(this);
        this._driverExtension = _driverExtension;
        this._setTimeout = _setTimeout;
        this._microMetrics = _microMetrics;
        this._forceGc = _forceGc;
        this._captureFrames = _captureFrames;
        this._receivedData = _receivedData;
        this._requestCount = _requestCount;
        this._remainingEvents = [];
        this._measureCount = 0;
        this._perfLogFeatures = _driverExtension.perfLogFeatures();
        if (!this._perfLogFeatures.userTiming) {
            // User timing is needed for navigationStart.
            this._receivedData = false;
            this._requestCount = false;
        }
    }
    Object.defineProperty(PerflogMetric, "BINDINGS", {
        // TODO(tbosch): use static values when our transpiler supports them
        get: function () { return _PROVIDERS; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PerflogMetric, "SET_TIMEOUT", {
        // TODO(tbosch): use static values when our transpiler supports them
        get: function () { return _SET_TIMEOUT; },
        enumerable: true,
        configurable: true
    });
    PerflogMetric.prototype.describe = function () {
        var res = {
            'scriptTime': 'script execution time in ms, including gc and render',
            'pureScriptTime': 'script execution time in ms, without gc nor render'
        };
        if (this._perfLogFeatures.render) {
            res['renderTime'] = 'render time in ms';
        }
        if (this._perfLogFeatures.gc) {
            res['gcTime'] = 'gc time in ms';
            res['gcAmount'] = 'gc amount in kbytes';
            res['majorGcTime'] = 'time of major gcs in ms';
            if (this._forceGc) {
                res['forcedGcTime'] = 'forced gc time in ms';
                res['forcedGcAmount'] = 'forced gc amount in kbytes';
            }
        }
        if (this._receivedData) {
            res['receivedData'] = 'encoded bytes received since navigationStart';
        }
        if (this._requestCount) {
            res['requestCount'] = 'count of requests sent since navigationStart';
        }
        if (this._captureFrames) {
            if (!this._perfLogFeatures.frameCapture) {
                var warningMsg = 'WARNING: Metric requested, but not supported by driver';
                // using dot syntax for metric name to keep them grouped together in console reporter
                res['frameTime.mean'] = warningMsg;
                res['frameTime.worst'] = warningMsg;
                res['frameTime.best'] = warningMsg;
                res['frameTime.smooth'] = warningMsg;
            }
            else {
                res['frameTime.mean'] = 'mean frame time in ms (target: 16.6ms for 60fps)';
                res['frameTime.worst'] = 'worst frame time in ms';
                res['frameTime.best'] = 'best frame time in ms';
                res['frameTime.smooth'] = 'percentage of frames that hit 60fps';
            }
        }
        collection_1.StringMapWrapper.forEach(this._microMetrics, function (desc, name) { collection_1.StringMapWrapper.set(res, name, desc); });
        return res;
    };
    PerflogMetric.prototype.beginMeasure = function () {
        var _this = this;
        var resultPromise = async_1.PromiseWrapper.resolve(null);
        if (this._forceGc) {
            resultPromise = resultPromise.then(function (_) { return _this._driverExtension.gc(); });
        }
        return resultPromise.then(function (_) { return _this._beginMeasure(); });
    };
    PerflogMetric.prototype.endMeasure = function (restart) {
        if (this._forceGc) {
            return this._endPlainMeasureAndMeasureForceGc(restart);
        }
        else {
            return this._endMeasure(restart);
        }
    };
    PerflogMetric.prototype._endPlainMeasureAndMeasureForceGc = function (restartMeasure) {
        var _this = this;
        return this._endMeasure(true).then(function (measureValues) {
            // disable frame capture for measurements during forced gc
            var originalFrameCaptureValue = _this._captureFrames;
            _this._captureFrames = false;
            return _this._driverExtension.gc()
                .then(function (_) { return _this._endMeasure(restartMeasure); })
                .then(function (forceGcMeasureValues) {
                _this._captureFrames = originalFrameCaptureValue;
                collection_1.StringMapWrapper.set(measureValues, 'forcedGcTime', forceGcMeasureValues['gcTime']);
                collection_1.StringMapWrapper.set(measureValues, 'forcedGcAmount', forceGcMeasureValues['gcAmount']);
                return measureValues;
            });
        });
    };
    PerflogMetric.prototype._beginMeasure = function () {
        return this._driverExtension.timeBegin(this._markName(this._measureCount++));
    };
    PerflogMetric.prototype._endMeasure = function (restart) {
        var _this = this;
        var markName = this._markName(this._measureCount - 1);
        var nextMarkName = restart ? this._markName(this._measureCount++) : null;
        return this._driverExtension.timeEnd(markName, nextMarkName)
            .then(function (_) { return _this._readUntilEndMark(markName); });
    };
    PerflogMetric.prototype._readUntilEndMark = function (markName, loopCount, startEvent) {
        var _this = this;
        if (loopCount === void 0) { loopCount = 0; }
        if (startEvent === void 0) { startEvent = null; }
        if (loopCount > _MAX_RETRY_COUNT) {
            throw new exceptions_1.BaseException("Tried too often to get the ending mark: " + loopCount);
        }
        return this._driverExtension.readPerfLog().then(function (events) {
            _this._addEvents(events);
            var result = _this._aggregateEvents(_this._remainingEvents, markName);
            if (lang_1.isPresent(result)) {
                _this._remainingEvents = events;
                return result;
            }
            var completer = async_1.PromiseWrapper.completer();
            _this._setTimeout(function () { return completer.resolve(_this._readUntilEndMark(markName, loopCount + 1)); }, 100);
            return completer.promise;
        });
    };
    PerflogMetric.prototype._addEvents = function (events) {
        var _this = this;
        var needSort = false;
        events.forEach(function (event) {
            if (lang_1.StringWrapper.equals(event['ph'], 'X')) {
                needSort = true;
                var startEvent = {};
                var endEvent = {};
                collection_1.StringMapWrapper.forEach(event, function (value, prop) {
                    startEvent[prop] = value;
                    endEvent[prop] = value;
                });
                startEvent['ph'] = 'B';
                endEvent['ph'] = 'E';
                endEvent['ts'] = startEvent['ts'] + startEvent['dur'];
                _this._remainingEvents.push(startEvent);
                _this._remainingEvents.push(endEvent);
            }
            else {
                _this._remainingEvents.push(event);
            }
        });
        if (needSort) {
            // Need to sort because of the ph==='X' events
            collection_1.ListWrapper.sort(this._remainingEvents, function (a, b) {
                var diff = a['ts'] - b['ts'];
                return diff > 0 ? 1 : diff < 0 ? -1 : 0;
            });
        }
    };
    PerflogMetric.prototype._aggregateEvents = function (events, markName) {
        var _this = this;
        var result = { 'scriptTime': 0, 'pureScriptTime': 0 };
        if (this._perfLogFeatures.gc) {
            result['gcTime'] = 0;
            result['majorGcTime'] = 0;
            result['gcAmount'] = 0;
        }
        if (this._perfLogFeatures.render) {
            result['renderTime'] = 0;
        }
        if (this._captureFrames) {
            result['frameTime.mean'] = 0;
            result['frameTime.best'] = 0;
            result['frameTime.worst'] = 0;
            result['frameTime.smooth'] = 0;
        }
        collection_1.StringMapWrapper.forEach(this._microMetrics, function (desc, name) { result[name] = 0; });
        if (this._receivedData) {
            result['receivedData'] = 0;
        }
        if (this._requestCount) {
            result['requestCount'] = 0;
        }
        var markStartEvent = null;
        var markEndEvent = null;
        var gcTimeInScript = 0;
        var renderTimeInScript = 0;
        var frameTimestamps = [];
        var frameTimes = [];
        var frameCaptureStartEvent = null;
        var frameCaptureEndEvent = null;
        var intervalStarts = {};
        var intervalStartCount = {};
        events.forEach(function (event) {
            var ph = event['ph'];
            var name = event['name'];
            var microIterations = 1;
            var microIterationsMatch = lang_1.RegExpWrapper.firstMatch(_MICRO_ITERATIONS_REGEX, name);
            if (lang_1.isPresent(microIterationsMatch)) {
                name = microIterationsMatch[1];
                microIterations = lang_1.NumberWrapper.parseInt(microIterationsMatch[2], 10);
            }
            if (lang_1.StringWrapper.equals(ph, 'b') && lang_1.StringWrapper.equals(name, markName)) {
                markStartEvent = event;
            }
            else if (lang_1.StringWrapper.equals(ph, 'e') && lang_1.StringWrapper.equals(name, markName)) {
                markEndEvent = event;
            }
            var isInstant = lang_1.StringWrapper.equals(ph, 'I') || lang_1.StringWrapper.equals(ph, 'i');
            if (_this._requestCount && lang_1.StringWrapper.equals(name, 'sendRequest')) {
                result['requestCount'] += 1;
            }
            else if (_this._receivedData && lang_1.StringWrapper.equals(name, 'receivedData') && isInstant) {
                result['receivedData'] += event['args']['encodedDataLength'];
            }
            else if (lang_1.StringWrapper.equals(name, 'navigationStart')) {
                // We count data + requests since the last navigationStart
                // (there might be chrome extensions loaded by selenium before our page, so there
                // will likely be more than one navigationStart).
                if (_this._receivedData) {
                    result['receivedData'] = 0;
                }
                if (_this._requestCount) {
                    result['requestCount'] = 0;
                }
            }
            if (lang_1.isPresent(markStartEvent) && lang_1.isBlank(markEndEvent) &&
                event['pid'] === markStartEvent['pid']) {
                if (lang_1.StringWrapper.equals(ph, 'b') && lang_1.StringWrapper.equals(name, _MARK_NAME_FRAME_CAPUTRE)) {
                    if (lang_1.isPresent(frameCaptureStartEvent)) {
                        throw new exceptions_1.BaseException('can capture frames only once per benchmark run');
                    }
                    if (!_this._captureFrames) {
                        throw new exceptions_1.BaseException('found start event for frame capture, but frame capture was not requested in benchpress');
                    }
                    frameCaptureStartEvent = event;
                }
                else if (lang_1.StringWrapper.equals(ph, 'e') &&
                    lang_1.StringWrapper.equals(name, _MARK_NAME_FRAME_CAPUTRE)) {
                    if (lang_1.isBlank(frameCaptureStartEvent)) {
                        throw new exceptions_1.BaseException('missing start event for frame capture');
                    }
                    frameCaptureEndEvent = event;
                }
                if (isInstant) {
                    if (lang_1.isPresent(frameCaptureStartEvent) && lang_1.isBlank(frameCaptureEndEvent) &&
                        lang_1.StringWrapper.equals(name, 'frame')) {
                        frameTimestamps.push(event['ts']);
                        if (frameTimestamps.length >= 2) {
                            frameTimes.push(frameTimestamps[frameTimestamps.length - 1] -
                                frameTimestamps[frameTimestamps.length - 2]);
                        }
                    }
                }
                if (lang_1.StringWrapper.equals(ph, 'B') || lang_1.StringWrapper.equals(ph, 'b')) {
                    if (lang_1.isBlank(intervalStarts[name])) {
                        intervalStartCount[name] = 1;
                        intervalStarts[name] = event;
                    }
                    else {
                        intervalStartCount[name]++;
                    }
                }
                else if ((lang_1.StringWrapper.equals(ph, 'E') || lang_1.StringWrapper.equals(ph, 'e')) &&
                    lang_1.isPresent(intervalStarts[name])) {
                    intervalStartCount[name]--;
                    if (intervalStartCount[name] === 0) {
                        var startEvent = intervalStarts[name];
                        var duration = (event['ts'] - startEvent['ts']);
                        intervalStarts[name] = null;
                        if (lang_1.StringWrapper.equals(name, 'gc')) {
                            result['gcTime'] += duration;
                            var amount = (startEvent['args']['usedHeapSize'] - event['args']['usedHeapSize']) / 1000;
                            result['gcAmount'] += amount;
                            var majorGc = event['args']['majorGc'];
                            if (lang_1.isPresent(majorGc) && majorGc) {
                                result['majorGcTime'] += duration;
                            }
                            if (lang_1.isPresent(intervalStarts['script'])) {
                                gcTimeInScript += duration;
                            }
                        }
                        else if (lang_1.StringWrapper.equals(name, 'render')) {
                            result['renderTime'] += duration;
                            if (lang_1.isPresent(intervalStarts['script'])) {
                                renderTimeInScript += duration;
                            }
                        }
                        else if (lang_1.StringWrapper.equals(name, 'script')) {
                            result['scriptTime'] += duration;
                        }
                        else if (lang_1.isPresent(_this._microMetrics[name])) {
                            result[name] += duration / microIterations;
                        }
                    }
                }
            }
        });
        if (!lang_1.isPresent(markStartEvent) || !lang_1.isPresent(markEndEvent)) {
            // not all events have been received, no further processing for now
            return null;
        }
        if (lang_1.isPresent(markEndEvent) && lang_1.isPresent(frameCaptureStartEvent) &&
            lang_1.isBlank(frameCaptureEndEvent)) {
            throw new exceptions_1.BaseException('missing end event for frame capture');
        }
        if (this._captureFrames && lang_1.isBlank(frameCaptureStartEvent)) {
            throw new exceptions_1.BaseException('frame capture requested in benchpress, but no start event was found');
        }
        if (frameTimes.length > 0) {
            this._addFrameMetrics(result, frameTimes);
        }
        result['pureScriptTime'] = result['scriptTime'] - gcTimeInScript - renderTimeInScript;
        return result;
    };
    PerflogMetric.prototype._addFrameMetrics = function (result, frameTimes) {
        result['frameTime.mean'] = frameTimes.reduce(function (a, b) { return a + b; }, 0) / frameTimes.length;
        var firstFrame = frameTimes[0];
        result['frameTime.worst'] = frameTimes.reduce(function (a, b) { return a > b ? a : b; }, firstFrame);
        result['frameTime.best'] = frameTimes.reduce(function (a, b) { return a < b ? a : b; }, firstFrame);
        result['frameTime.smooth'] =
            frameTimes.filter(function (t) { return t < _FRAME_TIME_SMOOTH_THRESHOLD; }).length / frameTimes.length;
    };
    PerflogMetric.prototype._markName = function (index) { return "" + _MARK_NAME_PREFIX + index; };
    return PerflogMetric;
})(metric_1.Metric);
exports.PerflogMetric = PerflogMetric;
var _MICRO_ITERATIONS_REGEX = /(.+)\*(\d+)$/g;
var _MAX_RETRY_COUNT = 20;
var _MARK_NAME_PREFIX = 'benchpress';
var _SET_TIMEOUT = new di_1.OpaqueToken('PerflogMetric.setTimeout');
var _MARK_NAME_FRAME_CAPUTRE = 'frameCapture';
// using 17ms as a somewhat looser threshold, instead of 16.6666ms
var _FRAME_TIME_SMOOTH_THRESHOLD = 17;
var _PROVIDERS = [
    di_1.bind(PerflogMetric)
        .toFactory(function (driverExtension, setTimeout, microMetrics, forceGc, captureFrames, receivedData, requestCount) {
        return new PerflogMetric(driverExtension, setTimeout, microMetrics, forceGc, captureFrames, receivedData, requestCount);
    }, [
        web_driver_extension_1.WebDriverExtension,
        _SET_TIMEOUT,
        common_options_1.Options.MICRO_METRICS,
        common_options_1.Options.FORCE_GC,
        common_options_1.Options.CAPTURE_FRAMES,
        common_options_1.Options.RECEIVED_DATA,
        common_options_1.Options.REQUEST_COUNT
    ]),
    di_1.provide(_SET_TIMEOUT, { useValue: function (fn, millis) { return async_1.TimerWrapper.setTimeout(fn, millis); } })
];
},{"../common_options":25,"../metric":27,"../web_driver_extension":42,"angular2/src/core/di":1,"angular2/src/facade/async":14,"angular2/src/facade/collection":16,"angular2/src/facade/exceptions":18,"angular2/src/facade/lang":19}],30:[function(require,module,exports){
'use strict';var di_1 = require('angular2/src/core/di');
var exceptions_1 = require('angular2/src/facade/exceptions');
/**
 * A reporter reports measure values and the valid sample.
 */
var Reporter = (function () {
    function Reporter() {
    }
    Reporter.bindTo = function (delegateToken) {
        return [di_1.bind(Reporter).toFactory(function (delegate) { return delegate; }, [delegateToken])];
    };
    Reporter.prototype.reportMeasureValues = function (values) { throw new exceptions_1.BaseException('NYI'); };
    Reporter.prototype.reportSample = function (completeSample, validSample) {
        throw new exceptions_1.BaseException('NYI');
    };
    return Reporter;
})();
exports.Reporter = Reporter;
},{"angular2/src/core/di":1,"angular2/src/facade/exceptions":18}],31:[function(require,module,exports){
'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var lang_1 = require('angular2/src/facade/lang');
var collection_1 = require('angular2/src/facade/collection');
var async_1 = require('angular2/src/facade/async');
var math_1 = require('angular2/src/facade/math');
var di_1 = require('angular2/src/core/di');
var statistic_1 = require('../statistic');
var reporter_1 = require('../reporter');
var sample_description_1 = require('../sample_description');
/**
 * A reporter for the console
 */
var ConsoleReporter = (function (_super) {
    __extends(ConsoleReporter, _super);
    function ConsoleReporter(_columnWidth, sampleDescription, _print) {
        _super.call(this);
        this._columnWidth = _columnWidth;
        this._print = _print;
        this._metricNames = ConsoleReporter._sortedProps(sampleDescription.metrics);
        this._printDescription(sampleDescription);
    }
    Object.defineProperty(ConsoleReporter, "PRINT", {
        // TODO(tbosch): use static values when our transpiler supports them
        get: function () { return _PRINT; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConsoleReporter, "COLUMN_WIDTH", {
        // TODO(tbosch): use static values when our transpiler supports them
        get: function () { return _COLUMN_WIDTH; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConsoleReporter, "BINDINGS", {
        // TODO(tbosch): use static values when our transpiler supports them
        get: function () { return _PROVIDERS; },
        enumerable: true,
        configurable: true
    });
    ConsoleReporter._lpad = function (value, columnWidth, fill) {
        if (fill === void 0) { fill = ' '; }
        var result = '';
        for (var i = 0; i < columnWidth - value.length; i++) {
            result += fill;
        }
        return result + value;
    };
    ConsoleReporter._formatNum = function (n) { return lang_1.NumberWrapper.toFixed(n, 2); };
    ConsoleReporter._sortedProps = function (obj) {
        var props = [];
        collection_1.StringMapWrapper.forEach(obj, function (value, prop) { return props.push(prop); });
        props.sort();
        return props;
    };
    ConsoleReporter.prototype._printDescription = function (sampleDescription) {
        var _this = this;
        this._print("BENCHMARK " + sampleDescription.id);
        this._print('Description:');
        var props = ConsoleReporter._sortedProps(sampleDescription.description);
        props.forEach(function (prop) { _this._print("- " + prop + ": " + sampleDescription.description[prop]); });
        this._print('Metrics:');
        this._metricNames.forEach(function (metricName) {
            _this._print("- " + metricName + ": " + sampleDescription.metrics[metricName]);
        });
        this._print('');
        this._printStringRow(this._metricNames);
        this._printStringRow(this._metricNames.map(function (_) { return ''; }), '-');
    };
    ConsoleReporter.prototype.reportMeasureValues = function (measureValues) {
        var formattedValues = this._metricNames.map(function (metricName) {
            var value = measureValues.values[metricName];
            return ConsoleReporter._formatNum(value);
        });
        this._printStringRow(formattedValues);
        return async_1.PromiseWrapper.resolve(null);
    };
    ConsoleReporter.prototype.reportSample = function (completeSample, validSamples) {
        this._printStringRow(this._metricNames.map(function (_) { return ''; }), '=');
        this._printStringRow(this._metricNames.map(function (metricName) {
            var samples = validSamples.map(function (measureValues) { return measureValues.values[metricName]; });
            var mean = statistic_1.Statistic.calculateMean(samples);
            var cv = statistic_1.Statistic.calculateCoefficientOfVariation(samples, mean);
            var formattedMean = ConsoleReporter._formatNum(mean);
            // Note: Don't use the unicode character for +- as it might cause
            // hickups for consoles...
            return lang_1.NumberWrapper.isNaN(cv) ?
                formattedMean :
                formattedMean + "+-" + math_1.Math.floor(cv) + "%";
        }));
        return async_1.PromiseWrapper.resolve(null);
    };
    ConsoleReporter.prototype._printStringRow = function (parts, fill) {
        var _this = this;
        if (fill === void 0) { fill = ' '; }
        this._print(parts.map(function (part) { return ConsoleReporter._lpad(part, _this._columnWidth, fill); }).join(' | '));
    };
    return ConsoleReporter;
})(reporter_1.Reporter);
exports.ConsoleReporter = ConsoleReporter;
var _PRINT = new di_1.OpaqueToken('ConsoleReporter.print');
var _COLUMN_WIDTH = new di_1.OpaqueToken('ConsoleReporter.columnWidth');
var _PROVIDERS = [
    di_1.bind(ConsoleReporter)
        .toFactory(function (columnWidth, sampleDescription, print) {
        return new ConsoleReporter(columnWidth, sampleDescription, print);
    }, [_COLUMN_WIDTH, sample_description_1.SampleDescription, _PRINT]),
    di_1.provide(_COLUMN_WIDTH, { useValue: 18 }),
    di_1.provide(_PRINT, { useValue: lang_1.print })
];
},{"../reporter":30,"../sample_description":35,"../statistic":37,"angular2/src/core/di":1,"angular2/src/facade/async":14,"angular2/src/facade/collection":16,"angular2/src/facade/lang":19,"angular2/src/facade/math":20}],32:[function(require,module,exports){
'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var lang_1 = require('angular2/src/facade/lang');
var async_1 = require('angular2/src/facade/async');
var di_1 = require('angular2/src/core/di');
var reporter_1 = require('../reporter');
var sample_description_1 = require('../sample_description');
var common_options_1 = require('../common_options');
/**
 * A reporter that writes results into a json file.
 */
var JsonFileReporter = (function (_super) {
    __extends(JsonFileReporter, _super);
    function JsonFileReporter(sampleDescription, path, writeFile, now) {
        _super.call(this);
        this._description = sampleDescription;
        this._path = path;
        this._writeFile = writeFile;
        this._now = now;
    }
    Object.defineProperty(JsonFileReporter, "PATH", {
        // TODO(tbosch): use static values when our transpiler supports them
        get: function () { return _PATH; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(JsonFileReporter, "BINDINGS", {
        // TODO(tbosch): use static values when our transpiler supports them
        get: function () { return _PROVIDERS; },
        enumerable: true,
        configurable: true
    });
    JsonFileReporter.prototype.reportMeasureValues = function (measureValues) {
        return async_1.PromiseWrapper.resolve(null);
    };
    JsonFileReporter.prototype.reportSample = function (completeSample, validSample) {
        var content = lang_1.Json.stringify({
            'description': this._description,
            'completeSample': completeSample,
            'validSample': validSample
        });
        var filePath = this._path + "/" + this._description.id + "_" + lang_1.DateWrapper.toMillis(this._now()) + ".json";
        return this._writeFile(filePath, content);
    };
    return JsonFileReporter;
})(reporter_1.Reporter);
exports.JsonFileReporter = JsonFileReporter;
var _PATH = new di_1.OpaqueToken('JsonFileReporter.path');
var _PROVIDERS = [
    di_1.bind(JsonFileReporter)
        .toFactory(function (sampleDescription, path, writeFile, now) {
        return new JsonFileReporter(sampleDescription, path, writeFile, now);
    }, [sample_description_1.SampleDescription, _PATH, common_options_1.Options.WRITE_FILE, common_options_1.Options.NOW]),
    di_1.provide(_PATH, { useValue: '.' })
];
},{"../common_options":25,"../reporter":30,"../sample_description":35,"angular2/src/core/di":1,"angular2/src/facade/async":14,"angular2/src/facade/lang":19}],33:[function(require,module,exports){
'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var di_1 = require('angular2/src/core/di');
var async_1 = require('angular2/src/facade/async');
var reporter_1 = require('../reporter');
var MultiReporter = (function (_super) {
    __extends(MultiReporter, _super);
    function MultiReporter(reporters) {
        _super.call(this);
        this._reporters = reporters;
    }
    MultiReporter.createBindings = function (childTokens) {
        return [
            di_1.bind(_CHILDREN)
                .toFactory(function (injector) { return childTokens.map(function (token) { return injector.get(token); }); }, [di_1.Injector]),
            di_1.bind(MultiReporter).toFactory(function (children) { return new MultiReporter(children); }, [_CHILDREN])
        ];
    };
    MultiReporter.prototype.reportMeasureValues = function (values) {
        return async_1.PromiseWrapper.all(this._reporters.map(function (reporter) { return reporter.reportMeasureValues(values); }));
    };
    MultiReporter.prototype.reportSample = function (completeSample, validSample) {
        return async_1.PromiseWrapper.all(this._reporters.map(function (reporter) { return reporter.reportSample(completeSample, validSample); }));
    };
    return MultiReporter;
})(reporter_1.Reporter);
exports.MultiReporter = MultiReporter;
var _CHILDREN = new di_1.OpaqueToken('MultiReporter.children');
},{"../reporter":30,"angular2/src/core/di":1,"angular2/src/facade/async":14}],34:[function(require,module,exports){
'use strict';var di_1 = require('angular2/src/core/di');
var lang_1 = require('angular2/src/facade/lang');
var async_1 = require('angular2/src/facade/async');
var sampler_1 = require('./sampler');
var console_reporter_1 = require('./reporter/console_reporter');
var multi_reporter_1 = require('./reporter/multi_reporter');
var regression_slope_validator_1 = require('./validator/regression_slope_validator');
var size_validator_1 = require('./validator/size_validator');
var validator_1 = require('./validator');
var perflog_metric_1 = require('./metric/perflog_metric');
var multi_metric_1 = require('./metric/multi_metric');
var chrome_driver_extension_1 = require('./webdriver/chrome_driver_extension');
var firefox_driver_extension_1 = require('./webdriver/firefox_driver_extension');
var ios_driver_extension_1 = require('./webdriver/ios_driver_extension');
var web_driver_extension_1 = require('./web_driver_extension');
var sample_description_1 = require('./sample_description');
var web_driver_adapter_1 = require('./web_driver_adapter');
var reporter_1 = require('./reporter');
var metric_1 = require('./metric');
var common_options_1 = require('./common_options');
/**
 * The Runner is the main entry point for executing a sample run.
 * It provides defaults, creates the injector and calls the sampler.
 */
var Runner = (function () {
    function Runner(defaultBindings) {
        if (defaultBindings === void 0) { defaultBindings = null; }
        if (lang_1.isBlank(defaultBindings)) {
            defaultBindings = [];
        }
        this._defaultBindings = defaultBindings;
    }
    Runner.prototype.sample = function (_a) {
        var id = _a.id, execute = _a.execute, prepare = _a.prepare, microMetrics = _a.microMetrics, bindings = _a.bindings;
        var sampleBindings = [
            _DEFAULT_PROVIDERS,
            this._defaultBindings,
            di_1.bind(common_options_1.Options.SAMPLE_ID).toValue(id),
            di_1.bind(common_options_1.Options.EXECUTE).toValue(execute)
        ];
        if (lang_1.isPresent(prepare)) {
            sampleBindings.push(di_1.bind(common_options_1.Options.PREPARE).toValue(prepare));
        }
        if (lang_1.isPresent(microMetrics)) {
            sampleBindings.push(di_1.bind(common_options_1.Options.MICRO_METRICS).toValue(microMetrics));
        }
        if (lang_1.isPresent(bindings)) {
            sampleBindings.push(bindings);
        }
        var inj = di_1.Injector.resolveAndCreate(sampleBindings);
        var adapter = inj.get(web_driver_adapter_1.WebDriverAdapter);
        return async_1.PromiseWrapper
            .all([adapter.capabilities(), adapter.executeScript('return window.navigator.userAgent;')])
            .then(function (args) {
            var capabilities = args[0];
            var userAgent = args[1];
            // This might still create instances twice. We are creating a new injector with all the
            // providers.
            // Only WebDriverAdapter is reused.
            // TODO vsavkin consider changing it when toAsyncFactory is added back or when child
            // injectors are handled better.
            var injector = di_1.Injector.resolveAndCreate([
                sampleBindings,
                di_1.bind(common_options_1.Options.CAPABILITIES).toValue(capabilities),
                di_1.bind(common_options_1.Options.USER_AGENT).toValue(userAgent),
                di_1.provide(web_driver_adapter_1.WebDriverAdapter, { useValue: adapter })
            ]);
            var sampler = injector.get(sampler_1.Sampler);
            return sampler.sample();
        });
    };
    return Runner;
})();
exports.Runner = Runner;
var _DEFAULT_PROVIDERS = [
    common_options_1.Options.DEFAULT_PROVIDERS,
    sampler_1.Sampler.BINDINGS,
    console_reporter_1.ConsoleReporter.BINDINGS,
    regression_slope_validator_1.RegressionSlopeValidator.BINDINGS,
    size_validator_1.SizeValidator.BINDINGS,
    chrome_driver_extension_1.ChromeDriverExtension.BINDINGS,
    firefox_driver_extension_1.FirefoxDriverExtension.BINDINGS,
    ios_driver_extension_1.IOsDriverExtension.BINDINGS,
    perflog_metric_1.PerflogMetric.BINDINGS,
    sample_description_1.SampleDescription.BINDINGS,
    multi_reporter_1.MultiReporter.createBindings([console_reporter_1.ConsoleReporter]),
    multi_metric_1.MultiMetric.createBindings([perflog_metric_1.PerflogMetric]),
    reporter_1.Reporter.bindTo(multi_reporter_1.MultiReporter),
    validator_1.Validator.bindTo(regression_slope_validator_1.RegressionSlopeValidator),
    web_driver_extension_1.WebDriverExtension.bindTo([chrome_driver_extension_1.ChromeDriverExtension, firefox_driver_extension_1.FirefoxDriverExtension, ios_driver_extension_1.IOsDriverExtension]),
    metric_1.Metric.bindTo(multi_metric_1.MultiMetric),
];
},{"./common_options":25,"./metric":27,"./metric/multi_metric":28,"./metric/perflog_metric":29,"./reporter":30,"./reporter/console_reporter":31,"./reporter/multi_reporter":33,"./sample_description":35,"./sampler":36,"./validator":38,"./validator/regression_slope_validator":39,"./validator/size_validator":40,"./web_driver_adapter":41,"./web_driver_extension":42,"./webdriver/chrome_driver_extension":43,"./webdriver/firefox_driver_extension":44,"./webdriver/ios_driver_extension":45,"angular2/src/core/di":1,"angular2/src/facade/async":14,"angular2/src/facade/lang":19}],35:[function(require,module,exports){
'use strict';var collection_1 = require('angular2/src/facade/collection');
var di_1 = require('angular2/src/core/di');
var validator_1 = require('./validator');
var metric_1 = require('./metric');
var common_options_1 = require('./common_options');
/**
 * SampleDescription merges all available descriptions about a sample
 */
var SampleDescription = (function () {
    function SampleDescription(id, descriptions, metrics) {
        var _this = this;
        this.id = id;
        this.metrics = metrics;
        this.description = {};
        descriptions.forEach(function (description) {
            collection_1.StringMapWrapper.forEach(description, function (value, prop) { return _this.description[prop] = value; });
        });
    }
    Object.defineProperty(SampleDescription, "BINDINGS", {
        // TODO(tbosch): use static values when our transpiler supports them
        get: function () { return _PROVIDERS; },
        enumerable: true,
        configurable: true
    });
    SampleDescription.prototype.toJson = function () { return { 'id': this.id, 'description': this.description, 'metrics': this.metrics }; };
    return SampleDescription;
})();
exports.SampleDescription = SampleDescription;
var _PROVIDERS = [
    di_1.bind(SampleDescription)
        .toFactory(function (metric, id, forceGc, userAgent, validator, defaultDesc, userDesc) {
        return new SampleDescription(id, [
            { 'forceGc': forceGc, 'userAgent': userAgent },
            validator.describe(),
            defaultDesc,
            userDesc
        ], metric.describe());
    }, [
        metric_1.Metric,
        common_options_1.Options.SAMPLE_ID,
        common_options_1.Options.FORCE_GC,
        common_options_1.Options.USER_AGENT,
        validator_1.Validator,
        common_options_1.Options.DEFAULT_DESCRIPTION,
        common_options_1.Options.SAMPLE_DESCRIPTION
    ])
];
},{"./common_options":25,"./metric":27,"./validator":38,"angular2/src/core/di":1,"angular2/src/facade/collection":16}],36:[function(require,module,exports){
'use strict';var lang_1 = require('angular2/src/facade/lang');
var async_1 = require('angular2/src/facade/async');
var di_1 = require('angular2/src/core/di');
var metric_1 = require('./metric');
var validator_1 = require('./validator');
var reporter_1 = require('./reporter');
var web_driver_adapter_1 = require('./web_driver_adapter');
var common_options_1 = require('./common_options');
var measure_values_1 = require('./measure_values');
/**
 * The Sampler owns the sample loop:
 * 1. calls the prepare/execute callbacks,
 * 2. gets data from the metric
 * 3. asks the validator for a valid sample
 * 4. reports the new data to the reporter
 * 5. loop until there is a valid sample
 */
var Sampler = (function () {
    function Sampler(_a) {
        var _b = _a === void 0 ? {} : _a, driver = _b.driver, metric = _b.metric, reporter = _b.reporter, validator = _b.validator, prepare = _b.prepare, execute = _b.execute, now = _b.now;
        this._driver = driver;
        this._metric = metric;
        this._reporter = reporter;
        this._validator = validator;
        this._prepare = prepare;
        this._execute = execute;
        this._now = now;
    }
    Object.defineProperty(Sampler, "BINDINGS", {
        // TODO(tbosch): use static values when our transpiler supports them
        get: function () { return _PROVIDERS; },
        enumerable: true,
        configurable: true
    });
    Sampler.prototype.sample = function () {
        var _this = this;
        var loop;
        loop = function (lastState) {
            return _this._iterate(lastState).then(function (newState) {
                if (lang_1.isPresent(newState.validSample)) {
                    return newState;
                }
                else {
                    return loop(newState);
                }
            });
        };
        return loop(new SampleState([], null));
    };
    Sampler.prototype._iterate = function (lastState) {
        var _this = this;
        var resultPromise;
        if (lang_1.isPresent(this._prepare)) {
            resultPromise = this._driver.waitFor(this._prepare);
        }
        else {
            resultPromise = async_1.PromiseWrapper.resolve(null);
        }
        if (lang_1.isPresent(this._prepare) || lastState.completeSample.length === 0) {
            resultPromise = resultPromise.then(function (_) { return _this._metric.beginMeasure(); });
        }
        return resultPromise.then(function (_) { return _this._driver.waitFor(_this._execute); })
            .then(function (_) { return _this._metric.endMeasure(lang_1.isBlank(_this._prepare)); })
            .then(function (measureValues) { return _this._report(lastState, measureValues); });
    };
    Sampler.prototype._report = function (state, metricValues) {
        var _this = this;
        var measureValues = new measure_values_1.MeasureValues(state.completeSample.length, this._now(), metricValues);
        var completeSample = state.completeSample.concat([measureValues]);
        var validSample = this._validator.validate(completeSample);
        var resultPromise = this._reporter.reportMeasureValues(measureValues);
        if (lang_1.isPresent(validSample)) {
            resultPromise =
                resultPromise.then(function (_) { return _this._reporter.reportSample(completeSample, validSample); });
        }
        return resultPromise.then(function (_) { return new SampleState(completeSample, validSample); });
    };
    return Sampler;
})();
exports.Sampler = Sampler;
var SampleState = (function () {
    function SampleState(completeSample, validSample) {
        this.completeSample = completeSample;
        this.validSample = validSample;
    }
    return SampleState;
})();
exports.SampleState = SampleState;
var _PROVIDERS = [
    di_1.bind(Sampler)
        .toFactory(function (driver, metric, reporter, validator, prepare, execute, now) { return new Sampler({
        driver: driver,
        reporter: reporter,
        validator: validator,
        metric: metric,
        // TODO(tbosch): DI right now does not support null/undefined objects
        // Mostly because the cache would have to be initialized with a
        // special null object, which is expensive.
        prepare: prepare !== false ? prepare : null,
        execute: execute,
        now: now
    }); }, [
        web_driver_adapter_1.WebDriverAdapter,
        metric_1.Metric,
        reporter_1.Reporter,
        validator_1.Validator,
        common_options_1.Options.PREPARE,
        common_options_1.Options.EXECUTE,
        common_options_1.Options.NOW
    ])
];
},{"./common_options":25,"./measure_values":26,"./metric":27,"./reporter":30,"./validator":38,"./web_driver_adapter":41,"angular2/src/core/di":1,"angular2/src/facade/async":14,"angular2/src/facade/lang":19}],37:[function(require,module,exports){
'use strict';var math_1 = require('angular2/src/facade/math');
var Statistic = (function () {
    function Statistic() {
    }
    Statistic.calculateCoefficientOfVariation = function (sample, mean) {
        return Statistic.calculateStandardDeviation(sample, mean) / mean * 100;
    };
    Statistic.calculateMean = function (samples) {
        var total = 0;
        // TODO: use reduce
        samples.forEach(function (x) { return total += x; });
        return total / samples.length;
    };
    Statistic.calculateStandardDeviation = function (samples, mean) {
        var deviation = 0;
        // TODO: use reduce
        samples.forEach(function (x) { return deviation += math_1.Math.pow(x - mean, 2); });
        deviation = deviation / (samples.length);
        deviation = math_1.Math.sqrt(deviation);
        return deviation;
    };
    Statistic.calculateRegressionSlope = function (xValues, xMean, yValues, yMean) {
        // See http://en.wikipedia.org/wiki/Simple_linear_regression
        var dividendSum = 0;
        var divisorSum = 0;
        for (var i = 0; i < xValues.length; i++) {
            dividendSum += (xValues[i] - xMean) * (yValues[i] - yMean);
            divisorSum += math_1.Math.pow(xValues[i] - xMean, 2);
        }
        return dividendSum / divisorSum;
    };
    return Statistic;
})();
exports.Statistic = Statistic;
},{"angular2/src/facade/math":20}],38:[function(require,module,exports){
'use strict';var di_1 = require('angular2/src/core/di');
var exceptions_1 = require('angular2/src/facade/exceptions');
/**
 * A Validator calculates a valid sample out of the complete sample.
 * A valid sample is a sample that represents the population that should be observed
 * in the correct way.
 */
var Validator = (function () {
    function Validator() {
    }
    Validator.bindTo = function (delegateToken) {
        return [di_1.bind(Validator).toFactory(function (delegate) { return delegate; }, [delegateToken])];
    };
    /**
     * Calculates a valid sample out of the complete sample
     */
    Validator.prototype.validate = function (completeSample) { throw new exceptions_1.BaseException('NYI'); };
    /**
     * Returns a Map that describes the properties of the validator
     * (e.g. sample size, ...)
     */
    Validator.prototype.describe = function () { throw new exceptions_1.BaseException('NYI'); };
    return Validator;
})();
exports.Validator = Validator;
},{"angular2/src/core/di":1,"angular2/src/facade/exceptions":18}],39:[function(require,module,exports){
'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var collection_1 = require('angular2/src/facade/collection');
var di_1 = require('angular2/src/core/di');
var validator_1 = require('../validator');
var statistic_1 = require('../statistic');
/**
 * A validator that checks the regression slope of a specific metric.
 * Waits for the regression slope to be >=0.
 */
var RegressionSlopeValidator = (function (_super) {
    __extends(RegressionSlopeValidator, _super);
    function RegressionSlopeValidator(sampleSize, metric) {
        _super.call(this);
        this._sampleSize = sampleSize;
        this._metric = metric;
    }
    Object.defineProperty(RegressionSlopeValidator, "SAMPLE_SIZE", {
        // TODO(tbosch): use static values when our transpiler supports them
        get: function () { return _SAMPLE_SIZE; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RegressionSlopeValidator, "METRIC", {
        // TODO(tbosch): use static values when our transpiler supports them
        get: function () { return _METRIC; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RegressionSlopeValidator, "BINDINGS", {
        // TODO(tbosch): use static values when our transpiler supports them
        get: function () { return _PROVIDERS; },
        enumerable: true,
        configurable: true
    });
    RegressionSlopeValidator.prototype.describe = function () {
        return { 'sampleSize': this._sampleSize, 'regressionSlopeMetric': this._metric };
    };
    RegressionSlopeValidator.prototype.validate = function (completeSample) {
        if (completeSample.length >= this._sampleSize) {
            var latestSample = collection_1.ListWrapper.slice(completeSample, completeSample.length - this._sampleSize, completeSample.length);
            var xValues = [];
            var yValues = [];
            for (var i = 0; i < latestSample.length; i++) {
                // For now, we only use the array index as x value.
                // TODO(tbosch): think about whether we should use time here instead
                xValues.push(i);
                yValues.push(latestSample[i].values[this._metric]);
            }
            var regressionSlope = statistic_1.Statistic.calculateRegressionSlope(xValues, statistic_1.Statistic.calculateMean(xValues), yValues, statistic_1.Statistic.calculateMean(yValues));
            return regressionSlope >= 0 ? latestSample : null;
        }
        else {
            return null;
        }
    };
    return RegressionSlopeValidator;
})(validator_1.Validator);
exports.RegressionSlopeValidator = RegressionSlopeValidator;
var _SAMPLE_SIZE = new di_1.OpaqueToken('RegressionSlopeValidator.sampleSize');
var _METRIC = new di_1.OpaqueToken('RegressionSlopeValidator.metric');
var _PROVIDERS = [
    di_1.bind(RegressionSlopeValidator)
        .toFactory(function (sampleSize, metric) { return new RegressionSlopeValidator(sampleSize, metric); }, [_SAMPLE_SIZE, _METRIC]),
    di_1.provide(_SAMPLE_SIZE, { useValue: 10 }),
    di_1.provide(_METRIC, { useValue: 'scriptTime' })
];
},{"../statistic":37,"../validator":38,"angular2/src/core/di":1,"angular2/src/facade/collection":16}],40:[function(require,module,exports){
'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var collection_1 = require('angular2/src/facade/collection');
var di_1 = require('angular2/src/core/di');
var validator_1 = require('../validator');
/**
 * A validator that waits for the sample to have a certain size.
 */
var SizeValidator = (function (_super) {
    __extends(SizeValidator, _super);
    function SizeValidator(size) {
        _super.call(this);
        this._sampleSize = size;
    }
    Object.defineProperty(SizeValidator, "BINDINGS", {
        // TODO(tbosch): use static values when our transpiler supports them
        get: function () { return _PROVIDERS; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SizeValidator, "SAMPLE_SIZE", {
        // TODO(tbosch): use static values when our transpiler supports them
        get: function () { return _SAMPLE_SIZE; },
        enumerable: true,
        configurable: true
    });
    SizeValidator.prototype.describe = function () { return { 'sampleSize': this._sampleSize }; };
    SizeValidator.prototype.validate = function (completeSample) {
        if (completeSample.length >= this._sampleSize) {
            return collection_1.ListWrapper.slice(completeSample, completeSample.length - this._sampleSize, completeSample.length);
        }
        else {
            return null;
        }
    };
    return SizeValidator;
})(validator_1.Validator);
exports.SizeValidator = SizeValidator;
var _SAMPLE_SIZE = new di_1.OpaqueToken('SizeValidator.sampleSize');
var _PROVIDERS = [
    di_1.bind(SizeValidator)
        .toFactory(function (size) { return new SizeValidator(size); }, [_SAMPLE_SIZE]),
    di_1.provide(_SAMPLE_SIZE, { useValue: 10 })
];
},{"../validator":38,"angular2/src/core/di":1,"angular2/src/facade/collection":16}],41:[function(require,module,exports){
'use strict';var di_1 = require('angular2/src/core/di');
var exceptions_1 = require('angular2/src/facade/exceptions');
/**
 * A WebDriverAdapter bridges API differences between different WebDriver clients,
 * e.g. JS vs Dart Async vs Dart Sync webdriver.
 * Needs one implementation for every supported WebDriver client.
 */
var WebDriverAdapter = (function () {
    function WebDriverAdapter() {
    }
    WebDriverAdapter.bindTo = function (delegateToken) {
        return [di_1.bind(WebDriverAdapter).toFactory(function (delegate) { return delegate; }, [delegateToken])];
    };
    WebDriverAdapter.prototype.waitFor = function (callback) { throw new exceptions_1.BaseException('NYI'); };
    WebDriverAdapter.prototype.executeScript = function (script) { throw new exceptions_1.BaseException('NYI'); };
    WebDriverAdapter.prototype.executeAsyncScript = function (script) { throw new exceptions_1.BaseException('NYI'); };
    WebDriverAdapter.prototype.capabilities = function () { throw new exceptions_1.BaseException('NYI'); };
    WebDriverAdapter.prototype.logs = function (type) { throw new exceptions_1.BaseException('NYI'); };
    return WebDriverAdapter;
})();
exports.WebDriverAdapter = WebDriverAdapter;
},{"angular2/src/core/di":1,"angular2/src/facade/exceptions":18}],42:[function(require,module,exports){
'use strict';var di_1 = require('angular2/src/core/di');
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var common_options_1 = require('./common_options');
/**
 * A WebDriverExtension implements extended commands of the webdriver protocol
 * for a given browser, independent of the WebDriverAdapter.
 * Needs one implementation for every supported Browser.
 */
var WebDriverExtension = (function () {
    function WebDriverExtension() {
    }
    WebDriverExtension.bindTo = function (childTokens) {
        var res = [
            di_1.bind(_CHILDREN)
                .toFactory(function (injector) { return childTokens.map(function (token) { return injector.get(token); }); }, [di_1.Injector]),
            di_1.bind(WebDriverExtension)
                .toFactory(function (children, capabilities) {
                var delegate;
                children.forEach(function (extension) {
                    if (extension.supports(capabilities)) {
                        delegate = extension;
                    }
                });
                if (lang_1.isBlank(delegate)) {
                    throw new exceptions_1.BaseException('Could not find a delegate for given capabilities!');
                }
                return delegate;
            }, [_CHILDREN, common_options_1.Options.CAPABILITIES])
        ];
        return res;
    };
    WebDriverExtension.prototype.gc = function () { throw new exceptions_1.BaseException('NYI'); };
    WebDriverExtension.prototype.timeBegin = function (name) { throw new exceptions_1.BaseException('NYI'); };
    WebDriverExtension.prototype.timeEnd = function (name, restartName) { throw new exceptions_1.BaseException('NYI'); };
    /**
     * Format:
     * - cat: category of the event
     * - name: event name: 'script', 'gc', 'render', ...
     * - ph: phase: 'B' (begin), 'E' (end), 'b' (nestable start), 'e' (nestable end), 'X' (Complete
     *event)
     * - ts: timestamp in ms, e.g. 12345
     * - pid: process id
     * - args: arguments, e.g. {heapSize: 1234}
     *
     * Based on [Chrome Trace Event
     *Format](https://docs.google.com/document/d/1CvAClvFfyA5R-PhYUmn5OOQtYMH4h6I0nSsKchNAySU/edit)
     **/
    WebDriverExtension.prototype.readPerfLog = function () { throw new exceptions_1.BaseException('NYI'); };
    WebDriverExtension.prototype.perfLogFeatures = function () { throw new exceptions_1.BaseException('NYI'); };
    WebDriverExtension.prototype.supports = function (capabilities) { return true; };
    return WebDriverExtension;
})();
exports.WebDriverExtension = WebDriverExtension;
var PerfLogFeatures = (function () {
    function PerfLogFeatures(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.render, render = _c === void 0 ? false : _c, _d = _b.gc, gc = _d === void 0 ? false : _d, _e = _b.frameCapture, frameCapture = _e === void 0 ? false : _e, _f = _b.userTiming, userTiming = _f === void 0 ? false : _f;
        this.render = render;
        this.gc = gc;
        this.frameCapture = frameCapture;
        this.userTiming = userTiming;
    }
    return PerfLogFeatures;
})();
exports.PerfLogFeatures = PerfLogFeatures;
var _CHILDREN = new di_1.OpaqueToken('WebDriverExtension.children');
},{"./common_options":25,"angular2/src/core/di":1,"angular2/src/facade/exceptions":18,"angular2/src/facade/lang":19}],43:[function(require,module,exports){
'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var di_1 = require('angular2/src/core/di');
var collection_1 = require('angular2/src/facade/collection');
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var web_driver_extension_1 = require('../web_driver_extension');
var web_driver_adapter_1 = require('../web_driver_adapter');
var common_options_1 = require('../common_options');
/**
 * Set the following 'traceCategories' to collect metrics in Chrome:
 * 'v8,blink.console,disabled-by-default-devtools.timeline,devtools.timeline'
 *
 * In order to collect the frame rate related metrics, add 'benchmark'
 * to the list above.
 */
var ChromeDriverExtension = (function (_super) {
    __extends(ChromeDriverExtension, _super);
    function ChromeDriverExtension(_driver, userAgent) {
        _super.call(this);
        this._driver = _driver;
        this._majorChromeVersion = this._parseChromeVersion(userAgent);
    }
    Object.defineProperty(ChromeDriverExtension, "BINDINGS", {
        // TODO(tbosch): use static values when our transpiler supports them
        get: function () { return _PROVIDERS; },
        enumerable: true,
        configurable: true
    });
    ChromeDriverExtension.prototype._parseChromeVersion = function (userAgent) {
        if (lang_1.isBlank(userAgent)) {
            return -1;
        }
        var v = lang_1.StringWrapper.split(userAgent, /Chrom(e|ium)\//g)[2];
        if (lang_1.isBlank(v)) {
            return -1;
        }
        v = v.split('.')[0];
        if (lang_1.isBlank(v)) {
            return -1;
        }
        return lang_1.NumberWrapper.parseInt(v, 10);
    };
    ChromeDriverExtension.prototype.gc = function () { return this._driver.executeScript('window.gc()'); };
    ChromeDriverExtension.prototype.timeBegin = function (name) {
        return this._driver.executeScript("console.time('" + name + "');");
    };
    ChromeDriverExtension.prototype.timeEnd = function (name, restartName) {
        if (restartName === void 0) { restartName = null; }
        var script = "console.timeEnd('" + name + "');";
        if (lang_1.isPresent(restartName)) {
            script += "console.time('" + restartName + "');";
        }
        return this._driver.executeScript(script);
    };
    // See [Chrome Trace Event
    // Format](https://docs.google.com/document/d/1CvAClvFfyA5R-PhYUmn5OOQtYMH4h6I0nSsKchNAySU/edit)
    ChromeDriverExtension.prototype.readPerfLog = function () {
        var _this = this;
        // TODO(tbosch): Chromedriver bug https://code.google.com/p/chromedriver/issues/detail?id=1098
        // Need to execute at least one command so that the browser logs can be read out!
        return this._driver.executeScript('1+1')
            .then(function (_) { return _this._driver.logs('performance'); })
            .then(function (entries) {
            var events = [];
            entries.forEach(function (entry) {
                var message = lang_1.Json.parse(entry['message'])['message'];
                if (lang_1.StringWrapper.equals(message['method'], 'Tracing.dataCollected')) {
                    events.push(message['params']);
                }
                if (lang_1.StringWrapper.equals(message['method'], 'Tracing.bufferUsage')) {
                    throw new exceptions_1.BaseException('The DevTools trace buffer filled during the test!');
                }
            });
            return _this._convertPerfRecordsToEvents(events);
        });
    };
    ChromeDriverExtension.prototype._convertPerfRecordsToEvents = function (chromeEvents, normalizedEvents) {
        var _this = this;
        if (normalizedEvents === void 0) { normalizedEvents = null; }
        if (lang_1.isBlank(normalizedEvents)) {
            normalizedEvents = [];
        }
        var majorGCPids = {};
        chromeEvents.forEach(function (event) {
            var categories = _this._parseCategories(event['cat']);
            var name = event['name'];
            if (_this._isEvent(categories, name, ['blink.console'])) {
                normalizedEvents.push(normalizeEvent(event, { 'name': name }));
            }
            else if (_this._isEvent(categories, name, ['benchmark'], 'BenchmarkInstrumentation::ImplThreadRenderingStats')) {
                // TODO(goderbauer): Instead of BenchmarkInstrumentation::ImplThreadRenderingStats the
                // following events should be used (if available) for more accurate measurments:
                //   1st choice: vsync_before - ground truth on Android
                //   2nd choice: BenchmarkInstrumentation::DisplayRenderingStats - available on systems with
                //               new surfaces framework (not broadly enabled yet)
                //   3rd choice: BenchmarkInstrumentation::ImplThreadRenderingStats - fallback event that is
                //               always available if something is rendered
                var frameCount = event['args']['data']['frame_count'];
                if (frameCount > 1) {
                    throw new exceptions_1.BaseException('multi-frame render stats not supported');
                }
                if (frameCount == 1) {
                    normalizedEvents.push(normalizeEvent(event, { 'name': 'frame' }));
                }
            }
            else if (_this._isEvent(categories, name, ['disabled-by-default-devtools.timeline'], 'Rasterize') ||
                _this._isEvent(categories, name, ['disabled-by-default-devtools.timeline'], 'CompositeLayers')) {
                normalizedEvents.push(normalizeEvent(event, { 'name': 'render' }));
            }
            else if (_this._majorChromeVersion < 45) {
                var normalizedEvent = _this._processAsPreChrome45Event(event, categories, majorGCPids);
                if (normalizedEvent != null)
                    normalizedEvents.push(normalizedEvent);
            }
            else {
                var normalizedEvent = _this._processAsPostChrome44Event(event, categories);
                if (normalizedEvent != null)
                    normalizedEvents.push(normalizedEvent);
            }
        });
        return normalizedEvents;
    };
    ChromeDriverExtension.prototype._processAsPreChrome45Event = function (event, categories, majorGCPids) {
        var name = event['name'];
        var args = event['args'];
        var pid = event['pid'];
        var ph = event['ph'];
        if (this._isEvent(categories, name, ['disabled-by-default-devtools.timeline'], 'FunctionCall') &&
            (lang_1.isBlank(args) || lang_1.isBlank(args['data']) ||
                !lang_1.StringWrapper.equals(args['data']['scriptName'], 'InjectedScript'))) {
            return normalizeEvent(event, { 'name': 'script' });
        }
        else if (this._isEvent(categories, name, ['disabled-by-default-devtools.timeline'], 'RecalculateStyles') ||
            this._isEvent(categories, name, ['disabled-by-default-devtools.timeline'], 'Layout') ||
            this._isEvent(categories, name, ['disabled-by-default-devtools.timeline'], 'UpdateLayerTree') ||
            this._isEvent(categories, name, ['disabled-by-default-devtools.timeline'], 'Paint')) {
            return normalizeEvent(event, { 'name': 'render' });
        }
        else if (this._isEvent(categories, name, ['disabled-by-default-devtools.timeline'], 'GCEvent')) {
            var normArgs = {
                'usedHeapSize': lang_1.isPresent(args['usedHeapSizeAfter']) ? args['usedHeapSizeAfter'] :
                    args['usedHeapSizeBefore']
            };
            if (lang_1.StringWrapper.equals(ph, 'E')) {
                normArgs['majorGc'] = lang_1.isPresent(majorGCPids[pid]) && majorGCPids[pid];
            }
            majorGCPids[pid] = false;
            return normalizeEvent(event, { 'name': 'gc', 'args': normArgs });
        }
        else if (this._isEvent(categories, name, ['v8'], 'majorGC') &&
            lang_1.StringWrapper.equals(ph, 'B')) {
            majorGCPids[pid] = true;
        }
        return null; // nothing useful in this event
    };
    ChromeDriverExtension.prototype._processAsPostChrome44Event = function (event, categories) {
        var name = event['name'];
        var args = event['args'];
        if (this._isEvent(categories, name, ['devtools.timeline', 'v8'], 'MajorGC')) {
            var normArgs = {
                'majorGc': true,
                'usedHeapSize': lang_1.isPresent(args['usedHeapSizeAfter']) ? args['usedHeapSizeAfter'] :
                    args['usedHeapSizeBefore']
            };
            return normalizeEvent(event, { 'name': 'gc', 'args': normArgs });
        }
        else if (this._isEvent(categories, name, ['devtools.timeline', 'v8'], 'MinorGC')) {
            var normArgs = {
                'majorGc': false,
                'usedHeapSize': lang_1.isPresent(args['usedHeapSizeAfter']) ? args['usedHeapSizeAfter'] :
                    args['usedHeapSizeBefore']
            };
            return normalizeEvent(event, { 'name': 'gc', 'args': normArgs });
        }
        else if (this._isEvent(categories, name, ['devtools.timeline', 'v8'], 'FunctionCall') &&
            (lang_1.isBlank(args) || lang_1.isBlank(args['data']) ||
                (!lang_1.StringWrapper.equals(args['data']['scriptName'], 'InjectedScript') &&
                    !lang_1.StringWrapper.equals(args['data']['scriptName'], '')))) {
            return normalizeEvent(event, { 'name': 'script' });
        }
        else if (this._isEvent(categories, name, ['devtools.timeline', 'blink'], 'UpdateLayoutTree')) {
            return normalizeEvent(event, { 'name': 'render' });
        }
        else if (this._isEvent(categories, name, ['devtools.timeline'], 'UpdateLayerTree') ||
            this._isEvent(categories, name, ['devtools.timeline'], 'Layout') ||
            this._isEvent(categories, name, ['devtools.timeline'], 'Paint')) {
            return normalizeEvent(event, { 'name': 'render' });
        }
        else if (this._isEvent(categories, name, ['devtools.timeline'], 'ResourceReceivedData')) {
            var normArgs_1 = { 'encodedDataLength': args['data']['encodedDataLength'] };
            return normalizeEvent(event, { 'name': 'receivedData', 'args': normArgs_1 });
        }
        else if (this._isEvent(categories, name, ['devtools.timeline'], 'ResourceSendRequest')) {
            var data_1 = args['data'];
            var normArgs_2 = { 'url': data_1['url'], 'method': data_1['requestMethod'] };
            return normalizeEvent(event, { 'name': 'sendRequest', 'args': normArgs_2 });
        }
        else if (this._isEvent(categories, name, ['blink.user_timing'], 'navigationStart')) {
            return normalizeEvent(event, { 'name': name });
        }
        return null; // nothing useful in this event
    };
    ChromeDriverExtension.prototype._parseCategories = function (categories) { return categories.split(','); };
    ChromeDriverExtension.prototype._isEvent = function (eventCategories, eventName, expectedCategories, expectedName) {
        if (expectedName === void 0) { expectedName = null; }
        var hasCategories = expectedCategories.reduce(function (value, cat) { return value && collection_1.ListWrapper.contains(eventCategories, cat); }, true);
        return lang_1.isBlank(expectedName) ? hasCategories :
            hasCategories && lang_1.StringWrapper.equals(eventName, expectedName);
    };
    ChromeDriverExtension.prototype.perfLogFeatures = function () {
        return new web_driver_extension_1.PerfLogFeatures({ render: true, gc: true, frameCapture: true, userTiming: true });
    };
    ChromeDriverExtension.prototype.supports = function (capabilities) {
        return this._majorChromeVersion != -1 &&
            lang_1.StringWrapper.equals(capabilities['browserName'].toLowerCase(), 'chrome');
    };
    return ChromeDriverExtension;
})(web_driver_extension_1.WebDriverExtension);
exports.ChromeDriverExtension = ChromeDriverExtension;
function normalizeEvent(chromeEvent, data) {
    var ph = chromeEvent['ph'];
    if (lang_1.StringWrapper.equals(ph, 'S')) {
        ph = 'b';
    }
    else if (lang_1.StringWrapper.equals(ph, 'F')) {
        ph = 'e';
    }
    var result = { 'pid': chromeEvent['pid'], 'ph': ph, 'cat': 'timeline', 'ts': chromeEvent['ts'] / 1000 };
    if (chromeEvent['ph'] === 'X') {
        var dur = chromeEvent['dur'];
        if (lang_1.isBlank(dur)) {
            dur = chromeEvent['tdur'];
        }
        result['dur'] = lang_1.isBlank(dur) ? 0.0 : dur / 1000;
    }
    collection_1.StringMapWrapper.forEach(data, function (value, prop) { result[prop] = value; });
    return result;
}
var _PROVIDERS = [
    di_1.bind(ChromeDriverExtension)
        .toFactory(function (driver, userAgent) { return new ChromeDriverExtension(driver, userAgent); }, [web_driver_adapter_1.WebDriverAdapter, common_options_1.Options.USER_AGENT])
];
},{"../common_options":25,"../web_driver_adapter":41,"../web_driver_extension":42,"angular2/src/core/di":1,"angular2/src/facade/collection":16,"angular2/src/facade/exceptions":18,"angular2/src/facade/lang":19}],44:[function(require,module,exports){
'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var di_1 = require('angular2/src/core/di');
var lang_1 = require('angular2/src/facade/lang');
var web_driver_extension_1 = require('../web_driver_extension');
var web_driver_adapter_1 = require('../web_driver_adapter');
var FirefoxDriverExtension = (function (_super) {
    __extends(FirefoxDriverExtension, _super);
    function FirefoxDriverExtension(_driver) {
        _super.call(this);
        this._driver = _driver;
        this._profilerStarted = false;
    }
    Object.defineProperty(FirefoxDriverExtension, "BINDINGS", {
        get: function () { return _PROVIDERS; },
        enumerable: true,
        configurable: true
    });
    FirefoxDriverExtension.prototype.gc = function () { return this._driver.executeScript('window.forceGC()'); };
    FirefoxDriverExtension.prototype.timeBegin = function (name) {
        if (!this._profilerStarted) {
            this._profilerStarted = true;
            this._driver.executeScript('window.startProfiler();');
        }
        return this._driver.executeScript('window.markStart("' + name + '");');
    };
    FirefoxDriverExtension.prototype.timeEnd = function (name, restartName) {
        if (restartName === void 0) { restartName = null; }
        var script = 'window.markEnd("' + name + '");';
        if (lang_1.isPresent(restartName)) {
            script += 'window.markStart("' + restartName + '");';
        }
        return this._driver.executeScript(script);
    };
    FirefoxDriverExtension.prototype.readPerfLog = function () {
        return this._driver.executeAsyncScript('var cb = arguments[0]; window.getProfile(cb);');
    };
    FirefoxDriverExtension.prototype.perfLogFeatures = function () { return new web_driver_extension_1.PerfLogFeatures({ render: true, gc: true }); };
    FirefoxDriverExtension.prototype.supports = function (capabilities) {
        return lang_1.StringWrapper.equals(capabilities['browserName'].toLowerCase(), 'firefox');
    };
    return FirefoxDriverExtension;
})(web_driver_extension_1.WebDriverExtension);
exports.FirefoxDriverExtension = FirefoxDriverExtension;
var _PROVIDERS = [
    di_1.bind(FirefoxDriverExtension)
        .toFactory(function (driver) { return new FirefoxDriverExtension(driver); }, [web_driver_adapter_1.WebDriverAdapter])
];
},{"../web_driver_adapter":41,"../web_driver_extension":42,"angular2/src/core/di":1,"angular2/src/facade/lang":19}],45:[function(require,module,exports){
'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var di_1 = require('angular2/src/core/di');
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var web_driver_extension_1 = require('../web_driver_extension');
var web_driver_adapter_1 = require('../web_driver_adapter');
var IOsDriverExtension = (function (_super) {
    __extends(IOsDriverExtension, _super);
    function IOsDriverExtension(_driver) {
        _super.call(this);
        this._driver = _driver;
    }
    Object.defineProperty(IOsDriverExtension, "BINDINGS", {
        // TODO(tbosch): use static values when our transpiler supports them
        get: function () { return _PROVIDERS; },
        enumerable: true,
        configurable: true
    });
    IOsDriverExtension.prototype.gc = function () { throw new exceptions_1.BaseException('Force GC is not supported on iOS'); };
    IOsDriverExtension.prototype.timeBegin = function (name) {
        return this._driver.executeScript("console.time('" + name + "');");
    };
    IOsDriverExtension.prototype.timeEnd = function (name, restartName) {
        if (restartName === void 0) { restartName = null; }
        var script = "console.timeEnd('" + name + "');";
        if (lang_1.isPresent(restartName)) {
            script += "console.time('" + restartName + "');";
        }
        return this._driver.executeScript(script);
    };
    // See https://github.com/WebKit/webkit/tree/master/Source/WebInspectorUI/Versions
    IOsDriverExtension.prototype.readPerfLog = function () {
        var _this = this;
        // TODO(tbosch): Bug in IOsDriver: Need to execute at least one command
        // so that the browser logs can be read out!
        return this._driver.executeScript('1+1')
            .then(function (_) { return _this._driver.logs('performance'); })
            .then(function (entries) {
            var records = [];
            entries.forEach(function (entry) {
                var message = lang_1.Json.parse(entry['message'])['message'];
                if (lang_1.StringWrapper.equals(message['method'], 'Timeline.eventRecorded')) {
                    records.push(message['params']['record']);
                }
            });
            return _this._convertPerfRecordsToEvents(records);
        });
    };
    IOsDriverExtension.prototype._convertPerfRecordsToEvents = function (records, events) {
        var _this = this;
        if (events === void 0) { events = null; }
        if (lang_1.isBlank(events)) {
            events = [];
        }
        records.forEach(function (record) {
            var endEvent = null;
            var type = record['type'];
            var data = record['data'];
            var startTime = record['startTime'];
            var endTime = record['endTime'];
            if (lang_1.StringWrapper.equals(type, 'FunctionCall') &&
                (lang_1.isBlank(data) || !lang_1.StringWrapper.equals(data['scriptName'], 'InjectedScript'))) {
                events.push(createStartEvent('script', startTime));
                endEvent = createEndEvent('script', endTime);
            }
            else if (lang_1.StringWrapper.equals(type, 'Time')) {
                events.push(createMarkStartEvent(data['message'], startTime));
            }
            else if (lang_1.StringWrapper.equals(type, 'TimeEnd')) {
                events.push(createMarkEndEvent(data['message'], startTime));
            }
            else if (lang_1.StringWrapper.equals(type, 'RecalculateStyles') ||
                lang_1.StringWrapper.equals(type, 'Layout') ||
                lang_1.StringWrapper.equals(type, 'UpdateLayerTree') ||
                lang_1.StringWrapper.equals(type, 'Paint') || lang_1.StringWrapper.equals(type, 'Rasterize') ||
                lang_1.StringWrapper.equals(type, 'CompositeLayers')) {
                events.push(createStartEvent('render', startTime));
                endEvent = createEndEvent('render', endTime);
            }
            // Note: ios used to support GCEvent up until iOS 6 :-(
            if (lang_1.isPresent(record['children'])) {
                _this._convertPerfRecordsToEvents(record['children'], events);
            }
            if (lang_1.isPresent(endEvent)) {
                events.push(endEvent);
            }
        });
        return events;
    };
    IOsDriverExtension.prototype.perfLogFeatures = function () { return new web_driver_extension_1.PerfLogFeatures({ render: true }); };
    IOsDriverExtension.prototype.supports = function (capabilities) {
        return lang_1.StringWrapper.equals(capabilities['browserName'].toLowerCase(), 'safari');
    };
    return IOsDriverExtension;
})(web_driver_extension_1.WebDriverExtension);
exports.IOsDriverExtension = IOsDriverExtension;
function createEvent(ph, name, time, args) {
    if (args === void 0) { args = null; }
    var result = {
        'cat': 'timeline',
        'name': name,
        'ts': time,
        'ph': ph,
        // The ios protocol does not support the notions of multiple processes in
        // the perflog...
        'pid': 'pid0'
    };
    if (lang_1.isPresent(args)) {
        result['args'] = args;
    }
    return result;
}
function createStartEvent(name, time, args) {
    if (args === void 0) { args = null; }
    return createEvent('B', name, time, args);
}
function createEndEvent(name, time, args) {
    if (args === void 0) { args = null; }
    return createEvent('E', name, time, args);
}
function createMarkStartEvent(name, time) {
    return createEvent('b', name, time);
}
function createMarkEndEvent(name, time) {
    return createEvent('e', name, time);
}
var _PROVIDERS = [
    di_1.bind(IOsDriverExtension)
        .toFactory(function (driver) { return new IOsDriverExtension(driver); }, [web_driver_adapter_1.WebDriverAdapter])
];
},{"../web_driver_adapter":41,"../web_driver_extension":42,"angular2/src/core/di":1,"angular2/src/facade/exceptions":18,"angular2/src/facade/lang":19}],46:[function(require,module,exports){
'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var async_1 = require('angular2/src/facade/async');
var di_1 = require('angular2/src/core/di');
var web_driver_adapter_1 = require('../web_driver_adapter');
var webdriver = require('selenium-webdriver');
/**
 * Adapter for the selenium-webdriver.
 */
var SeleniumWebDriverAdapter = (function (_super) {
    __extends(SeleniumWebDriverAdapter, _super);
    function SeleniumWebDriverAdapter(_driver) {
        _super.call(this);
        this._driver = _driver;
    }
    Object.defineProperty(SeleniumWebDriverAdapter, "PROTRACTOR_BINDINGS", {
        get: function () { return _PROTRACTOR_BINDINGS; },
        enumerable: true,
        configurable: true
    });
    SeleniumWebDriverAdapter.prototype._convertPromise = function (thenable) {
        var completer = async_1.PromiseWrapper.completer();
        thenable.then(
        // selenium-webdriver uses an own Node.js context,
        // so we need to convert data into objects of this context.
        // Previously needed for rtts_asserts.
        function (data) { return completer.resolve(convertToLocalProcess(data)); }, completer.reject);
        return completer.promise;
    };
    SeleniumWebDriverAdapter.prototype.waitFor = function (callback) {
        return this._convertPromise(this._driver.controlFlow().execute(callback));
    };
    SeleniumWebDriverAdapter.prototype.executeScript = function (script) {
        return this._convertPromise(this._driver.executeScript(script));
    };
    SeleniumWebDriverAdapter.prototype.executeAsyncScript = function (script) {
        return this._convertPromise(this._driver.executeAsyncScript(script));
    };
    SeleniumWebDriverAdapter.prototype.capabilities = function () {
        return this._convertPromise(this._driver.getCapabilities().then(function (capsObject) { return capsObject.serialize(); }));
    };
    SeleniumWebDriverAdapter.prototype.logs = function (type) {
        // Needed as selenium-webdriver does not forward
        // performance logs in the correct way via manage().logs
        return this._convertPromise(this._driver.schedule(new webdriver.Command(webdriver.CommandName.GET_LOG).setParameter('type', type), 'WebDriver.manage().logs().get(' + type + ')'));
    };
    return SeleniumWebDriverAdapter;
})(web_driver_adapter_1.WebDriverAdapter);
exports.SeleniumWebDriverAdapter = SeleniumWebDriverAdapter;
function convertToLocalProcess(data) {
    var serialized = JSON.stringify(data);
    if ('' + serialized === 'undefined') {
        return undefined;
    }
    return JSON.parse(serialized);
}
var _PROTRACTOR_BINDINGS = [
    di_1.bind(web_driver_adapter_1.WebDriverAdapter)
        .toFactory(function () { return new SeleniumWebDriverAdapter(global.browser); }, [])
];
},{"../web_driver_adapter":41,"angular2/src/core/di":1,"angular2/src/facade/async":14,"selenium-webdriver":undefined}],47:[function(require,module,exports){
"use strict";
var root_1 = require('./util/root');
var SymbolShim_1 = require('./util/SymbolShim');
var toSubscriber_1 = require('./util/toSubscriber');
var tryCatch_1 = require('./util/tryCatch');
var errorObject_1 = require('./util/errorObject');
/**
 * A representation of any set of values over any amount of time. This the most basic building block
 * of RxJS.
 *
 * @class Observable<T>
 */
var Observable = (function () {
    /**
     * @constructor
     * @param {Function} subscribe the function that is
     * called when the Observable is initially subscribed to. This function is given a Subscriber, to which new values
     * can be `next`ed, or an `error` method can be called to raise an error, or `complete` can be called to notify
     * of a successful completion.
     */
    function Observable(subscribe) {
        this._isScalar = false;
        if (subscribe) {
            this._subscribe = subscribe;
        }
    }
    /**
     * @method lift
     * @param {Operator} operator the operator defining the operation to take on the observable
     * @returns {Observable} a new observable with the Operator applied
     * @description creates a new Observable, with this Observable as the source, and the passed
     * operator defined as the new observable's operator.
     */
    Observable.prototype.lift = function (operator) {
        var observable = new Observable();
        observable.source = this;
        observable.operator = operator;
        return observable;
    };
    /**
     * @method subscribe
     * @param {PartialObserver|Function} observerOrNext (optional) either an observer defining all functions to be called,
     *  or the first of three possible handlers, which is the handler for each value emitted from the observable.
     * @param {Function} error (optional) a handler for a terminal event resulting from an error. If no error handler is provided,
     *  the error will be thrown as unhandled
     * @param {Function} complete (optional) a handler for a terminal event resulting from successful completion.
     * @returns {Subscription} a subscription reference to the registered handlers
     * @description registers handlers for handling emitted values, error and completions from the observable, and
     *  executes the observable's subscriber function, which will take action to set up the underlying data stream
     */
    Observable.prototype.subscribe = function (observerOrNext, error, complete) {
        var operator = this.operator;
        var subscriber = toSubscriber_1.toSubscriber(observerOrNext, error, complete);
        if (operator) {
            subscriber.add(this._subscribe(operator.call(subscriber)));
        }
        else {
            subscriber.add(this._subscribe(subscriber));
        }
        if (subscriber.syncErrorThrowable) {
            subscriber.syncErrorThrowable = false;
            if (subscriber.syncErrorThrown) {
                throw subscriber.syncErrorValue;
            }
        }
        return subscriber;
    };
    /**
     * @method forEach
     * @param {Function} next a handler for each value emitted by the observable
     * @param {any} [thisArg] a `this` context for the `next` handler function
     * @param {PromiseConstructor} [PromiseCtor] a constructor function used to instantiate the Promise
     * @returns {Promise} a promise that either resolves on observable completion or
     *  rejects with the handled error
     */
    Observable.prototype.forEach = function (next, thisArg, PromiseCtor) {
        if (!PromiseCtor) {
            if (root_1.root.Rx && root_1.root.Rx.config && root_1.root.Rx.config.Promise) {
                PromiseCtor = root_1.root.Rx.config.Promise;
            }
            else if (root_1.root.Promise) {
                PromiseCtor = root_1.root.Promise;
            }
        }
        if (!PromiseCtor) {
            throw new Error('no Promise impl found');
        }
        var source = this;
        return new PromiseCtor(function (resolve, reject) {
            source.subscribe(function (value) {
                var result = tryCatch_1.tryCatch(next).call(thisArg, value);
                if (result === errorObject_1.errorObject) {
                    reject(errorObject_1.errorObject.e);
                }
            }, reject, resolve);
        });
    };
    Observable.prototype._subscribe = function (subscriber) {
        return this.source.subscribe(subscriber);
    };
    /**
     * @method Symbol.observable
     * @returns {Observable} this instance of the observable
     * @description an interop point defined by the es7-observable spec https://github.com/zenparsing/es-observable
     */
    Observable.prototype[SymbolShim_1.SymbolShim.observable] = function () {
        return this;
    };
    // HACK: Since TypeScript inherits static properties too, we have to
    // fight against TypeScript here so Subject can have a different static create signature
    /**
     * @static
     * @method create
     * @param {Function} subscribe? the subscriber function to be passed to the Observable constructor
     * @returns {Observable} a new cold observable
     * @description creates a new cold Observable by calling the Observable constructor
     */
    Observable.create = function (subscribe) {
        return new Observable(subscribe);
    };
    return Observable;
}());
exports.Observable = Observable;

},{"./util/SymbolShim":57,"./util/errorObject":58,"./util/root":62,"./util/toSubscriber":64,"./util/tryCatch":65}],48:[function(require,module,exports){
"use strict";
exports.empty = {
    isUnsubscribed: true,
    next: function (value) { },
    error: function (err) { throw err; },
    complete: function () { }
};

},{}],49:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Observable_1 = require('./Observable');
var Subscriber_1 = require('./Subscriber');
var Subscription_1 = require('./Subscription');
var SubjectSubscription_1 = require('./subject/SubjectSubscription');
var rxSubscriber_1 = require('./symbol/rxSubscriber');
var throwError_1 = require('./util/throwError');
var ObjectUnsubscribedError_1 = require('./util/ObjectUnsubscribedError');
var Subject = (function (_super) {
    __extends(Subject, _super);
    function Subject(destination, source) {
        _super.call(this);
        this.destination = destination;
        this.source = source;
        this.observers = [];
        this.isUnsubscribed = false;
        this.isStopped = false;
        this.hasErrored = false;
        this.dispatching = false;
        this.hasCompleted = false;
    }
    Subject.prototype.lift = function (operator) {
        var subject = new Subject(this.destination || this, this);
        subject.operator = operator;
        return subject;
    };
    Subject.prototype.add = function (subscription) {
        Subscription_1.Subscription.prototype.add.call(this, subscription);
    };
    Subject.prototype.remove = function (subscription) {
        Subscription_1.Subscription.prototype.remove.call(this, subscription);
    };
    Subject.prototype.unsubscribe = function () {
        Subscription_1.Subscription.prototype.unsubscribe.call(this);
    };
    Subject.prototype._subscribe = function (subscriber) {
        if (this.source) {
            return this.source.subscribe(subscriber);
        }
        else {
            if (subscriber.isUnsubscribed) {
                return;
            }
            else if (this.hasErrored) {
                return subscriber.error(this.errorValue);
            }
            else if (this.hasCompleted) {
                return subscriber.complete();
            }
            this.throwIfUnsubscribed();
            var subscription = new SubjectSubscription_1.SubjectSubscription(this, subscriber);
            this.observers.push(subscriber);
            return subscription;
        }
    };
    Subject.prototype._unsubscribe = function () {
        this.source = null;
        this.isStopped = true;
        this.observers = null;
        this.destination = null;
    };
    Subject.prototype.next = function (value) {
        this.throwIfUnsubscribed();
        if (this.isStopped) {
            return;
        }
        this.dispatching = true;
        this._next(value);
        this.dispatching = false;
        if (this.hasErrored) {
            this._error(this.errorValue);
        }
        else if (this.hasCompleted) {
            this._complete();
        }
    };
    Subject.prototype.error = function (err) {
        this.throwIfUnsubscribed();
        if (this.isStopped) {
            return;
        }
        this.isStopped = true;
        this.hasErrored = true;
        this.errorValue = err;
        if (this.dispatching) {
            return;
        }
        this._error(err);
    };
    Subject.prototype.complete = function () {
        this.throwIfUnsubscribed();
        if (this.isStopped) {
            return;
        }
        this.isStopped = true;
        this.hasCompleted = true;
        if (this.dispatching) {
            return;
        }
        this._complete();
    };
    Subject.prototype.asObservable = function () {
        var observable = new SubjectObservable(this);
        return observable;
    };
    Subject.prototype._next = function (value) {
        if (this.destination) {
            this.destination.next(value);
        }
        else {
            this._finalNext(value);
        }
    };
    Subject.prototype._finalNext = function (value) {
        var index = -1;
        var observers = this.observers.slice(0);
        var len = observers.length;
        while (++index < len) {
            observers[index].next(value);
        }
    };
    Subject.prototype._error = function (err) {
        if (this.destination) {
            this.destination.error(err);
        }
        else {
            this._finalError(err);
        }
    };
    Subject.prototype._finalError = function (err) {
        var index = -1;
        var observers = this.observers;
        // optimization to block our SubjectSubscriptions from
        // splicing themselves out of the observers list one by one.
        this.observers = null;
        this.isUnsubscribed = true;
        if (observers) {
            var len = observers.length;
            while (++index < len) {
                observers[index].error(err);
            }
        }
        this.isUnsubscribed = false;
        this.unsubscribe();
    };
    Subject.prototype._complete = function () {
        if (this.destination) {
            this.destination.complete();
        }
        else {
            this._finalComplete();
        }
    };
    Subject.prototype._finalComplete = function () {
        var index = -1;
        var observers = this.observers;
        // optimization to block our SubjectSubscriptions from
        // splicing themselves out of the observers list one by one.
        this.observers = null;
        this.isUnsubscribed = true;
        if (observers) {
            var len = observers.length;
            while (++index < len) {
                observers[index].complete();
            }
        }
        this.isUnsubscribed = false;
        this.unsubscribe();
    };
    Subject.prototype.throwIfUnsubscribed = function () {
        if (this.isUnsubscribed) {
            throwError_1.throwError(new ObjectUnsubscribedError_1.ObjectUnsubscribedError());
        }
    };
    Subject.prototype[rxSubscriber_1.rxSubscriber] = function () {
        return new Subscriber_1.Subscriber(this);
    };
    Subject.create = function (destination, source) {
        return new Subject(destination, source);
    };
    return Subject;
}(Observable_1.Observable));
exports.Subject = Subject;
var SubjectObservable = (function (_super) {
    __extends(SubjectObservable, _super);
    function SubjectObservable(source) {
        _super.call(this);
        this.source = source;
    }
    return SubjectObservable;
}(Observable_1.Observable));

},{"./Observable":47,"./Subscriber":50,"./Subscription":51,"./subject/SubjectSubscription":54,"./symbol/rxSubscriber":55,"./util/ObjectUnsubscribedError":56,"./util/throwError":63}],50:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var isFunction_1 = require('./util/isFunction');
var Subscription_1 = require('./Subscription');
var rxSubscriber_1 = require('./symbol/rxSubscriber');
var Observer_1 = require('./Observer');
var Subscriber = (function (_super) {
    __extends(Subscriber, _super);
    function Subscriber(destinationOrNext, error, complete) {
        _super.call(this);
        this.syncErrorValue = null;
        this.syncErrorThrown = false;
        this.syncErrorThrowable = false;
        this.isStopped = false;
        switch (arguments.length) {
            case 0:
                this.destination = Observer_1.empty;
                break;
            case 1:
                if (!destinationOrNext) {
                    this.destination = Observer_1.empty;
                    break;
                }
                if (typeof destinationOrNext === 'object') {
                    if (destinationOrNext instanceof Subscriber) {
                        this.destination = destinationOrNext;
                    }
                    else {
                        this.syncErrorThrowable = true;
                        this.destination = new SafeSubscriber(this, destinationOrNext);
                    }
                    break;
                }
            default:
                this.syncErrorThrowable = true;
                this.destination = new SafeSubscriber(this, destinationOrNext, error, complete);
                break;
        }
    }
    Subscriber.create = function (next, error, complete) {
        var subscriber = new Subscriber(next, error, complete);
        subscriber.syncErrorThrowable = false;
        return subscriber;
    };
    Subscriber.prototype.next = function (value) {
        if (!this.isStopped) {
            this._next(value);
        }
    };
    Subscriber.prototype.error = function (err) {
        if (!this.isStopped) {
            this.isStopped = true;
            this._error(err);
        }
    };
    Subscriber.prototype.complete = function () {
        if (!this.isStopped) {
            this.isStopped = true;
            this._complete();
        }
    };
    Subscriber.prototype.unsubscribe = function () {
        if (this.isUnsubscribed) {
            return;
        }
        this.isStopped = true;
        _super.prototype.unsubscribe.call(this);
    };
    Subscriber.prototype._next = function (value) {
        this.destination.next(value);
    };
    Subscriber.prototype._error = function (err) {
        this.destination.error(err);
        this.unsubscribe();
    };
    Subscriber.prototype._complete = function () {
        this.destination.complete();
        this.unsubscribe();
    };
    Subscriber.prototype[rxSubscriber_1.rxSubscriber] = function () {
        return this;
    };
    return Subscriber;
}(Subscription_1.Subscription));
exports.Subscriber = Subscriber;
var SafeSubscriber = (function (_super) {
    __extends(SafeSubscriber, _super);
    function SafeSubscriber(_parent, observerOrNext, error, complete) {
        _super.call(this);
        this._parent = _parent;
        var next;
        var context = this;
        if (isFunction_1.isFunction(observerOrNext)) {
            next = observerOrNext;
        }
        else if (observerOrNext) {
            context = observerOrNext;
            next = observerOrNext.next;
            error = observerOrNext.error;
            complete = observerOrNext.complete;
        }
        this._context = context;
        this._next = next;
        this._error = error;
        this._complete = complete;
    }
    SafeSubscriber.prototype.next = function (value) {
        if (!this.isStopped && this._next) {
            var _parent = this._parent;
            if (!_parent.syncErrorThrowable) {
                this.__tryOrUnsub(this._next, value);
            }
            else if (this.__tryOrSetError(_parent, this._next, value)) {
                this.unsubscribe();
            }
        }
    };
    SafeSubscriber.prototype.error = function (err) {
        if (!this.isStopped) {
            var _parent = this._parent;
            if (this._error) {
                if (!_parent.syncErrorThrowable) {
                    this.__tryOrUnsub(this._error, err);
                    this.unsubscribe();
                }
                else {
                    this.__tryOrSetError(_parent, this._error, err);
                    this.unsubscribe();
                }
            }
            else if (!_parent.syncErrorThrowable) {
                this.unsubscribe();
                throw err;
            }
            else {
                _parent.syncErrorValue = err;
                _parent.syncErrorThrown = true;
                this.unsubscribe();
            }
        }
    };
    SafeSubscriber.prototype.complete = function () {
        if (!this.isStopped) {
            var _parent = this._parent;
            if (this._complete) {
                if (!_parent.syncErrorThrowable) {
                    this.__tryOrUnsub(this._complete);
                    this.unsubscribe();
                }
                else {
                    this.__tryOrSetError(_parent, this._complete);
                    this.unsubscribe();
                }
            }
            else {
                this.unsubscribe();
            }
        }
    };
    SafeSubscriber.prototype.__tryOrUnsub = function (fn, value) {
        try {
            fn.call(this._context, value);
        }
        catch (err) {
            this.unsubscribe();
            throw err;
        }
    };
    SafeSubscriber.prototype.__tryOrSetError = function (parent, fn, value) {
        try {
            fn.call(this._context, value);
        }
        catch (err) {
            parent.syncErrorValue = err;
            parent.syncErrorThrown = true;
            return true;
        }
        return false;
    };
    SafeSubscriber.prototype._unsubscribe = function () {
        var _parent = this._parent;
        this._context = null;
        this._parent = null;
        _parent.unsubscribe();
    };
    return SafeSubscriber;
}(Subscriber));

},{"./Observer":48,"./Subscription":51,"./symbol/rxSubscriber":55,"./util/isFunction":60}],51:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var isArray_1 = require('./util/isArray');
var isObject_1 = require('./util/isObject');
var isFunction_1 = require('./util/isFunction');
var tryCatch_1 = require('./util/tryCatch');
var errorObject_1 = require('./util/errorObject');
var Subscription = (function () {
    function Subscription(_unsubscribe) {
        this.isUnsubscribed = false;
        if (_unsubscribe) {
            this._unsubscribe = _unsubscribe;
        }
    }
    Subscription.prototype.unsubscribe = function () {
        var hasErrors = false;
        var errors;
        if (this.isUnsubscribed) {
            return;
        }
        this.isUnsubscribed = true;
        var _a = this, _unsubscribe = _a._unsubscribe, _subscriptions = _a._subscriptions;
        this._subscriptions = null;
        if (isFunction_1.isFunction(_unsubscribe)) {
            var trial = tryCatch_1.tryCatch(_unsubscribe).call(this);
            if (trial === errorObject_1.errorObject) {
                hasErrors = true;
                (errors = errors || []).push(errorObject_1.errorObject.e);
            }
        }
        if (isArray_1.isArray(_subscriptions)) {
            var index = -1;
            var len = _subscriptions.length;
            while (++index < len) {
                var sub = _subscriptions[index];
                if (isObject_1.isObject(sub)) {
                    var trial = tryCatch_1.tryCatch(sub.unsubscribe).call(sub);
                    if (trial === errorObject_1.errorObject) {
                        hasErrors = true;
                        errors = errors || [];
                        var err = errorObject_1.errorObject.e;
                        if (err instanceof UnsubscriptionError) {
                            errors = errors.concat(err.errors);
                        }
                        else {
                            errors.push(err);
                        }
                    }
                }
            }
        }
        if (hasErrors) {
            throw new UnsubscriptionError(errors);
        }
    };
    Subscription.prototype.add = function (subscription) {
        // return early if:
        //  1. the subscription is null
        //  2. we're attempting to add our this
        //  3. we're attempting to add the static `empty` Subscription
        if (!subscription || (subscription === this) || (subscription === Subscription.EMPTY)) {
            return;
        }
        var sub = subscription;
        switch (typeof subscription) {
            case 'function':
                sub = new Subscription(subscription);
            case 'object':
                if (sub.isUnsubscribed || typeof sub.unsubscribe !== 'function') {
                    break;
                }
                else if (this.isUnsubscribed) {
                    sub.unsubscribe();
                }
                else {
                    (this._subscriptions || (this._subscriptions = [])).push(sub);
                }
                break;
            default:
                throw new Error('Unrecognized subscription ' + subscription + ' added to Subscription.');
        }
    };
    Subscription.prototype.remove = function (subscription) {
        // return early if:
        //  1. the subscription is null
        //  2. we're attempting to remove ourthis
        //  3. we're attempting to remove the static `empty` Subscription
        if (subscription == null || (subscription === this) || (subscription === Subscription.EMPTY)) {
            return;
        }
        var subscriptions = this._subscriptions;
        if (subscriptions) {
            var subscriptionIndex = subscriptions.indexOf(subscription);
            if (subscriptionIndex !== -1) {
                subscriptions.splice(subscriptionIndex, 1);
            }
        }
    };
    Subscription.EMPTY = (function (empty) {
        empty.isUnsubscribed = true;
        return empty;
    }(new Subscription()));
    return Subscription;
}());
exports.Subscription = Subscription;
var UnsubscriptionError = (function (_super) {
    __extends(UnsubscriptionError, _super);
    function UnsubscriptionError(errors) {
        _super.call(this, 'unsubscriptoin error(s)');
        this.errors = errors;
        this.name = 'UnsubscriptionError';
    }
    return UnsubscriptionError;
}(Error));
exports.UnsubscriptionError = UnsubscriptionError;

},{"./util/errorObject":58,"./util/isArray":59,"./util/isFunction":60,"./util/isObject":61,"./util/tryCatch":65}],52:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var root_1 = require('../util/root');
var Observable_1 = require('../Observable');
var PromiseObservable = (function (_super) {
    __extends(PromiseObservable, _super);
    function PromiseObservable(promise, scheduler) {
        if (scheduler === void 0) { scheduler = null; }
        _super.call(this);
        this.promise = promise;
        this.scheduler = scheduler;
    }
    PromiseObservable.create = function (promise, scheduler) {
        if (scheduler === void 0) { scheduler = null; }
        return new PromiseObservable(promise, scheduler);
    };
    PromiseObservable.prototype._subscribe = function (subscriber) {
        var _this = this;
        var promise = this.promise;
        var scheduler = this.scheduler;
        if (scheduler == null) {
            if (this._isScalar) {
                if (!subscriber.isUnsubscribed) {
                    subscriber.next(this.value);
                    subscriber.complete();
                }
            }
            else {
                promise.then(function (value) {
                    _this.value = value;
                    _this._isScalar = true;
                    if (!subscriber.isUnsubscribed) {
                        subscriber.next(value);
                        subscriber.complete();
                    }
                }, function (err) {
                    if (!subscriber.isUnsubscribed) {
                        subscriber.error(err);
                    }
                })
                    .then(null, function (err) {
                    // escape the promise trap, throw unhandled errors
                    root_1.root.setTimeout(function () { throw err; });
                });
            }
        }
        else {
            if (this._isScalar) {
                if (!subscriber.isUnsubscribed) {
                    return scheduler.schedule(dispatchNext, 0, { value: this.value, subscriber: subscriber });
                }
            }
            else {
                promise.then(function (value) {
                    _this.value = value;
                    _this._isScalar = true;
                    if (!subscriber.isUnsubscribed) {
                        subscriber.add(scheduler.schedule(dispatchNext, 0, { value: value, subscriber: subscriber }));
                    }
                }, function (err) {
                    if (!subscriber.isUnsubscribed) {
                        subscriber.add(scheduler.schedule(dispatchError, 0, { err: err, subscriber: subscriber }));
                    }
                })
                    .then(null, function (err) {
                    // escape the promise trap, throw unhandled errors
                    root_1.root.setTimeout(function () { throw err; });
                });
            }
        }
    };
    return PromiseObservable;
}(Observable_1.Observable));
exports.PromiseObservable = PromiseObservable;
function dispatchNext(_a) {
    var value = _a.value, subscriber = _a.subscriber;
    if (!subscriber.isUnsubscribed) {
        subscriber.next(value);
        subscriber.complete();
    }
}
function dispatchError(_a) {
    var err = _a.err, subscriber = _a.subscriber;
    if (!subscriber.isUnsubscribed) {
        subscriber.error(err);
    }
}

},{"../Observable":47,"../util/root":62}],53:[function(require,module,exports){
"use strict";
var root_1 = require('../util/root');
function toPromise(PromiseCtor) {
    var _this = this;
    if (!PromiseCtor) {
        if (root_1.root.Rx && root_1.root.Rx.config && root_1.root.Rx.config.Promise) {
            PromiseCtor = root_1.root.Rx.config.Promise;
        }
        else if (root_1.root.Promise) {
            PromiseCtor = root_1.root.Promise;
        }
    }
    if (!PromiseCtor) {
        throw new Error('no Promise impl found');
    }
    return new PromiseCtor(function (resolve, reject) {
        var value;
        _this.subscribe(function (x) { return value = x; }, function (err) { return reject(err); }, function () { return resolve(value); });
    });
}
exports.toPromise = toPromise;

},{"../util/root":62}],54:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Subscription_1 = require('../Subscription');
var SubjectSubscription = (function (_super) {
    __extends(SubjectSubscription, _super);
    function SubjectSubscription(subject, observer) {
        _super.call(this);
        this.subject = subject;
        this.observer = observer;
        this.isUnsubscribed = false;
    }
    SubjectSubscription.prototype.unsubscribe = function () {
        if (this.isUnsubscribed) {
            return;
        }
        this.isUnsubscribed = true;
        var subject = this.subject;
        var observers = subject.observers;
        this.subject = null;
        if (!observers || observers.length === 0 || subject.isUnsubscribed) {
            return;
        }
        var subscriberIndex = observers.indexOf(this.observer);
        if (subscriberIndex !== -1) {
            observers.splice(subscriberIndex, 1);
        }
    };
    return SubjectSubscription;
}(Subscription_1.Subscription));
exports.SubjectSubscription = SubjectSubscription;

},{"../Subscription":51}],55:[function(require,module,exports){
"use strict";
var SymbolShim_1 = require('../util/SymbolShim');
/**
 * rxSubscriber symbol is a symbol for retreiving an "Rx safe" Observer from an object
 * "Rx safety" can be defined as an object that has all of the traits of an Rx Subscriber,
 * including the ability to add and remove subscriptions to the subscription chain and
 * guarantees involving event triggering (can't "next" after unsubscription, etc).
 */
exports.rxSubscriber = SymbolShim_1.SymbolShim.for('rxSubscriber');

},{"../util/SymbolShim":57}],56:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * an error thrown when an action is invalid because the object
 * has been unsubscribed
 */
var ObjectUnsubscribedError = (function (_super) {
    __extends(ObjectUnsubscribedError, _super);
    function ObjectUnsubscribedError() {
        _super.call(this, 'object unsubscribed');
        this.name = 'ObjectUnsubscribedError';
    }
    return ObjectUnsubscribedError;
}(Error));
exports.ObjectUnsubscribedError = ObjectUnsubscribedError;

},{}],57:[function(require,module,exports){
"use strict";
var root_1 = require('./root');
function polyfillSymbol(root) {
    var Symbol = ensureSymbol(root);
    ensureIterator(Symbol, root);
    ensureObservable(Symbol);
    ensureFor(Symbol);
    return Symbol;
}
exports.polyfillSymbol = polyfillSymbol;
function ensureFor(Symbol) {
    if (!Symbol.for) {
        Symbol.for = symbolForPolyfill;
    }
}
exports.ensureFor = ensureFor;
var id = 0;
function ensureSymbol(root) {
    if (!root.Symbol) {
        root.Symbol = function symbolFuncPolyfill(description) {
            return "@@Symbol(" + description + "):" + id++;
        };
    }
    return root.Symbol;
}
exports.ensureSymbol = ensureSymbol;
function symbolForPolyfill(key) {
    return '@@' + key;
}
exports.symbolForPolyfill = symbolForPolyfill;
function ensureIterator(Symbol, root) {
    if (!Symbol.iterator) {
        if (typeof Symbol.for === 'function') {
            Symbol.iterator = Symbol.for('iterator');
        }
        else if (root.Set && typeof new root.Set()['@@iterator'] === 'function') {
            // Bug for mozilla version
            Symbol.iterator = '@@iterator';
        }
        else if (root.Map) {
            // es6-shim specific logic
            var keys = Object.getOwnPropertyNames(root.Map.prototype);
            for (var i = 0; i < keys.length; ++i) {
                var key = keys[i];
                if (key !== 'entries' && key !== 'size' && root.Map.prototype[key] === root.Map.prototype['entries']) {
                    Symbol.iterator = key;
                    break;
                }
            }
        }
        else {
            Symbol.iterator = '@@iterator';
        }
    }
}
exports.ensureIterator = ensureIterator;
function ensureObservable(Symbol) {
    if (!Symbol.observable) {
        if (typeof Symbol.for === 'function') {
            Symbol.observable = Symbol.for('observable');
        }
        else {
            Symbol.observable = '@@observable';
        }
    }
}
exports.ensureObservable = ensureObservable;
exports.SymbolShim = polyfillSymbol(root_1.root);

},{"./root":62}],58:[function(require,module,exports){
"use strict";
// typeof any so that it we don't have to cast when comparing a result to the error object
exports.errorObject = { e: {} };

},{}],59:[function(require,module,exports){
"use strict";
exports.isArray = Array.isArray || (function (x) { return x && typeof x.length === 'number'; });

},{}],60:[function(require,module,exports){
"use strict";
function isFunction(x) {
    return typeof x === 'function';
}
exports.isFunction = isFunction;

},{}],61:[function(require,module,exports){
"use strict";
function isObject(x) {
    return x != null && typeof x === 'object';
}
exports.isObject = isObject;

},{}],62:[function(require,module,exports){
"use strict";
var objectTypes = {
    'boolean': false,
    'function': true,
    'object': true,
    'number': false,
    'string': false,
    'undefined': false
};
exports.root = (objectTypes[typeof self] && self) || (objectTypes[typeof window] && window);
/* tslint:disable:no-unused-variable */
var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;
var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;
var freeGlobal = objectTypes[typeof global] && global;
if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {
    exports.root = freeGlobal;
}

},{}],63:[function(require,module,exports){
"use strict";
function throwError(e) { throw e; }
exports.throwError = throwError;

},{}],64:[function(require,module,exports){
"use strict";
var Subscriber_1 = require('../Subscriber');
var rxSubscriber_1 = require('../symbol/rxSubscriber');
function toSubscriber(nextOrObserver, error, complete) {
    if (nextOrObserver && typeof nextOrObserver === 'object') {
        if (nextOrObserver instanceof Subscriber_1.Subscriber) {
            return nextOrObserver;
        }
        else if (typeof nextOrObserver[rxSubscriber_1.rxSubscriber] === 'function') {
            return nextOrObserver[rxSubscriber_1.rxSubscriber]();
        }
    }
    return new Subscriber_1.Subscriber(nextOrObserver, error, complete);
}
exports.toSubscriber = toSubscriber;

},{"../Subscriber":50,"../symbol/rxSubscriber":55}],65:[function(require,module,exports){
"use strict";
var errorObject_1 = require('./errorObject');
var tryCatchTarget;
function tryCatcher() {
    try {
        return tryCatchTarget.apply(this, arguments);
    }
    catch (e) {
        errorObject_1.errorObject.e = e;
        return errorObject_1.errorObject;
    }
}
function tryCatch(fn) {
    tryCatchTarget = fn;
    return tryCatcher;
}
exports.tryCatch = tryCatch;
;

},{"./errorObject":58}]},{},[24]);
module.exports = global.__benchpressExports;
