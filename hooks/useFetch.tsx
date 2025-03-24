import { useState } from 'react';
import { toast } from 'sonner';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useFetch = <T extends (...args: any[]) => Promise<any>>(cb: T) => {
  const [data, setData] = useState<Awaited<ReturnType<T>> | null>(null);
  const [loading, setLoading] = useState(false);
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
