System.config({
  map: {
    'rxjs': 'https://npmcdn.com/rxjs@5.0.0-beta.6',
    "@angular/core": "../../../lib/@angular/core/core.umd.js",
    "@angular/common": "../../../lib/@angular/common/common.umd.js",
    "@angular/compiler": "../../../lib/@angular/compiler/compiler.umd.js",
    "@angular/platform-browser": "../../../lib/@angular/platform-browser/platform-browser.umd.js",
    "@angular/platform-browser-dynamic": "../../../lib/@angular/platform-browser-dynamic/platform-browser-dynamic.umd.js"
  },
  packages: {
    'app': {
      main: './main.js',
      defaultExtension: 'js'
    }
  }
});
