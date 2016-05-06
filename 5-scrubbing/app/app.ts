//our root app component
import {animation, style, animate, state, transition, Component, ViewContainerRef} from '@angular/core'

@Component({
  selector: 'my-app',
  providers: [],
  templateUrl: 'app/app.html',
  directives: [],
  styles: [`
    nav {
      color:white;
      background:black;
      padding:5px;
      position:fixed;
      top:0;
      right:0;
      left:0;
      z-index:100;
    }
    nav button {
      color:white;
      background:#aaa;
      padding:5px;
    }
    .box {
      position:absolute;
      width:150px;
      height:150px;
      background:red;
      border:10px solid black;
    }
  `],
  animations: [
    animation('boxAnimation', [
      state('void', style({ top: '0', left: '0' })),
      state('top', style({ top: '0', left: '0' })),
      state('bottom', style({ top: '400px', left: '400px' })),

      transition('top => bottom', [
        style({ 'background': 'red' }),
        animate(5000, [
          style({ 'background': 'blue', 'transform':'scale(1)' }),
          style({ 'transform': 'scale(1.5)', 'top':'200px' }),
          style({ 'transform': 'rotate(125deg)', 'left':'400px' }),
          style({ 'top':'400px', 'left':'400px', 'background': 'red', 'transform': 'scale(1)' })
        ])
      ]),

      transition('bottom => top', [animate(5000)])
    ])
  ]
})
export class App {
  private _boxState;
  private _listeners = [];
  public paused = false;
  public animationsRunning = true;

  constructor(private _ref: ViewContainerRef) {
    this.gotoTop();
    this._listeners.push(() => {
      alert('done');
    });
  }

  getPlayer(): any {
    try {
      return this._ref['_element'].parentView.viewChildren[0].activeAnimations['boxAnimation'];
    } catch(e) {
      return null;
    }
  }

  pauseAnimation() {
    var player = this.getPlayer();
    if (player) {
      player.pause();
    }
    this.paused = true;
  }

  resumeAnimation() {
    var player = this.getPlayer();
    if (player) {
      player.play();
    }
    this.paused = false;
  }

  togglePause() {
    var player = this.getPlayer();
    if (this.paused) {
      this.resumeAnimation();
    } else {
      this.pauseAnimation();
    }
  }

  get boxState() {
    return this._boxState;
  }

  gotoTop() {
    this._boxState = 'top';
    this.setupListener();
  }

  gotoBottom() {
    this._boxState = 'bottom';
    this.setupListener();
  }

  scrub(value) {
    this.pauseAnimation();
    value /= 100;
    var player = this.getPlayer();
    if (player) {
      player.setPosition(value);
    }
  }

  setupListener() {
    requestAnimationFrame(() => {
      var player = this.getPlayer();
      if (player) {
        this.animationsRunning = true;
        this.paused = false;
        player.onDone(() => {
          this.animationsRunning = false;
          this._listeners.forEach(listener => listener());
        });
      }
    });
  }
}
