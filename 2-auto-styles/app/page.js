"use strict";
var Page = (function () {
    function Page(title, content, links) {
        if (links === void 0) { links = []; }
        this.title = title;
        this.content = content;
        this.links = links;
    }
    return Page;
}());
exports.Page = Page;
