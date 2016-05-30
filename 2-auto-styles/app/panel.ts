import {Component, Input, Output, EventEmitter} from '@angular/core';
import {trigger, style, animate, state, transition} from '@angular/core'

@Component({
  selector: 'panel',
  templateUrl: 'app/panel.html',
  styleUrls: ['app/panel.css'],
  animations: [
    trigger('active', [
      state('void', style({ height: 0 })),
      state('closed', style({ height: 0 })),
      state('open', style({ height: '*' })),
      transition('void => closed', [ animate(0) ]),
      transition('closed => open', [ animate('350ms ease-out') ]),
      transition('open => closed', [ animate('350ms ease-out') ])
    ])
  ]
})
export class PanelCmp {
  @Input('title') title = "";
  @Input() open = false;
  @Output('onToggle') onToggle = new EventEmitter;

  toggleOpen() {
    this.open = !this.open;
    this.onToggle.next(null);
  }
} 
