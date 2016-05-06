import {Component, snapshot, animate, style, restore, save} from 'angular2/core';

@Component({
  selector: 'animate-app',
  styles: [`
    button {
      padding:20px;
      background:#283593;
      font-size:14px;
      color:white;
      border:0;
      cursor:pointer;
      text-transform: uppercase;
    }

    div {
      height:200px;
      font-size:50px;
      border:2px solid black;
      width:200px;
      line-height:200px;
      display:inline-block;
      text-align:center;
      margin:10px;
    }
  `],
  animations: {
    'ng-enter': [
      save(['height','transform','background-color','opacity']),

      style('.rotated'),
      style('.invisible'),
      style('.white'),
      style({height: '0px'}),

      animate(['.visible', {height: '200px'}], '0.5s ease-out').stagger('middleOut', '40ms'),
      animate('.normal', '0.5s').stagger('40ms'),

      restore('0.5s').stagger('10ms')
    ],
    'ng-leave': [
      style('.silver'),
      style('.normal'),
      animate('.white', '0.5s').stagger('40ms'),
      style('.visible'),
      style({height: '200px'}),
      animate(['.invisible', '.rotated', {height: '0px'}], '0.5s ease-out').stagger('40ms')
    ]
  },
  animationStyles: {
    '.red': [
      ['all', {'background-color': 'maroon' }]
    ],
    '.white': [
      ['all', {'background-color': 'white' }]
    ],
    '.silver': [
      ['all', {'background-color': 'silver' }]
    ],
    '.rotated': [
      ['all', {'transform': 'rotate(180deg) translateX(100px) translateY(100px)' }]
    ],
    '.normal': [
      ['all', {'transform': 'rotate(0deg) scale(1.2)' }]
    ],
    '.invisible': [
      ['all', {'opacity': '0' }]
    ],
    '.visible': [
      ['all', {'opacity': '1' }]
    ]
  },
  template: `
    <button (click)="visible=!visible">Animate</button>
    <hr />
    <div *ngFor="#item of items, #i = index" [class]="makeClass(i)">
      {{ i + 1 }}
    </div>
  `
})
export class AnimateApp {
  _visible: boolean = false;
  items = [];

  get visible() {
    return this._visible;
  }

  makeClass(i) {
    return i % 2 == 0 ? 'red': 'silver';
  }

  set visible(bool) {
    this._visible = bool;
    if (this._visible) {
      this.items = [1,2,3,4,5,
                    6,7,8,9,10,
                    11,12,13,14,15,
                    16,17,18,19,20];
    } else {
      this.items = [];
    }
  }
}
