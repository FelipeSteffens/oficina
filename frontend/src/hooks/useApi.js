import { useState } from 'react';
import { getErrorMessage } from '../services/api.js';
import { useToast } from '../contexts/ToastContext.jsx';

/** Executa mutations com loading e feedback automático via toast. */
export function useMutation(action, { successMessage, errorMessage } = {}) {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  async function mutate(...args) {
    setLoading(true);
    try {
      const result = await action(...args);
      if (successMessage) toast.success(typeof successMessage === 'function' ? successMessage(result) : successMessage);
      return result;
    } catch (err) {
      toast.error(errorMessage || getErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { mutate, loading };
}

export default useMutation;
