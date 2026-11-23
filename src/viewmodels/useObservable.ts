import { useSyncExternalStore } from 'react';
import type { Observable } from '@/core/Observable';

export const useObservable = <T,>(o: Observable<T>): T => useSyncExternalStore(o.subscribe, o.getSnapshot);
