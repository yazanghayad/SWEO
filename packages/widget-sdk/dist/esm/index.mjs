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
function getWidget() {
  return instance;
}
export {
  getWidget,
  init
};
//# sourceMappingURL=index.mjs.map
