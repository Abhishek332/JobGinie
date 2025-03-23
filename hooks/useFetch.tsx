import { useState } from 'react';
import { toast } from 'sonner';

const useFetch = <T extends (...args: unknown[]) => Promise<unknown>>(
  cb: T,
) => {
  const [data, setData] = useState<unknown | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fn = async (...args: Parameters<T>) => {
    try {
      setLoading(true);
      setError(null);

      const res = await cb(...args);
      setData(res);
    } catch (error) {
      const e = error as Error;
      setError(e);
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fn, setData };
};

export default useFetch;
