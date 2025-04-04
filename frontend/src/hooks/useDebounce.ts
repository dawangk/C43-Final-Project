import { useEffect, useState } from "react";

export const useDebounceValue = <T>(value: T, interval: number) => {
  const [debounceValue, setDebounceValue] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounceValue(value), interval);
    return () => clearTimeout(id);
  }, [value, interval]);

  return debounceValue;
};
