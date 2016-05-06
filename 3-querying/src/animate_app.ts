import {Component, group, query, snapshot, animate, style, restore, save} from 'angular2/core';

@Component({
  selector: 'animate-app',
  styles: [`
    .modal-overlay {
      display:none;
      position:fixed;
      top:0;
      right:0;
      left:0;
      bottom:0;
      background:rgba(0,0,0,0.5);
      z-index:100;
    }
    .modal-container {
      position:fixed;
      top:0;
      left:50%;
      width:600px;
      margin-left:-300px;
      border:10px solid black;
      background:white;
      z-index:500;
    }
    .modal-overlay.visible { display:block;  cursor:pointer; } 
  `],
  animations: {
    'ng-enter': [
      style({ opacity: 0, 'top':'-200px' }),
      query('.section', [style({ opacity: 0 })]),

      group([
        animate({ opacity: 1, top:'200px' }, '800ms 0ms cubic-bezier(0.68,-0.55,0.265,1.55)'),
        query('.section', [
          style({ opacity: 0, transform:'translateY(-100px) scale(1.1)' }),
          animate({ opacity: 1, transform:'translateY(0px) scale(1)' }, '700ms 200ms ease-out').stagger('100ms')
        ])
      ])
    ],
    'ng-leave': [
      style({ opacity:1, transform:'scale(1)' }),
      group([
        query('.section', [
          style({ opacity: 1, transform:'translateY(0px)' }),
          animate({ opacity: 0, transform:'translateY(-100px) scale(1.2)' }, '400ms ease-out').stagger('50ms')
        ]),
        animate({ opacity:0, transform: 'scale(1.5)' }, '600ms ease-out')
      ])
    ]
  },
  templateUrl: 'src/animate_app.html'
})
export class AnimateApp {
  public _modalOpen = false;
  public isModalOpen() { return this._modalOpen; }
  public openModal() { this._modalOpen = true; }
  public closeModal() { this._modalOpen = false; }
}
