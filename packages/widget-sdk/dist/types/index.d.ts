import type { SweoWidgetOptions, SweoWidgetEvent, SweoWidgetEventCallback, ISweoWidget } from './types';
export type { SweoWidgetOptions, SweoWidgetEvent, SweoWidgetEventCallback, ISweoWidget };
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
export declare function init(opts: SweoWidgetOptions): Promise<ISweoWidget>;
/** Get the current widget instance (or null if not initialized) */
export declare function getWidget(): ISweoWidget | null;
