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
      background-position: center;
      background-size: cover;
      border-radius: 50%;
      transform-origin: 50% 50%;
    }
  `],
  animations: {
    'ng-enter': [
      save(['transform','opacity']),
      style('.invisible'),
      animate(['.normal', '.visible'], '0.15s ease-in').stagger('100ms'),
      restore('0.35s')
    ],
    'ng-leave': [
      animate(['.normal', '.invisible'], '0.25s ease-out').stagger('100ms')
    ]
  },
  animationStyles: {
    '.normal': [
      ['all', {'transform': 'scale(1.1)' }]
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
    <div *ngFor="#item of items, #i = index" [style.background-image]="'url(img/' + item.img + ')'">
    </div>
  `
})
export class AnimateApp {
  _visible: boolean = false;
  items = [];

  get visible() {
    return this._visible;
  }

  set visible(bool) {
    this._visible = bool;
    if (this._visible) {
      this.items = [
        { name: 'Darth Vader', img: 'darth-vader.jpg' },
        { name: 'Luke Skywalker', img: 'luke-skywalker.png' },
        { name: 'Han Solo', img: 'han-solo.jpg' }
      ];
    } else {
      this.items = [];
    }
  }
}
