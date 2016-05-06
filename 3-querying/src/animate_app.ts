import {Component, group, query, snapshot, animate, style, restore, save} from 'angular2/core';

@Component({
  selector: 'animate-app',
  styles: [`
    :host {
      font-family: 'Helvetica Neue', sans-serif;
      display: block;
      text-align: center;
    }
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
      top:50px;
      left:50%;
      width:600px;
      margin-left:-300px;
      border:10px solid black;
      background:white;
      z-index:500;
      padding: 50px;
      box-sizing: border-box;
      text-align: left;
    }
    .modal-overlay.visible {
      display:block;
      cursor:pointer;
    } 
    header {
      background: #283593;
      color: white;
      padding: 15px;
    }
    .actions {
      text-align: right;
    }
    button {
      padding: 20px;
      background: #283593;
      color: white;
      border: none;
      font-size: 14px;
      text-transform: uppercase;
    }
    label {
      display: block;
      padding: 15px 0;
    }
    input, textarea {
      padding: 10px;
      font-size: 14px;
      border: 1px solid #283593;
      box-shadow: none;
      display: block;
      width: 100%;
      box-sizing: border-box;
    }
    textarea {
      height: 100px;
    }
  `],
  animations: {
    'ng-enter': [
      style({ opacity: 0, transform: 'scale(0)' }),
      query('.section', [style({ opacity: 0, transform: 'scale(0.8)' })]),

      group([
        animate({ opacity: 1, transform: 'scale(1)' }, '800ms 0ms cubic-bezier(0.68,-0.55,0.265,1.55)'),
        query('.section', [
          style({ opacity: 0, transform:'scale(0.8)' }),
          animate({ opacity: 1, transform:'scale(1.2)' }, '300ms 100ms ease-out').stagger('100ms'),
          animate({ transform:'scale(1)' }, '300ms ease-out')
        ])
      ])
    ],
    'ng-leave': [
      style({ opacity: 1, transform: 'scale(1)' }),
      group([
        query('.section', [
          style({ opacity: 1, transform:'scale(1)' }),
          animate({ opacity: 0, transform:'scale(0.8)' }, '400ms ease-out').stagger('50ms')
        ]),
        animate({ opacity:0, transform: 'scale(0.8)' }, '600ms ease-out')
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
