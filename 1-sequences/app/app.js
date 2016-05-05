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
    function App() {
        this._activePageIndex = 0;
        this.pages = [
            new Page("home page", "welcome to the home page"),
            new Page("about page", "welcome to the home page"),
            new Page("contact page", "welcome to the contact page")
        ];
    }
    App.prototype.isActive = function (index) {
        return this._activePageIndex == index;
    };
    App.prototype.tab = function (index) {
        this._activePageIndex = index;
    };
    App = __decorate([
        core_1.Component({
            selector: 'my-app',
            providers: [],
            templateUrl: 'app/app.html',
            directives: [],
            animations: [
                core_1.animation('tab', [
                    core_1.state('active', core_1.style({ opacity: 1 })),
                    core_1.state('closed', core_1.style({ opacity: 0 })),
                    core_1.transition('void => active', [core_1.animate(1)]),
                    core_1.transition('void => closed', [core_1.animate(1)]),
                    core_1.transition('active => closed', [core_1.animate(500)]),
                    core_1.transition('closed => active', [core_1.animate(500)])
                ])
            ]
        }), 
        __metadata('design:paramtypes', [])
    ], App);
    return App;
}());
exports.App = App;
var Page = (function () {
    function Page(title, content) {
        this.title = title;
        this.content = content;
    }
    return Page;
}());
