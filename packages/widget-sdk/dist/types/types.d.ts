export interface SweoWidgetOptions {
    /** Your tenant API key (required) */
    apiKey: string;
    /** The base URL of your SWEO instance (required) */
    apiUrl: string;
    /** Auto-open the widget after initialization (default: false) */
    autoOpen?: boolean;
    /** Hide the default floating bubble (default: false) */
    hideLauncher?: boolean;
}
export type SweoWidgetEvent = 'ready' | 'open' | 'close' | 'destroy';
export type SweoWidgetEventCallback = () => void;
export interface ISweoWidget {
    /** Open the chat panel */
    open(): void;
    /** Close the chat panel */
    close(): void;
    /** Toggle the chat panel */
    toggle(): void;
    /** Returns true if the panel is currently open */
    isOpen(): boolean;
    /** Remove the widget from the DOM entirely */
    destroy(): void;
    /** Subscribe to an event */
    on(event: SweoWidgetEvent, callback: SweoWidgetEventCallback): void;
    /** Unsubscribe from an event */
    off(event: SweoWidgetEvent, callback: SweoWidgetEventCallback): void;
}
