import {Component, Input} from '@angular/core';
import {animation, style, animate, state, transition} from '@angular/core'
import {Page} from './page';

@Component({
  selector: 'panel',
  templateUrl: 'app/panel.html',
  styleUrls: ['app/panel.css'],
  animations: [
    animation('active', [
      state('void', style({ height: 0 })),
      state('closed', style({ height: 0 })),
      state('open', style({ height: '*' })),
      transition('void => closed', [ animate(0) ]),
      transition('closed => open', [ animate('500ms ease-out') ]),
      transition('open => closed', [ animate('500ms ease-out') ])
    ])
  ]
})
export class PanelCmp {
  @Input('title') title = "";
  @Input() open = false;

  toggleOpen() {
    this.open = !this.open;
  }
} 
