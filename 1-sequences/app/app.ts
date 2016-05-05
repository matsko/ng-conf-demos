//our root app component
import {animation, style, animate, state, transition, Component} from '@angular/core'

@Component({
  selector: 'my-app',
  providers: [],
  templateUrl: 'app/app.html',
  directives: [],
  animations: [
    animation('tab', [
      state('active', style({ opacity: 1 })),
      state('closed', style({ opacity: 0 })),
      transition('void => active', [animate(1)]),
      transition('void => closed', [animate(1)]),
      transition('active => closed', [animate(500)]),
      transition('closed => active', [animate(500)])
    ])
  ]
})
export class App {
  private _activePageIndex = 0;

  pages = [
    new Page("home page", "welcome to the home page"),
    new Page("about page", "welcome to the home page"),
    new Page("contact page", "welcome to the contact page")
  ];

  isActive(index) {
    return this._activePageIndex == index;
  }

  tab(index) {
    this._activePageIndex = index;
  }
}

class Page {
  constructor(public title: string, public content: string) {}
} 
