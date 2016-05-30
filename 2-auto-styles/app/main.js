"use strict";
//main entry point
var platform_browser_1 = require('@angular/platform-browser');
var app_1 = require('./app');
platform_browser_1.bootstrap(app_1.App, [])
    .catch(function (err) { return console.error(err); });
