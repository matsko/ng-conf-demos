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
        this.emails = [
            { subject: 'Angular 2 Release Date', sender: 'Brad Green' },
            { subject: 'Invite: Angular 3 Planning Meeting', sender: 'Papa Misko' },
        ];
        this.selectedEmail = this.emails[0];
    }
    App = __decorate([
        core_1.Component({
            selector: 'my-app',
            providers: [],
            templateUrl: 'app/app.html',
            directives: [],
            animations: [
                core_1.animation('state', [
                    core_1.state('void', core_1.style({ display: 'none' })),
                    core_1.state('active', core_1.style({ transform: 'translate3d(0, 0, 0)' })),
                    core_1.state('hidden', core_1.style({ transform: 'translate3d(100%, 0, 0)' })),
                    core_1.transition('active => hidden', [core_1.animate('350ms ease-out')]),
                    core_1.transition('hidden => active', [
                        core_1.style({ transform: 'translate3d(-100%, 0, 0)' }),
                        core_1.animate('350ms ease-out')
                    ]),
                ]),
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
