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
var page_1 = require('./page');
var panel_1 = require('./panel');
var App = (function () {
    function App() {
        this.openAll = false;
        this.pages = [
            new page_1.Page("Darth Vader", "\nDarth Vader, also known as Anakin Skywalker, is a fictional character in the Star Wars universe.[1][2][3] Vader appears in the original trilogy as a pivotal figure whose actions drive the plot of the first three films while his past as Anakin Skywalker, and the story of his corruption, is central to the prequel trilogy.\n\nThe character was created by George Lucas and has been portrayed by numerous actors. His appearances span the first six Star Wars films, and his character is heavily referenced in Star Wars: The Force Awakens. He is also an important character in the Star Wars expanded universe of television series, video games, novels, literature and comic books. Originally a Jedi prophesied to bring balance to the Force, he falls to the dark side of the Force and serves the evil Galactic Empire at the right hand of his Sith master, Emperor Palpatine (also known as Darth Sidious).[4] He is also the father of Luke Skywalker and Princess Leia Organa, grandfather of Kylo Ren, and secret husband of Padm\uFFFD\uFFFD Amidala.\n\nThe American Film Institute listed him as the third greatest movie villain in cinema history on 100 Years... 100 Heroes and Villains, behind Hannibal Lecter and Norman Bates."),
            new page_1.Page("Luke Skywalker", "\nLuke Skywalker is a fictional character appearing as the central protagonist of the original film trilogy, and as a supporting character in the sequel trilogy of the Star Wars universe created by George Lucas. The character, portrayed by Mark Hamill, is an important figure in the Rebel Alliance's struggle against the Galactic Empire. He is the twin brother of Rebellion leader Princess Leia Organa of Alderaan, a friend of smuggler Han Solo, an apprentice to Jedi Master Obi-Wan \"Ben\" Kenobi, and the son of fallen Jedi Anakin Skywalker (Darth Vader) and Queen of Naboo/Republic Senator Padm\u00E9 Amidala. In The Force Awakens, he is the uncle and former master of Kylo Ren. The now non-canon expanded Star Wars Legends universe depicts him as a powerful Jedi Master and eventually the Grand Master of the New Jedi Order, the father of Ben Skywalker, the maternal uncle of Jacen Solo, and the ancestor of Cade Skywalker.\n\nIn 2008, the character was selected by Empire magazine as the 54th greatest movie character of all time.[2] On their list of the 100 Greatest Fictional Characters, Fandomania.com ranked Luke at number 14."),
            new page_1.Page("contact page", "\nHan Solo is a fictional character in the Star Wars franchise, portrayed in films by Harrison Ford. In the original film trilogy, Han and his co-pilot, Chewbacca, become involved in the Rebel Alliance which opposes the Galactic Empire. During the course of the Star Wars story, he becomes a chief figure in the Alliance and succeeding galactic governments. Star Wars creator George Lucas described the character as \"a loner who realizes the importance of being part of a group and helping for the common good\".\n    ", [
                'https://en.wikipedia.org/wiki/Han_Solo'
            ])
        ];
    }
    App.prototype.toggleOpenAll = function () {
        this.openAll = !this.openAll;
    };
    App = __decorate([
        core_1.Component({
            selector: 'my-app',
            templateUrl: 'app/app.html',
            directives: [panel_1.PanelCmp]
        }), 
        __metadata('design:paramtypes', [])
    ], App);
    return App;
}());
exports.App = App;
