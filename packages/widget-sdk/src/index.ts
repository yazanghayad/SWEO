import type {
  SweoWidgetOptions,
  SweoWidgetEvent,
  SweoWidgetEventCallback,
  ISweoWidget
} from './types';
import { EventEmitter } from './events';

export type {
  SweoWidgetOptions,
  SweoWidgetEvent,
  SweoWidgetEventCallback,
  ISweoWidget
};

declare global {
  interface Window {
    __sweoWidget?: {
      open(): void;
      close(): void;
      toggle(): void;
      isOpen(): boolean;
      destroy(): void;
    };
  }
}

let instance: SweoWidget | null = null;

class SweoWidget implements ISweoWidget {
  private emitter = new EventEmitter();
  private script: HTMLScriptElement | null = null;
  private observer: MutationObserver | null = null;
  private opts: SweoWidgetOptions;
  private _ready = false;

  constructor(opts: SweoWidgetOptions) {
    this.opts = opts;
  }

  async load(): Promise<void> {
    if (this._ready) return;

    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('@sweo/widget: Widget failed to initialize within 15s'));
      }, 15_000);

      const onReady = () => {
        clearTimeout(timeout);
        this._ready = true;
        this.emitter.emit('ready');
        this.setupObserver();
        if (this.opts.autoOpen) this.open();
        if (this.opts.hideLauncher) {
          document.getElementById('cw-bubble')?.style.setProperty('display', 'none');
        }
        resolve();
      };

      window.addEventListener('sweo:widget:ready', onReady, { once: true });

      const script = document.createElement('script');
      const baseUrl = this.opts.apiUrl.replace(/\/$/, '');
      script.src = `${baseUrl}/api/widget/chat-widget.js`;
      script.setAttribute('data-api-key', this.opts.apiKey);
      script.setAttribute('data-api-url', baseUrl);
      script.async = true;
      script.onerror = () => {
        clearTimeout(timeout);
        window.removeEventListener('sweo:widget:ready', onReady);
        reject(new Error('@sweo/widget: Failed to load widget script'));
      };

      document.body.appendChild(script);
      this.script = script;
    });
  }

  private setupObserver(): void {
    const panel = document.getElementById('cw-panel');
    if (!panel) return;

    let wasOpen = panel.classList.contains('open');
    this.observer = new MutationObserver(() => {
      const nowOpen = panel.classList.contains('open');
      if (nowOpen !== wasOpen) {
        wasOpen = nowOpen;
        this.emitter.emit(nowOpen ? 'open' : 'close');
      }
    });
    this.observer.observe(panel, { attributes: true, attributeFilter: ['class'] });
  }

  private bridge() {
    if (!window.__sweoWidget) {
      throw new Error('@sweo/widget: Widget not initialized. Call init() first.');
    }
    return window.__sweoWidget;
  }

  open(): void { this.bridge().open(); }
  close(): void { this.bridge().close(); }
  toggle(): void { this.bridge().toggle(); }
  isOpen(): boolean { return this.bridge().isOpen(); }

  destroy(): void {
    this.observer?.disconnect();
    this.bridge().destroy();
    this.script?.remove();
    this.emitter.emit('destroy');
    this.emitter.removeAll();
    this._ready = false;
    instance = null;
  }

  on(event: SweoWidgetEvent, cb: SweoWidgetEventCallback): void {
    this.emitter.on(event, cb);
  }

  off(event: SweoWidgetEvent, cb: SweoWidgetEventCallback): void {
    this.emitter.off(event, cb);
  }
}

/**
 * Initialize the SWEO chat widget.
 *
 * @example
 * ```ts
 * import { init } from '@sweo/widget';
 *
 * const widget = await init({
 *   apiKey: 'your-api-key',
 *   apiUrl: 'https://your-instance.sweo.app',
 * });
 *
 * widget.open();
 * widget.on('close', () => console.log('Widget closed'));
 * ```
 */
export async function init(opts: SweoWidgetOptions): Promise<ISweoWidget> {
  if (instance) return instance;
  const w = new SweoWidget(opts);
  instance = w;
  await w.load();
  return w;
}

/** Get the current widget instance (or null if not initialized) */
export function getWidget(): ISweoWidget | null {
  return instance;
}
