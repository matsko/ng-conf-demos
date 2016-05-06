"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
//our root app component
var core_1 = require('@angular/core');
var App = (function () {
    function App(_ref) {
        this._ref = _ref;
        this._listeners = [];
        this.paused = false;
        this.animationsRunning = true;
        this.gotoTop();
        this._listeners.push(function () {
            alert('done');
        });
    }
    App.prototype.getPlayer = function () {
        try {
            return this._ref['_element'].parentView.viewChildren[0].activeAnimations['boxAnimation'];
        }
        catch (e) {
            return null;
        }
    };
    App.prototype.pauseAnimation = function () {
        var player = this.getPlayer();
        if (player) {
            player.pause();
        }
        this.paused = true;
    };
    App.prototype.resumeAnimation = function () {
        var player = this.getPlayer();
        if (player) {
            player.play();
        }
        this.paused = false;
    };
    App.prototype.togglePause = function () {
        var player = this.getPlayer();
        if (this.paused) {
            this.resumeAnimation();
        }
        else {
            this.pauseAnimation();
        }
    };
    Object.defineProperty(App.prototype, "boxState", {
        get: function () {
            return this._boxState;
        },
        enumerable: true,
        configurable: true
    });
    App.prototype.gotoTop = function () {
        this._boxState = 'top';
        this.setupListener();
    };
    App.prototype.gotoBottom = function () {
        this._boxState = 'bottom';
        this.setupListener();
    };
    App.prototype.scrub = function (value) {
        this.pauseAnimation();
        value /= 100;
        var player = this.getPlayer();
        if (player) {
            player.setPosition(value);
        }
    };
    App.prototype.setupListener = function () {
        var _this = this;
        requestAnimationFrame(function () {
            var player = _this.getPlayer();
            if (player) {
                _this.animationsRunning = true;
                _this.paused = false;
                player.onDone(function () {
                    _this.animationsRunning = false;
                    _this._listeners.forEach(function (listener) { return listener(); });
                });
            }
        });
    };
    App = __decorate([
        core_1.Component({
            selector: 'my-app',
            providers: [],
            templateUrl: 'app/app.html',
            directives: [],
            styles: ["\n    nav {\n      color:white;\n      background:black;\n      padding:5px;\n      position:fixed;\n      top:0;\n      right:0;\n      left:0;\n      z-index:100;\n    }\n    nav button {\n      color:white;\n      background:#aaa;\n      padding:5px;\n    }\n    .box {\n      position:absolute;\n      width:150px;\n      height:150px;\n      background:red;\n      border:10px solid black;\n    }\n  "],
            animations: [
                core_1.animation('boxAnimation', [
                    core_1.state('void', core_1.style({ top: '0', left: '0' })),
                    core_1.state('top', core_1.style({ top: '0', left: '0' })),
                    core_1.state('bottom', core_1.style({ top: '400px', left: '400px' })),
                    core_1.transition('top => bottom', [
                        core_1.style({ 'background': 'red' }),
                        core_1.animate(5000, [
                            core_1.style({ 'background': 'blue', 'transform': 'scale(1)' }),
                            core_1.style({ 'transform': 'scale(1.5)', 'top': '200px' }),
                            core_1.style({ 'transform': 'rotate(125deg)', 'left': '400px' }),
                            core_1.style({ 'top': '400px', 'left': '400px', 'background': 'red', 'transform': 'scale(1)' })
                        ])
                    ]),
                    core_1.transition('bottom => top', [core_1.animate(5000)])
                ])
            ]
        }), 
        __metadata('design:paramtypes', [core_1.ViewContainerRef])
    ], App);
    return App;
}());
exports.App = App;
