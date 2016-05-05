/**
 * @license AngularJS v$$ANGULAR_VERSION$$
 * (c) 2010-2016 Google, Inc. https://angular.io/
 * License: MIT
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/platform-browser'), require('@angular/compiler')) :
        typeof define === 'function' && define.amd ? define(['exports', '@angular/platform-browser', '@angular/compiler'], factory) :
            (factory((global.ng = global.ng || {}, global.ng.platformServer = global.ng.platformServer || {}), global.ng.platformBrowser, global.ng.compiler));
}(this, function (exports, _angular_platformBrowser, _angular_compiler) {
    'use strict';
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
    // Need to declare a new variable for global here since TypeScript
    // exports the original value of the symbol.
    var _global = globalScope;
    var Date = _global.Date;
    // TODO: remove calls to assert in production environment
    // Note: Can't just export this and import in in other files
    // as `assert` is a reserved keyword in Dart
    _global.assert = function assert(condition) {
        // TODO: to be fixed properly via #2830, noop for now
    };
    function isPresent(obj) {
        return obj !== undefined && obj !== null;
    }
    function isBlank(obj) {
        return obj === undefined || obj === null;
    }
    function isArray(obj) {
        return Array.isArray(obj);
    }
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
            return new Date(year, month - 1, day, hour, minutes, seconds, milliseconds);
        };
        DateWrapper.fromISOString = function (str) { return new Date(str); };
        DateWrapper.fromMillis = function (ms) { return new Date(ms); };
        DateWrapper.toMillis = function (date) { return date.getTime(); };
        DateWrapper.now = function () { return new Date(); };
        DateWrapper.toJson = function (date) { return date.toJSON(); };
        return DateWrapper;
    }());
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
    var Map$1 = _global.Map;
    var Set = _global.Set;
    // Safari and Internet Explorer do not support the iterable parameter to the
    // Map constructor.  We work around that by manually adding the items.
    var createMapFromPairs = (function () {
        try {
            if (new Map$1([[1, 2]]).size === 1) {
                return function createMapFromPairs(pairs) { return new Map$1(pairs); };
            }
        }
        catch (e) {
        }
        return function createMapAndPopulateFromPairs(pairs) {
            var map = new Map$1();
            for (var i = 0; i < pairs.length; i++) {
                var pair = pairs[i];
                map.set(pair[0], pair[1]);
            }
            return map;
        };
    })();
    var createMapFromMap = (function () {
        try {
            if (new Map$1(new Map$1())) {
                return function createMapFromMap(m) { return new Map$1(m); };
            }
        }
        catch (e) {
        }
        return function createMapAndPopulateFromMap(m) {
            var map = new Map$1();
            m.forEach(function (v, k) { map.set(k, v); });
            return map;
        };
    })();
    var _clearValues = (function () {
        if ((new Map$1()).keys().next) {
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
            if ((new Map$1()).values().next) {
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
        StringMapWrapper.values = function (map) {
            return Object.keys(map).reduce(function (r, a) {
                r.push(map[a]);
                return r;
            }, []);
        };
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
    }());
    var ListWrapper = (function () {
        function ListWrapper() {
        }
        // JS has no way to express a statically fixed size list, but dart does so we
        // keep both methods.
        ListWrapper.createFixedSize = function (size) { return new Array(size); };
        ListWrapper.createGrowableSize = function (size) { return new Array(size); };
        ListWrapper.clone = function (array) { return array.slice(0); };
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
            if (isPresent(compareFn)) {
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
                if (isBlank(candidate)) {
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
        ListWrapper.flatten = function (list) {
            var target = [];
            _flattenArray(list, target);
            return target;
        };
        ListWrapper.addAll = function (list, source) {
            for (var i = 0; i < source.length; i++) {
                list.push(source[i]);
            }
        };
        return ListWrapper;
    }());
    function _flattenArray(source, target) {
        if (isPresent(source)) {
            for (var i = 0; i < source.length; i++) {
                var item = source[i];
                if (isArray(item)) {
                    _flattenArray(item, target);
                }
                else {
                    target.push(item);
                }
            }
        }
        return target;
    }
    // Safari and Internet Explorer do not support the iterable parameter to the
    // Set constructor.  We work around that by manually adding the items.
    var createSetFromList = (function () {
        var test = new Set([1, 2, 3]);
        if (test.size === 3) {
            return function createSetFromList(lst) { return new Set(lst); };
        }
        else {
            return function createSetAndPopulateFromList(lst) {
                var res = new Set(lst);
                if (res.size !== lst.length) {
                    for (var i = 0; i < lst.length; i++) {
                        res.add(lst[i]);
                    }
                }
                return res;
            };
        }
    })();
    var DomAdapter = _angular_platformBrowser.__platform_browser_private__.DomAdapter;
    var setRootDomAdapter = _angular_platformBrowser.__platform_browser_private__.setRootDomAdapter;
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
    }(Error));
    var SelectorMatcher = _angular_compiler.__compiler_private__.SelectorMatcher;
    var CssSelector = _angular_compiler.__compiler_private__.CssSelector;
    var parse5 = require('parse5/index');
    var parser = null;
    var serializer = null;
    var treeAdapter = null;
    var _attrToPropMap = {
        'class': 'className',
        'innerHtml': 'innerHTML',
        'readonly': 'readOnly',
        'tabindex': 'tabIndex',
    };
    var defDoc = null;
    var mapProps = ['attribs', 'x-attribsNamespace', 'x-attribsPrefix'];
    function _notImplemented(methodName) {
        return new BaseException('This method is not implemented in Parse5DomAdapter: ' + methodName);
    }
    /* tslint:disable:requireParameterType */
    var Parse5DomAdapter = (function (_super) {
        __extends(Parse5DomAdapter, _super);
        function Parse5DomAdapter() {
            _super.apply(this, arguments);
        }
        Parse5DomAdapter.makeCurrent = function () {
            parser = new parse5.Parser(parse5.TreeAdapters.htmlparser2);
            serializer = new parse5.Serializer(parse5.TreeAdapters.htmlparser2);
            treeAdapter = parser.treeAdapter;
            setRootDomAdapter(new Parse5DomAdapter());
        };
        Parse5DomAdapter.prototype.hasProperty = function (element, name) {
            return _HTMLElementPropertyList.indexOf(name) > -1;
        };
        // TODO(tbosch): don't even call this method when we run the tests on server side
        // by not using the DomRenderer in tests. Keeping this for now to make tests happy...
        Parse5DomAdapter.prototype.setProperty = function (el, name, value) {
            if (name === 'innerHTML') {
                this.setInnerHTML(el, value);
            }
            else if (name === 'className') {
                el.attribs["class"] = el.className = value;
            }
            else {
                el[name] = value;
            }
        };
        // TODO(tbosch): don't even call this method when we run the tests on server side
        // by not using the DomRenderer in tests. Keeping this for now to make tests happy...
        Parse5DomAdapter.prototype.getProperty = function (el, name) { return el[name]; };
        Parse5DomAdapter.prototype.logError = function (error) { console.error(error); };
        Parse5DomAdapter.prototype.log = function (error) { console.log(error); };
        Parse5DomAdapter.prototype.logGroup = function (error) { console.error(error); };
        Parse5DomAdapter.prototype.logGroupEnd = function () { };
        Parse5DomAdapter.prototype.getXHR = function () { return _angular_compiler.XHR; };
        Object.defineProperty(Parse5DomAdapter.prototype, "attrToPropMap", {
            get: function () { return _attrToPropMap; },
            enumerable: true,
            configurable: true
        });
        Parse5DomAdapter.prototype.query = function (selector) { throw _notImplemented('query'); };
        Parse5DomAdapter.prototype.querySelector = function (el, selector) { return this.querySelectorAll(el, selector)[0]; };
        Parse5DomAdapter.prototype.querySelectorAll = function (el, selector) {
            var _this = this;
            var res = [];
            var _recursive = function (result, node, selector, matcher) {
                var cNodes = node.childNodes;
                if (cNodes && cNodes.length > 0) {
                    for (var i = 0; i < cNodes.length; i++) {
                        var childNode = cNodes[i];
                        if (_this.elementMatches(childNode, selector, matcher)) {
                            result.push(childNode);
                        }
                        _recursive(result, childNode, selector, matcher);
                    }
                }
            };
            var matcher = new SelectorMatcher();
            matcher.addSelectables(CssSelector.parse(selector));
            _recursive(res, el, selector, matcher);
            return res;
        };
        Parse5DomAdapter.prototype.elementMatches = function (node, selector, matcher) {
            if (matcher === void 0) { matcher = null; }
            if (this.isElementNode(node) && selector === '*') {
                return true;
            }
            var result = false;
            if (selector && selector.charAt(0) == "#") {
                result = this.getAttribute(node, 'id') == selector.substring(1);
            }
            else if (selector) {
                var result = false;
                if (matcher == null) {
                    matcher = new SelectorMatcher();
                    matcher.addSelectables(CssSelector.parse(selector));
                }
                var cssSelector = new CssSelector();
                cssSelector.setElement(this.tagName(node));
                if (node.attribs) {
                    for (var attrName in node.attribs) {
                        cssSelector.addAttribute(attrName, node.attribs[attrName]);
                    }
                }
                var classList = this.classList(node);
                for (var i = 0; i < classList.length; i++) {
                    cssSelector.addClassName(classList[i]);
                }
                matcher.match(cssSelector, function (selector, cb) { result = true; });
            }
            return result;
        };
        Parse5DomAdapter.prototype.on = function (el, evt, listener) {
            var listenersMap = el._eventListenersMap;
            if (isBlank(listenersMap)) {
                var listenersMap = StringMapWrapper.create();
                el._eventListenersMap = listenersMap;
            }
            var listeners = StringMapWrapper.get(listenersMap, evt);
            if (isBlank(listeners)) {
                listeners = [];
            }
            listeners.push(listener);
            StringMapWrapper.set(listenersMap, evt, listeners);
        };
        Parse5DomAdapter.prototype.onAndCancel = function (el, evt, listener) {
            this.on(el, evt, listener);
            return function () {
                ListWrapper.remove(StringMapWrapper.get(el._eventListenersMap, evt), listener);
            };
        };
        Parse5DomAdapter.prototype.dispatchEvent = function (el, evt) {
            if (isBlank(evt.target)) {
                evt.target = el;
            }
            if (isPresent(el._eventListenersMap)) {
                var listeners = StringMapWrapper.get(el._eventListenersMap, evt.type);
                if (isPresent(listeners)) {
                    for (var i = 0; i < listeners.length; i++) {
                        listeners[i](evt);
                    }
                }
            }
            if (isPresent(el.parent)) {
                this.dispatchEvent(el.parent, evt);
            }
            if (isPresent(el._window)) {
                this.dispatchEvent(el._window, evt);
            }
        };
        Parse5DomAdapter.prototype.createMouseEvent = function (eventType) { return this.createEvent(eventType); };
        Parse5DomAdapter.prototype.createEvent = function (eventType) {
            var evt = {
                type: eventType,
                defaultPrevented: false,
                preventDefault: function () { evt.defaultPrevented = true; }
            };
            return evt;
        };
        Parse5DomAdapter.prototype.preventDefault = function (evt) { evt.returnValue = false; };
        Parse5DomAdapter.prototype.isPrevented = function (evt) { return isPresent(evt.returnValue) && !evt.returnValue; };
        Parse5DomAdapter.prototype.getInnerHTML = function (el) { return serializer.serialize(this.templateAwareRoot(el)); };
        Parse5DomAdapter.prototype.getOuterHTML = function (el) {
            serializer.html = '';
            serializer._serializeElement(el);
            return serializer.html;
        };
        Parse5DomAdapter.prototype.nodeName = function (node) { return node.tagName; };
        Parse5DomAdapter.prototype.nodeValue = function (node) { return node.nodeValue; };
        Parse5DomAdapter.prototype.type = function (node) { throw _notImplemented('type'); };
        Parse5DomAdapter.prototype.content = function (node) { return node.childNodes[0]; };
        Parse5DomAdapter.prototype.firstChild = function (el) { return el.firstChild; };
        Parse5DomAdapter.prototype.nextSibling = function (el) { return el.nextSibling; };
        Parse5DomAdapter.prototype.parentElement = function (el) { return el.parent; };
        Parse5DomAdapter.prototype.childNodes = function (el) { return el.childNodes; };
        Parse5DomAdapter.prototype.childNodesAsList = function (el) {
            var childNodes = el.childNodes;
            var res = ListWrapper.createFixedSize(childNodes.length);
            for (var i = 0; i < childNodes.length; i++) {
                res[i] = childNodes[i];
            }
            return res;
        };
        Parse5DomAdapter.prototype.clearNodes = function (el) {
            while (el.childNodes.length > 0) {
                this.remove(el.childNodes[0]);
            }
        };
        Parse5DomAdapter.prototype.appendChild = function (el, node) {
            this.remove(node);
            treeAdapter.appendChild(this.templateAwareRoot(el), node);
        };
        Parse5DomAdapter.prototype.removeChild = function (el, node) {
            if (ListWrapper.contains(el.childNodes, node)) {
                this.remove(node);
            }
        };
        Parse5DomAdapter.prototype.remove = function (el) {
            var parent = el.parent;
            if (parent) {
                var index = parent.childNodes.indexOf(el);
                parent.childNodes.splice(index, 1);
            }
            var prev = el.previousSibling;
            var next = el.nextSibling;
            if (prev) {
                prev.next = next;
            }
            if (next) {
                next.prev = prev;
            }
            el.prev = null;
            el.next = null;
            el.parent = null;
            return el;
        };
        Parse5DomAdapter.prototype.insertBefore = function (el, node) {
            this.remove(node);
            treeAdapter.insertBefore(el.parent, node, el);
        };
        Parse5DomAdapter.prototype.insertAllBefore = function (el, nodes) {
            var _this = this;
            nodes.forEach(function (n) { return _this.insertBefore(el, n); });
        };
        Parse5DomAdapter.prototype.insertAfter = function (el, node) {
            if (el.nextSibling) {
                this.insertBefore(el.nextSibling, node);
            }
            else {
                this.appendChild(el.parent, node);
            }
        };
        Parse5DomAdapter.prototype.setInnerHTML = function (el, value) {
            this.clearNodes(el);
            var content = parser.parseFragment(value);
            for (var i = 0; i < content.childNodes.length; i++) {
                treeAdapter.appendChild(el, content.childNodes[i]);
            }
        };
        Parse5DomAdapter.prototype.getText = function (el, isRecursive) {
            if (this.isTextNode(el)) {
                return el.data;
            }
            else if (this.isCommentNode(el)) {
                // In the DOM, comments within an element return an empty string for textContent
                // However, comment node instances return the comment content for textContent getter
                return isRecursive ? '' : el.data;
            }
            else if (isBlank(el.childNodes) || el.childNodes.length == 0) {
                return "";
            }
            else {
                var textContent = "";
                for (var i = 0; i < el.childNodes.length; i++) {
                    textContent += this.getText(el.childNodes[i], true);
                }
                return textContent;
            }
        };
        Parse5DomAdapter.prototype.setText = function (el, value) {
            if (this.isTextNode(el) || this.isCommentNode(el)) {
                el.data = value;
            }
            else {
                this.clearNodes(el);
                if (value !== '')
                    treeAdapter.insertText(el, value);
            }
        };
        Parse5DomAdapter.prototype.getValue = function (el) { return el.value; };
        Parse5DomAdapter.prototype.setValue = function (el, value) { el.value = value; };
        Parse5DomAdapter.prototype.getChecked = function (el) { return el.checked; };
        Parse5DomAdapter.prototype.setChecked = function (el, value) { el.checked = value; };
        Parse5DomAdapter.prototype.createComment = function (text) { return treeAdapter.createCommentNode(text); };
        Parse5DomAdapter.prototype.createTemplate = function (html) {
            var template = treeAdapter.createElement("template", 'http://www.w3.org/1999/xhtml', []);
            var content = parser.parseFragment(html);
            treeAdapter.appendChild(template, content);
            return template;
        };
        Parse5DomAdapter.prototype.createElement = function (tagName) {
            return treeAdapter.createElement(tagName, 'http://www.w3.org/1999/xhtml', []);
        };
        Parse5DomAdapter.prototype.createElementNS = function (ns, tagName) { return treeAdapter.createElement(tagName, ns, []); };
        Parse5DomAdapter.prototype.createTextNode = function (text) {
            var t = this.createComment(text);
            t.type = 'text';
            return t;
        };
        Parse5DomAdapter.prototype.createScriptTag = function (attrName, attrValue) {
            return treeAdapter.createElement("script", 'http://www.w3.org/1999/xhtml', [{ name: attrName, value: attrValue }]);
        };
        Parse5DomAdapter.prototype.createStyleElement = function (css) {
            var style = this.createElement('style');
            this.setText(style, css);
            return style;
        };
        Parse5DomAdapter.prototype.createShadowRoot = function (el) {
            el.shadowRoot = treeAdapter.createDocumentFragment();
            el.shadowRoot.parent = el;
            return el.shadowRoot;
        };
        Parse5DomAdapter.prototype.getShadowRoot = function (el) { return el.shadowRoot; };
        Parse5DomAdapter.prototype.getHost = function (el) { return el.host; };
        Parse5DomAdapter.prototype.getDistributedNodes = function (el) { throw _notImplemented('getDistributedNodes'); };
        Parse5DomAdapter.prototype.clone = function (node) {
            var _recursive = function (node) {
                var nodeClone = Object.create(Object.getPrototypeOf(node));
                for (var prop in node) {
                    var desc = Object.getOwnPropertyDescriptor(node, prop);
                    if (desc && 'value' in desc && typeof desc.value !== 'object') {
                        nodeClone[prop] = node[prop];
                    }
                }
                nodeClone.parent = null;
                nodeClone.prev = null;
                nodeClone.next = null;
                nodeClone.children = null;
                mapProps.forEach(function (mapName) {
                    if (isPresent(node[mapName])) {
                        nodeClone[mapName] = {};
                        for (var prop in node[mapName]) {
                            nodeClone[mapName][prop] = node[mapName][prop];
                        }
                    }
                });
                var cNodes = node.children;
                if (cNodes) {
                    var cNodesClone = new Array(cNodes.length);
                    for (var i = 0; i < cNodes.length; i++) {
                        var childNode = cNodes[i];
                        var childNodeClone = _recursive(childNode);
                        cNodesClone[i] = childNodeClone;
                        if (i > 0) {
                            childNodeClone.prev = cNodesClone[i - 1];
                            cNodesClone[i - 1].next = childNodeClone;
                        }
                        childNodeClone.parent = nodeClone;
                    }
                    nodeClone.children = cNodesClone;
                }
                return nodeClone;
            };
            return _recursive(node);
        };
        Parse5DomAdapter.prototype.getElementsByClassName = function (element, name) {
            return this.querySelectorAll(element, "." + name);
        };
        Parse5DomAdapter.prototype.getElementsByTagName = function (element, name) {
            throw _notImplemented('getElementsByTagName');
        };
        Parse5DomAdapter.prototype.classList = function (element) {
            var classAttrValue = null;
            var attributes = element.attribs;
            if (attributes && attributes.hasOwnProperty("class")) {
                classAttrValue = attributes["class"];
            }
            return classAttrValue ? classAttrValue.trim().split(/\s+/g) : [];
        };
        Parse5DomAdapter.prototype.addClass = function (element, className) {
            var classList = this.classList(element);
            var index = classList.indexOf(className);
            if (index == -1) {
                classList.push(className);
                element.attribs["class"] = element.className = classList.join(" ");
            }
        };
        Parse5DomAdapter.prototype.removeClass = function (element, className) {
            var classList = this.classList(element);
            var index = classList.indexOf(className);
            if (index > -1) {
                classList.splice(index, 1);
                element.attribs["class"] = element.className = classList.join(" ");
            }
        };
        Parse5DomAdapter.prototype.hasClass = function (element, className) {
            return ListWrapper.contains(this.classList(element), className);
        };
        Parse5DomAdapter.prototype.hasStyle = function (element, styleName, styleValue) {
            if (styleValue === void 0) { styleValue = null; }
            var value = this.getStyle(element, styleName) || '';
            return styleValue ? value == styleValue : value.length > 0;
        };
        /** @internal */
        Parse5DomAdapter.prototype._readStyleAttribute = function (element) {
            var styleMap = {};
            var attributes = element.attribs;
            if (attributes && attributes.hasOwnProperty("style")) {
                var styleAttrValue = attributes["style"];
                var styleList = styleAttrValue.split(/;+/g);
                for (var i = 0; i < styleList.length; i++) {
                    if (styleList[i].length > 0) {
                        var elems = styleList[i].split(/:+/g);
                        styleMap[elems[0].trim()] = elems[1].trim();
                    }
                }
            }
            return styleMap;
        };
        /** @internal */
        Parse5DomAdapter.prototype._writeStyleAttribute = function (element, styleMap) {
            var styleAttrValue = "";
            for (var key in styleMap) {
                var newValue = styleMap[key];
                if (newValue && newValue.length > 0) {
                    styleAttrValue += key + ":" + styleMap[key] + ";";
                }
            }
            element.attribs["style"] = styleAttrValue;
        };
        Parse5DomAdapter.prototype.setStyle = function (element, styleName, styleValue) {
            var styleMap = this._readStyleAttribute(element);
            styleMap[styleName] = styleValue;
            this._writeStyleAttribute(element, styleMap);
        };
        Parse5DomAdapter.prototype.removeStyle = function (element, styleName) { this.setStyle(element, styleName, null); };
        Parse5DomAdapter.prototype.getStyle = function (element, styleName) {
            var styleMap = this._readStyleAttribute(element);
            return styleMap.hasOwnProperty(styleName) ? styleMap[styleName] : "";
        };
        Parse5DomAdapter.prototype.tagName = function (element) { return element.tagName == "style" ? "STYLE" : element.tagName; };
        Parse5DomAdapter.prototype.attributeMap = function (element) {
            var res = new Map();
            var elAttrs = treeAdapter.getAttrList(element);
            for (var i = 0; i < elAttrs.length; i++) {
                var attrib = elAttrs[i];
                res.set(attrib.name, attrib.value);
            }
            return res;
        };
        Parse5DomAdapter.prototype.hasAttribute = function (element, attribute) {
            return element.attribs && element.attribs.hasOwnProperty(attribute);
        };
        Parse5DomAdapter.prototype.hasAttributeNS = function (element, ns, attribute) { throw 'not implemented'; };
        Parse5DomAdapter.prototype.getAttribute = function (element, attribute) {
            return element.attribs && element.attribs.hasOwnProperty(attribute) ?
                element.attribs[attribute] :
                null;
        };
        Parse5DomAdapter.prototype.getAttributeNS = function (element, ns, attribute) { throw 'not implemented'; };
        Parse5DomAdapter.prototype.setAttribute = function (element, attribute, value) {
            if (attribute) {
                element.attribs[attribute] = value;
                if (attribute === 'class') {
                    element.className = value;
                }
            }
        };
        Parse5DomAdapter.prototype.setAttributeNS = function (element, ns, attribute, value) { throw 'not implemented'; };
        Parse5DomAdapter.prototype.removeAttribute = function (element, attribute) {
            if (attribute) {
                StringMapWrapper.delete(element.attribs, attribute);
            }
        };
        Parse5DomAdapter.prototype.removeAttributeNS = function (element, ns, name) { throw 'not implemented'; };
        Parse5DomAdapter.prototype.templateAwareRoot = function (el) { return this.isTemplateElement(el) ? this.content(el) : el; };
        Parse5DomAdapter.prototype.createHtmlDocument = function () {
            var newDoc = treeAdapter.createDocument();
            newDoc.title = "fake title";
            var head = treeAdapter.createElement("head", null, []);
            var body = treeAdapter.createElement("body", 'http://www.w3.org/1999/xhtml', []);
            this.appendChild(newDoc, head);
            this.appendChild(newDoc, body);
            StringMapWrapper.set(newDoc, "head", head);
            StringMapWrapper.set(newDoc, "body", body);
            StringMapWrapper.set(newDoc, "_window", StringMapWrapper.create());
            return newDoc;
        };
        Parse5DomAdapter.prototype.defaultDoc = function () {
            if (defDoc === null) {
                defDoc = this.createHtmlDocument();
            }
            return defDoc;
        };
        Parse5DomAdapter.prototype.getBoundingClientRect = function (el) { return { left: 0, top: 0, width: 0, height: 0 }; };
        Parse5DomAdapter.prototype.getTitle = function () { return this.defaultDoc().title || ""; };
        Parse5DomAdapter.prototype.setTitle = function (newTitle) { this.defaultDoc().title = newTitle; };
        Parse5DomAdapter.prototype.isTemplateElement = function (el) {
            return this.isElementNode(el) && this.tagName(el) === "template";
        };
        Parse5DomAdapter.prototype.isTextNode = function (node) { return treeAdapter.isTextNode(node); };
        Parse5DomAdapter.prototype.isCommentNode = function (node) { return treeAdapter.isCommentNode(node); };
        Parse5DomAdapter.prototype.isElementNode = function (node) { return node ? treeAdapter.isElementNode(node) : false; };
        Parse5DomAdapter.prototype.hasShadowRoot = function (node) { return isPresent(node.shadowRoot); };
        Parse5DomAdapter.prototype.isShadowRoot = function (node) { return this.getShadowRoot(node) == node; };
        Parse5DomAdapter.prototype.importIntoDoc = function (node) { return this.clone(node); };
        Parse5DomAdapter.prototype.adoptNode = function (node) { return node; };
        Parse5DomAdapter.prototype.getHref = function (el) { return el.href; };
        Parse5DomAdapter.prototype.resolveAndSetHref = function (el, baseUrl, href) {
            if (href == null) {
                el.href = baseUrl;
            }
            else {
                el.href = baseUrl + '/../' + href;
            }
        };
        /** @internal */
        Parse5DomAdapter.prototype._buildRules = function (parsedRules, css) {
            var rules = [];
            for (var i = 0; i < parsedRules.length; i++) {
                var parsedRule = parsedRules[i];
                var rule = StringMapWrapper.create();
                StringMapWrapper.set(rule, "cssText", css);
                StringMapWrapper.set(rule, "style", { content: "", cssText: "" });
                if (parsedRule.type == "rule") {
                    StringMapWrapper.set(rule, "type", 1);
                    StringMapWrapper.set(rule, "selectorText", parsedRule.selectors.join(", ")
                        .replace(/\s{2,}/g, " ")
                        .replace(/\s*~\s*/g, " ~ ")
                        .replace(/\s*\+\s*/g, " + ")
                        .replace(/\s*>\s*/g, " > ")
                        .replace(/\[(\w+)=(\w+)\]/g, '[$1="$2"]'));
                    if (isBlank(parsedRule.declarations)) {
                        continue;
                    }
                    for (var j = 0; j < parsedRule.declarations.length; j++) {
                        var declaration = parsedRule.declarations[j];
                        StringMapWrapper.set(StringMapWrapper.get(rule, "style"), declaration.property, declaration.value);
                        StringMapWrapper.get(rule, "style").cssText +=
                            declaration.property + ": " + declaration.value + ";";
                    }
                }
                else if (parsedRule.type == "media") {
                    StringMapWrapper.set(rule, "type", 4);
                    StringMapWrapper.set(rule, "media", { mediaText: parsedRule.media });
                    if (parsedRule.rules) {
                        StringMapWrapper.set(rule, "cssRules", this._buildRules(parsedRule.rules));
                    }
                }
                rules.push(rule);
            }
            return rules;
        };
        Parse5DomAdapter.prototype.supportsDOMEvents = function () { return false; };
        Parse5DomAdapter.prototype.supportsNativeShadowDOM = function () { return false; };
        Parse5DomAdapter.prototype.getGlobalEventTarget = function (target) {
            if (target == "window") {
                return this.defaultDoc()._window;
            }
            else if (target == "document") {
                return this.defaultDoc();
            }
            else if (target == "body") {
                return this.defaultDoc().body;
            }
        };
        Parse5DomAdapter.prototype.getBaseHref = function () { throw 'not implemented'; };
        Parse5DomAdapter.prototype.resetBaseElement = function () { throw 'not implemented'; };
        Parse5DomAdapter.prototype.getHistory = function () { throw 'not implemented'; };
        Parse5DomAdapter.prototype.getLocation = function () { throw 'not implemented'; };
        Parse5DomAdapter.prototype.getUserAgent = function () { return "Fake user agent"; };
        Parse5DomAdapter.prototype.getData = function (el, name) { return this.getAttribute(el, 'data-' + name); };
        Parse5DomAdapter.prototype.getComputedStyle = function (el) { throw 'not implemented'; };
        Parse5DomAdapter.prototype.setData = function (el, name, value) { this.setAttribute(el, 'data-' + name, value); };
        // TODO(tbosch): move this into a separate environment class once we have it
        Parse5DomAdapter.prototype.setGlobalVar = function (path, value) { setValueOnPath(_global, path, value); };
        Parse5DomAdapter.prototype.requestAnimationFrame = function (callback) { return setTimeout(callback, 0); };
        Parse5DomAdapter.prototype.cancelAnimationFrame = function (id) { clearTimeout(id); };
        Parse5DomAdapter.prototype.supportsWebAnimation = function () { return true; };
        Parse5DomAdapter.prototype.performanceNow = function () { return DateWrapper.toMillis(DateWrapper.now()); };
        Parse5DomAdapter.prototype.getAnimationPrefix = function () { return ''; };
        Parse5DomAdapter.prototype.getTransitionEnd = function () { return 'transitionend'; };
        Parse5DomAdapter.prototype.supportsAnimation = function () { return true; };
        Parse5DomAdapter.prototype.replaceChild = function (el, newNode, oldNode) { throw new Error('not implemented'); };
        Parse5DomAdapter.prototype.parse = function (templateHtml) { throw new Error('not implemented'); };
        Parse5DomAdapter.prototype.invoke = function (el, methodName, args) { throw new Error('not implemented'); };
        Parse5DomAdapter.prototype.getEventKey = function (event) { throw new Error('not implemented'); };
        return Parse5DomAdapter;
    }(DomAdapter));
    // TODO: build a proper list, this one is all the keys of a HTMLInputElement
    var _HTMLElementPropertyList = [
        "webkitEntries",
        "incremental",
        "webkitdirectory",
        "selectionDirection",
        "selectionEnd",
        "selectionStart",
        "labels",
        "validationMessage",
        "validity",
        "willValidate",
        "width",
        "valueAsNumber",
        "valueAsDate",
        "value",
        "useMap",
        "defaultValue",
        "type",
        "step",
        "src",
        "size",
        "required",
        "readOnly",
        "placeholder",
        "pattern",
        "name",
        "multiple",
        "min",
        "minLength",
        "maxLength",
        "max",
        "list",
        "indeterminate",
        "height",
        "formTarget",
        "formNoValidate",
        "formMethod",
        "formEnctype",
        "formAction",
        "files",
        "form",
        "disabled",
        "dirName",
        "checked",
        "defaultChecked",
        "autofocus",
        "autocomplete",
        "alt",
        "align",
        "accept",
        "onautocompleteerror",
        "onautocomplete",
        "onwaiting",
        "onvolumechange",
        "ontoggle",
        "ontimeupdate",
        "onsuspend",
        "onsubmit",
        "onstalled",
        "onshow",
        "onselect",
        "onseeking",
        "onseeked",
        "onscroll",
        "onresize",
        "onreset",
        "onratechange",
        "onprogress",
        "onplaying",
        "onplay",
        "onpause",
        "onmousewheel",
        "onmouseup",
        "onmouseover",
        "onmouseout",
        "onmousemove",
        "onmouseleave",
        "onmouseenter",
        "onmousedown",
        "onloadstart",
        "onloadedmetadata",
        "onloadeddata",
        "onload",
        "onkeyup",
        "onkeypress",
        "onkeydown",
        "oninvalid",
        "oninput",
        "onfocus",
        "onerror",
        "onended",
        "onemptied",
        "ondurationchange",
        "ondrop",
        "ondragstart",
        "ondragover",
        "ondragleave",
        "ondragenter",
        "ondragend",
        "ondrag",
        "ondblclick",
        "oncuechange",
        "oncontextmenu",
        "onclose",
        "onclick",
        "onchange",
        "oncanplaythrough",
        "oncanplay",
        "oncancel",
        "onblur",
        "onabort",
        "spellcheck",
        "isContentEditable",
        "contentEditable",
        "outerText",
        "innerText",
        "accessKey",
        "hidden",
        "webkitdropzone",
        "draggable",
        "tabIndex",
        "dir",
        "translate",
        "lang",
        "title",
        "childElementCount",
        "lastElementChild",
        "firstElementChild",
        "children",
        "onwebkitfullscreenerror",
        "onwebkitfullscreenchange",
        "nextElementSibling",
        "previousElementSibling",
        "onwheel",
        "onselectstart",
        "onsearch",
        "onpaste",
        "oncut",
        "oncopy",
        "onbeforepaste",
        "onbeforecut",
        "onbeforecopy",
        "shadowRoot",
        "dataset",
        "classList",
        "className",
        "outerHTML",
        "innerHTML",
        "scrollHeight",
        "scrollWidth",
        "scrollTop",
        "scrollLeft",
        "clientHeight",
        "clientWidth",
        "clientTop",
        "clientLeft",
        "offsetParent",
        "offsetHeight",
        "offsetWidth",
        "offsetTop",
        "offsetLeft",
        "localName",
        "prefix",
        "namespaceURI",
        "id",
        "style",
        "attributes",
        "tagName",
        "parentElement",
        "textContent",
        "baseURI",
        "ownerDocument",
        "nextSibling",
        "previousSibling",
        "lastChild",
        "firstChild",
        "childNodes",
        "parentNode",
        "nodeType",
        "nodeValue",
        "nodeName",
        "closure_lm_714617",
        "__jsaction"
    ];
    exports.Parse5DomAdapter = Parse5DomAdapter;
}));
