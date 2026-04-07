import type { SweoWidgetOptions, ISweoWidget } from './types';
export type { SweoWidgetOptions, ISweoWidget };
/**
 * React hook to initialize and control the SWEO chat widget.
 *
 * @example
 * ```tsx
 * function App() {
 *   const { isReady, isOpen, toggle } = useSweoWidget({
 *     apiKey: 'your-api-key',
 *     apiUrl: 'https://your-instance.sweo.app',
 *   });
 *
 *   return <button onClick={toggle}>Toggle Chat</button>;
 * }
 * ```
 */
export declare function useSweoWidget(opts: SweoWidgetOptions): {
    widget: ISweoWidget | null;
    isReady: boolean;
    isOpen: boolean;
    open: () => void | undefined;
    close: () => void | undefined;
    toggle: () => void | undefined;
};
/**
 * Declarative React component that initializes the SWEO chat widget.
 *
 * @example
 * ```tsx
 * <SweoWidget apiKey="your-key" apiUrl="https://your.sweo.app" />
 * ```
 */
export declare function SweoWidget(props: SweoWidgetOptions): null;
