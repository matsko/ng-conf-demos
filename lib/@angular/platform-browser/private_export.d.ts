import * as dom_adapter from './src/dom/dom_adapter';
import * as browser_adapter from './src/browser/browser_adapter';
export declare namespace __platform_browser_private__ {
    type DomAdapter = dom_adapter.DomAdapter;
    var DomAdapter: typeof dom_adapter.DomAdapter;
    function getDOM(): DomAdapter;
    function setDOM(adapter: DomAdapter): void;
    var setRootDomAdapter: typeof dom_adapter.setRootDomAdapter;
    type BrowserDomAdapter = browser_adapter.BrowserDomAdapter;
    var BrowserDomAdapter: typeof browser_adapter.BrowserDomAdapter;
}
