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
var core_1 = require('angular2/core');
var AnimateApp = (function () {
    function AnimateApp() {
        this._visible = false;
        this.items = [];
    }
    Object.defineProperty(AnimateApp.prototype, "visible", {
        get: function () {
            return this._visible;
        },
        set: function (bool) {
            this._visible = bool;
            if (this._visible) {
                this.items = [1, 2, 3, 4, 5,
                    6, 7, 8, 9, 10,
                    11, 12, 13, 14, 15,
                    16, 17, 18, 19, 20];
            }
            else {
                this.items = [];
            }
        },
        enumerable: true,
        configurable: true
    });
    AnimateApp.prototype.makeClass = function (index) {
        return index % 2 == 0 ? 'red' : 'green';
    };
    AnimateApp = __decorate([
        core_1.Component({
            selector: 'animate-app',
            styles: ["\n    button {\n      padding:20px;\n      background:red;\n      font-size:20px;\n      color:white;\n      border:0;\n      cursor:pointer;\n    }\n\n    div {\n      height:200px;\n      font-size:50px;\n      border:2px solid black;\n      width:200px;\n      line-height:200px;\n      display:inline-block;\n      text-align:center;\n      margin:10px;\n    }\n\n    .red { background-color:maroon; }\n    .green { background-color:silver; }\n  "],
            animations: {
                'ng-enter': [
                    core_1.save(['height', 'transform', 'background-color', 'opacity']),
                    core_1.style('.rotated'),
                    core_1.style('.invisible'),
                    core_1.style('.white'),
                    core_1.style({ height: '0px' }),
                    core_1.animate(['.visible', { height: '200px' }], '0.5s ease-out').stagger('40ms'),
                    core_1.animate('.normal', '0.5s').stagger('40ms'),
                    core_1.restore('0.5s').stagger('10ms')
                ],
                'ng-leave': [
                    core_1.style('.green'),
                    core_1.style('.normal'),
                    core_1.animate('.white', '0.5s').stagger('40ms'),
                    core_1.style('.visible'),
                    core_1.style({ height: '200px' }),
                    core_1.animate(['.invisible', '.rotated', { height: '0px' }], '0.5s ease-out').stagger('40ms')
                ]
            },
            animationStyles: {
                '.red': [
                    ['all', { 'background-color': 'maroon' }]
                ],
                '.white': [
                    ['all', { 'background-color': 'white' }]
                ],
                '.green': [
                    ['all', { 'background-color': 'silver' }]
                ],
                '.rotated': [
                    ['all', { 'transform': 'rotate(180deg) translateX(100px) translateY(100px)' }]
                ],
                '.normal': [
                    ['all', { 'transform': 'rotate(0deg) scale(1.2)' }]
                ],
                '.invisible': [
                    ['all', { 'opacity': '0' }]
                ],
                '.visible': [
                    ['all', { 'opacity': '1' }]
                ]
            },
            template: "\n    <button (click)=\"visible=!visible\">Animate</button>\n    <hr />\n    <div *ngFor=\"#item of items, #i = index\" [class]=\"makeClass(i)\">\n      lorem\n    </div>\n  "
        }), 
        __metadata('design:paramtypes', [])
    ], AnimateApp);
    return AnimateApp;
}());
exports.AnimateApp = AnimateApp;
