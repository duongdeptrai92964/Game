// Anti-DevTools Protection - Vanilla JavaScript Version
// Converted from antidev.ts

(function () {
    'use strict';

    let isDevToolsOpen = false;
    let checkCount = 0;

    // Phát hiện và chặn Eruda, vConsole
    function detectMobileConsoles() {
        if (window.eruda) {
            window.eruda.destroy();
            delete window.eruda;
            return true;
        }

        if (window.VConsole || window.vConsole) {
            try {
                if (window.vConsole?.destroy) {
                    window.vConsole.destroy();
                }
                delete window.VConsole;
                delete window.vConsole;
            } catch (e) { }
            return true;
        }

        const erudaElements = document.querySelectorAll('[class*="eruda"], [id*="eruda"], [class*="vconsole"], [id*="vconsole"]');
        if (erudaElements.length > 0) {
            erudaElements.forEach(el => el.remove());
            return true;
        }

        const scripts = document.querySelectorAll('script[src*="eruda"], script[src*="vconsole"]');
        scripts.forEach(script => script.remove());

        return false;
    }

    // Block console injection
    function blockConsoleInjection() {
        const originalDefineProperty = Object.defineProperty;
        Object.defineProperty = function (obj, prop, descriptor) {
            if (typeof prop === 'string' && (prop.includes('eruda') || prop.includes('vConsole'))) {
                return obj;
            }
            return originalDefineProperty.call(this, obj, prop, descriptor);
        };

        const originalCreateElement = document.createElement.bind(document);
        document.createElement = function (tagName, options) {
            const element = originalCreateElement(tagName, options);
            if (tagName.toLowerCase() === 'script') {
                const originalSetAttribute = element.setAttribute.bind(element);
                element.setAttribute = function (name, value) {
                    if (name === 'src' && (value.includes('eruda') || value.includes('vconsole'))) {
                        return;
                    }
                    return originalSetAttribute(name, value);
                };
            }
            return element;
        };
    }

    // Handler khi phát hiện DevTools
    function handleDevToolsDetected() {
        if (!isDevToolsOpen) {
            isDevToolsOpen = true;
            window.location.replace('about:blank');
        }
    }

    // Chặn keyboard shortcuts
    function blockKeyboardShortcuts(e) {
        // F12
        if (e.key === 'F12' || e.keyCode === 123) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }

        // Ctrl+Shift+I/J/C
        if (e.ctrlKey && e.shiftKey && (
            e.key === 'I' || e.key === 'i' || e.keyCode === 73 ||
            e.key === 'J' || e.key === 'j' || e.keyCode === 74 ||
            e.key === 'C' || e.key === 'c' || e.keyCode === 67
        )) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }

        // Ctrl+U (View Source)
        if (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.keyCode === 85)) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }

        // Ctrl+S (Save)
        if (e.ctrlKey && (e.key === 's' || e.key === 'S' || e.keyCode === 83)) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }

        // Mac shortcuts
        if (e.metaKey && e.altKey && (
            e.key === 'i' || e.key === 'I' || e.keyCode === 73 ||
            e.key === 'j' || e.key === 'J' || e.keyCode === 74 ||
            e.key === 'c' || e.key === 'C' || e.keyCode === 67
        )) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }

    // Chặn context menu
    function blockContextMenu(e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }

    // Detect by window size
    function detectByWindowSize() {
        const threshold = 160;
        const widthThreshold = window.outerWidth - window.innerWidth > threshold;
        const heightThreshold = window.outerHeight - window.innerHeight > threshold;

        if (widthThreshold || heightThreshold) {
            checkCount++;
            if (checkCount > 2) {
                handleDevToolsDetected();
            }
        } else {
            checkCount = 0;
        }
    }

    // Detect by console.log
    function detectByConsoleLog() {
        const element = new Image();
        Object.defineProperty(element, 'id', {
            get: function () {
                handleDevToolsDetected();
                return '';
            }
        });
        console.log('%c', element);
        console.clear();
    }

    // Detect by RegExp
    function detectByRegExp() {
        const re = /./;
        re.toString = function () {
            handleDevToolsDetected();
            return '';
        };
        console.log('%c', re);
        console.clear();
    }

    // Detect Firebug
    function detectFirebug() {
        if (window.Firebug && window.Firebug.chrome && window.Firebug.chrome.isInitialized) {
            handleDevToolsDetected();
        }
    }

    // Disable console
    function disableConsole() {
        const noop = () => undefined;
        const methods = [
            'log', 'debug', 'info', 'warn', 'error', 'table', 'trace',
            'dir', 'dirxml', 'group', 'groupCollapsed', 'groupEnd',
            'time', 'timeEnd', 'timeLog', 'profile', 'profileEnd',
            'assert', 'count', 'countReset', 'clear'
        ];

        methods.forEach(method => {
            try {
                console[method] = noop;
            } catch (e) { }
        });
    }

    // Block text selection
    function blockTextSelection(e) {
        e.preventDefault();
        return false;
    }

    // Block drag
    function blockDragStart(e) {
        e.preventDefault();
        return false;
    }

    // Block clipboard
    function blockClipboard(e) {
        e.preventDefault();
        return false;
    }

    // Block print
    function blockPrint() {
        window.print = () => false;
    }

    // Initialize protection
    function init() {
        // Block console injection immediately
        blockConsoleInjection();

        // Add event listeners
        document.addEventListener('keydown', blockKeyboardShortcuts, true);
        document.addEventListener('keyup', blockKeyboardShortcuts, true);
        document.addEventListener('contextmenu', blockContextMenu, true);
        document.addEventListener('selectstart', blockTextSelection);
        document.addEventListener('dragstart', blockDragStart);
        document.addEventListener('copy', blockClipboard);
        document.addEventListener('cut', blockClipboard);
        document.addEventListener('paste', blockClipboard);

        blockPrint();

        // Run detection methods periodically
        setInterval(() => {
            detectByWindowSize();
            detectByConsoleLog();
            detectByRegExp();
            detectFirebug();
            detectMobileConsoles();
        }, 1000);

        // Disable console frequently
        setInterval(disableConsole, 500);

        // MutationObserver for eruda/vconsole injection
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node instanceof HTMLElement) {
                        const className = node.className?.toString?.() || '';
                        const id = node.id || '';
                        if (className.includes('eruda') || className.includes('vconsole') ||
                            id.includes('eruda') || id.includes('vconsole')) {
                            node.remove();
                        }
                    }
                    if (node instanceof HTMLScriptElement) {
                        const src = node.src || '';
                        if (src.includes('eruda') || src.includes('vconsole')) {
                            node.remove();
                        }
                    }
                });
            });
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });

        // CSS anti-select
        const style = document.createElement('style');
        style.textContent = `
            * {
                -webkit-user-select: none !important;
                -moz-user-select: none !important;
                -ms-user-select: none !important;
                user-select: none !important;
                -webkit-touch-callout: none !important;
            }
            input, textarea {
                -webkit-user-select: text !important;
                -moz-user-select: text !important;
                -ms-user-select: text !important;
                user-select: text !important;
            }
        `;
        document.head.appendChild(style);
    }

    // Auto-init when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
