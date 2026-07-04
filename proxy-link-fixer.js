// ==UserScript==
// @name         Proxy Link Fixer
// @namespace    https://github.com/Jenich91/proxy-link-fixer
// @version      1.0
// @description  Подставляет оригинальный домен и путь в ссылки/формы внутри /proxy/http://...
// @author       Jenich91
// @license      MIT
// @match        http://*/*
// @match        https://*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(() => {
    'use strict';

    if (!location.pathname.startsWith('/proxy/')) return;

    const idx = location.href.indexOf('/proxy/');
    if (idx === -1) return;

    let base;
    try {
        base = new URL(location.href.slice(idx + 7));
    } catch (e) {
        return;
    }

    const PROXY_PREFIX = location.origin + '/proxy/';

    function fix(el, attr) {
        const val = el.getAttribute(attr);
        if (!val) return;
        if (/^(javascript:|#|mailto:|tel:)/i.test(val)) return;
        if (val.startsWith(PROXY_PREFIX)) return;

        try {
            const abs = new URL(val, base).href;
            el.setAttribute(attr, PROXY_PREFIX + abs);
        } catch (e) {}
    }

    function fixAll(root = document) {
        root.querySelectorAll('a[href]').forEach(a => fix(a, 'href'));
        root.querySelectorAll('form[action]').forEach(f => fix(f, 'action'));
    }

    fixAll();

    new MutationObserver(mutations => {
        for (const m of mutations) {
            m.addedNodes.forEach(node => {
                if (node.nodeType !== 1) return;
                if (node.matches?.('a[href]')) fix(node, 'href');
                if (node.matches?.('form[action]')) fix(node, 'action');
                fixAll(node);
            });
        }
    }).observe(document.documentElement, { childList: true, subtree: true });
})();
