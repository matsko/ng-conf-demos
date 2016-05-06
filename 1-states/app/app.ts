//our root app component
import {animation, style, animate, state, transition, Component} from '@angular/core'

@Component({
  selector: 'my-app',
  providers: [],
  templateUrl: 'app/app.html',
  directives: [],
  animations: [
    animation('state', [
      state('void', style({ display: 'none' })),
      state('active', style({ transform: 'translate3d(0, 0, 0)' })),
      state('hidden', style({ transform: 'translate3d(100%, 0, 0)' })),
      transition('active => hidden', [animate('350ms ease-out')]),
      transition('hidden => active', [
        style({ transform: 'translate3d(-100%, 0, 0)' }),
        animate('350ms ease-out')
      ]),
    ]),
  ]
})
export class App {
  selectedEmail;
  emails = [
    { subject: 'Angular 2 Release Date', sender: 'Brad Green' },
    { subject: 'Invite: Angular 3 Planning Meeting', sender: 'Papa Misko' },
  ];
  
  constructor() {
    this.selectedEmail = this.emails[0];
  }
}

class Page {
  constructor(public title: string, public content: string) {}
} 
