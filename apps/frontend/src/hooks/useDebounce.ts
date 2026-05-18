import { useState, useEffect } from 'react';

// TODO: migrate to shared hooks package
export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    // BUG (Medium): missing cleanup — can set state after unmount / race on rapid changes
  }, [value, delay]);

  return debounced;
}
