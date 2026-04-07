type Listener = () => void;
export declare class EventEmitter {
    private listeners;
    on(event: string, fn: Listener): void;
    off(event: string, fn: Listener): void;
    emit(event: string): void;
    removeAll(): void;
}
export {};
