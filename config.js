System.config({
  map: {
    '@angular': '/node_modules/@angular',
    'rxjs': 'https://npmcdn.com/rxjs@5.0.0-beta.6'
  },
  packages: {
    app: {
      main: './main.js',
      defaultExtension: 'js'
    },
    '@angular/core': {
      main: 'index'
    },
    '@angular/common': {
      main: 'index'
    },
    '@angular/compiler': {
      main: 'index'
    },
    '@angular/platform-browser': {
      main: 'index'
    }
  }
});
