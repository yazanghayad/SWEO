import { useEffect, useRef, useState, useCallback } from 'react';
import { init } from './index';
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
export function useSweoWidget(opts: SweoWidgetOptions) {
  const [isReady, setIsReady] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const widgetRef = useRef<ISweoWidget | null>(null);

  useEffect(() => {
    let destroyed = false;

    init(opts)
      .then((w) => {
        if (destroyed) {
          w.destroy();
          return;
        }
        widgetRef.current = w;
        setIsReady(true);
        setIsOpen(w.isOpen());

        w.on('open', () => setIsOpen(true));
        w.on('close', () => setIsOpen(false));
      })
      .catch((err) => {
        console.error(err);
      });

    return () => {
      destroyed = true;
      widgetRef.current?.destroy();
      widgetRef.current = null;
      setIsReady(false);
    };
    // Re-init only if credentials change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.apiKey, opts.apiUrl]);

  const open = useCallback(() => widgetRef.current?.open(), []);
  const close = useCallback(() => widgetRef.current?.close(), []);
  const toggle = useCallback(() => widgetRef.current?.toggle(), []);

  return {
    widget: widgetRef.current,
    isReady,
    isOpen,
    open,
    close,
    toggle
  };
}

/**
 * Declarative React component that initializes the SWEO chat widget.
 *
 * @example
 * ```tsx
 * <SweoWidget apiKey="your-key" apiUrl="https://your.sweo.app" />
 * ```
 */
export function SweoWidget(props: SweoWidgetOptions) {
  useSweoWidget(props);
  return null;
}
