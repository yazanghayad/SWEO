# @sweo/widget

Programmatic SDK for the SWEO AI chat widget. Use this package as an alternative to the `<script>` tag — works in React, Vue, vanilla JS, and any framework.

## Install

```bash
npm install @sweo/widget
```

## Quick Start — JavaScript / TypeScript

```ts
import { init } from '@sweo/widget';

const widget = await init({
  apiKey: 'your-api-key',
  apiUrl: 'https://your-instance.sweo.app',
});

widget.open();
widget.on('close', () => console.log('Chat closed'));
```

## Quick Start — React

### Component

```tsx
import { SweoWidget } from '@sweo/widget/react';

function App() {
  return <SweoWidget apiKey="your-api-key" apiUrl="https://your-instance.sweo.app" />;
}
```

### Hook

```tsx
import { useSweoWidget } from '@sweo/widget/react';

function ChatButton() {
  const { isReady, isOpen, toggle } = useSweoWidget({
    apiKey: 'your-api-key',
    apiUrl: 'https://your-instance.sweo.app',
  });

  return (
    <button onClick={toggle} disabled={!isReady}>
      {isOpen ? 'Close' : 'Open'} Chat
    </button>
  );
}
```

## API

### `init(options): Promise<ISweoWidget>`

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `apiKey` | `string` | Yes | Your tenant API key |
| `apiUrl` | `string` | Yes | Base URL of your SWEO instance |
| `autoOpen` | `boolean` | No | Open the widget immediately after loading (default: `false`) |
| `hideLauncher` | `boolean` | No | Hide the floating bubble button (default: `false`) |

### `ISweoWidget`

| Method | Description |
|--------|-------------|
| `open()` | Open the chat panel |
| `close()` | Close the chat panel |
| `toggle()` | Toggle open/close |
| `isOpen()` | Returns `true` if open |
| `destroy()` | Remove the widget from the DOM |
| `on(event, callback)` | Subscribe to an event |
| `off(event, callback)` | Unsubscribe |

### Events

| Event | Fired when |
|-------|-----------|
| `ready` | Widget loaded and ready |
| `open` | Chat panel opened |
| `close` | Chat panel closed |
| `destroy` | Widget removed from DOM |

### `getWidget(): ISweoWidget | null`

Returns the current widget instance, or `null` if not initialized.

## How It Works

The SDK loads the same chat widget script served by your SWEO instance. Under the hood, it injects a `<script>` tag and communicates via a lightweight bridge API. All widget configuration (colors, welcome message, AI settings, etc.) is loaded dynamically from your SWEO dashboard settings.

## License

MIT
