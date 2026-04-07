"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/react.ts
var react_exports = {};
__export(react_exports, {
  SweoWidget: () => SweoWidget2,
  useSweoWidget: () => useSweoWidget
});
module.exports = __toCommonJS(react_exports);
var import_react = require("react");

// src/events.ts
var EventEmitter = class {
  constructor() {
    this.listeners = /* @__PURE__ */ new Map();
  }
  on(event, fn) {
    if (!this.listeners.has(event)) this.listeners.set(event, /* @__PURE__ */ new Set());
    this.listeners.get(event).add(fn);
  }
  off(event, fn) {
    this.listeners.get(event)?.delete(fn);
  }
  emit(event) {
    this.listeners.get(event)?.forEach((fn) => fn());
  }
  removeAll() {
    this.listeners.clear();
  }
};

// src/index.ts
var instance = null;
var SweoWidget = class {
  constructor(opts) {
    this.emitter = new EventEmitter();
    this.script = null;
    this.observer = null;
    this._ready = false;
    this.opts = opts;
  }
  async load() {
    if (this._ready) return;
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("@sweo/widget: Widget failed to initialize within 15s"));
      }, 15e3);
      const onReady = () => {
        clearTimeout(timeout);
        this._ready = true;
        this.emitter.emit("ready");
        this.setupObserver();
        if (this.opts.autoOpen) this.open();
        if (this.opts.hideLauncher) {
          document.getElementById("cw-bubble")?.style.setProperty("display", "none");
        }
        resolve();
      };
      window.addEventListener("sweo:widget:ready", onReady, { once: true });
      const script = document.createElement("script");
      const baseUrl = this.opts.apiUrl.replace(/\/$/, "");
      script.src = `${baseUrl}/api/widget/chat-widget.js`;
      script.setAttribute("data-api-key", this.opts.apiKey);
      script.setAttribute("data-api-url", baseUrl);
      script.async = true;
      script.onerror = () => {
        clearTimeout(timeout);
        window.removeEventListener("sweo:widget:ready", onReady);
        reject(new Error("@sweo/widget: Failed to load widget script"));
      };
      document.body.appendChild(script);
      this.script = script;
    });
  }
  setupObserver() {
    const panel = document.getElementById("cw-panel");
    if (!panel) return;
    let wasOpen = panel.classList.contains("open");
    this.observer = new MutationObserver(() => {
      const nowOpen = panel.classList.contains("open");
      if (nowOpen !== wasOpen) {
        wasOpen = nowOpen;
        this.emitter.emit(nowOpen ? "open" : "close");
      }
    });
    this.observer.observe(panel, { attributes: true, attributeFilter: ["class"] });
  }
  bridge() {
    if (!window.__sweoWidget) {
      throw new Error("@sweo/widget: Widget not initialized. Call init() first.");
    }
    return window.__sweoWidget;
  }
  open() {
    this.bridge().open();
  }
  close() {
    this.bridge().close();
  }
  toggle() {
    this.bridge().toggle();
  }
  isOpen() {
    return this.bridge().isOpen();
  }
  destroy() {
    this.observer?.disconnect();
    this.bridge().destroy();
    this.script?.remove();
    this.emitter.emit("destroy");
    this.emitter.removeAll();
    this._ready = false;
    instance = null;
  }
  on(event, cb) {
    this.emitter.on(event, cb);
  }
  off(event, cb) {
    this.emitter.off(event, cb);
  }
};
async function init(opts) {
  if (instance) return instance;
  const w = new SweoWidget(opts);
  instance = w;
  await w.load();
  return w;
}

// src/react.ts
function useSweoWidget(opts) {
  const [isReady, setIsReady] = (0, import_react.useState)(false);
  const [isOpen, setIsOpen] = (0, import_react.useState)(false);
  const widgetRef = (0, import_react.useRef)(null);
  (0, import_react.useEffect)(() => {
    let destroyed = false;
    init(opts).then((w) => {
      if (destroyed) {
        w.destroy();
        return;
      }
      widgetRef.current = w;
      setIsReady(true);
      setIsOpen(w.isOpen());
      w.on("open", () => setIsOpen(true));
      w.on("close", () => setIsOpen(false));
    }).catch((err) => {
      console.error(err);
    });
    return () => {
      destroyed = true;
      widgetRef.current?.destroy();
      widgetRef.current = null;
      setIsReady(false);
    };
  }, [opts.apiKey, opts.apiUrl]);
  const open = (0, import_react.useCallback)(() => widgetRef.current?.open(), []);
  const close = (0, import_react.useCallback)(() => widgetRef.current?.close(), []);
  const toggle = (0, import_react.useCallback)(() => widgetRef.current?.toggle(), []);
  return {
    widget: widgetRef.current,
    isReady,
    isOpen,
    open,
    close,
    toggle
  };
}
function SweoWidget2(props) {
  useSweoWidget(props);
  return null;
}
//# sourceMappingURL=react.cjs.map
