import { useState, useCallback } from 'react';

export function useForm<T extends Record<string, string>>(initialValues: T) {
  const [values, setValuesState] = useState<T>(initialValues);

  const setValue = useCallback((field: keyof T, value: string) => {
    setValuesState(prev => ({ ...prev, [field]: value }));
  }, []);

  const setValues = useCallback((partial: Partial<T>) => {
    setValuesState(prev => ({ ...prev, ...partial }));
  }, []);

  const reset = useCallback(() => {
    setValuesState(initialValues);
  }, [initialValues]);

  const resetWith = useCallback((newValues: T) => {
    setValuesState(newValues);
  }, []);

  return { values, setValue, setValues, reset, resetWith };
}
