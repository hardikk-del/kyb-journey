import { useState, useRef, useCallback, useEffect } from 'react';

export type UploadStatus = 'idle' | 'uploading' | 'verifying' | 'verified';

// Simulates an upload → verify → verified lifecycle with timers.
export function useUpload(initial: UploadStatus = 'idle') {
  const [status, setStatus] = useState<UploadStatus>(initial);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  useEffect(() => clear, []);

  const start = useCallback(() => {
    clear();
    setStatus('uploading');
    timers.current.push(setTimeout(() => setStatus('verifying'), 1000));
    timers.current.push(setTimeout(() => setStatus('verified'), 2200));
  }, []);

  const reset = useCallback(() => {
    clear();
    setStatus('idle');
  }, []);

  // Jump straight to a status — used when a sub-flow (e.g. live selfie capture)
  // has already run its own progress UI and just needs to report the result.
  const set = useCallback((next: UploadStatus) => {
    clear();
    setStatus(next);
  }, []);

  return { status, start, reset, set };
}
