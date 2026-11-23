type Listener = () => void;

/**
 * Patron Observer : état immuable + abonnements.
 * Compatible avec React.useSyncExternalStore.
 */
export class Observable<T> {
  private listeners = new Set<Listener>();

  constructor(protected state: T) {}

  getSnapshot = (): T => this.state;

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  protected setState(next: T | ((prev: T) => T)): void {
    this.state = typeof next === 'function' ? (next as (p: T) => T)(this.state) : next;
    this.listeners.forEach((l) => l());
  }
}
