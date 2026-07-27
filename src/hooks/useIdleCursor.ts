import { useEffect, useState } from 'react';

/** Returns whether the cursor should be hidden after `timeoutMs` of no mouse movement. */
export function useIdleCursor(timeoutMs = 3000) {
  const [isIdle, setIsIdle] = useState(false);

  useEffect(() => {
    let timer: number;
    const reset = () => {
      setIsIdle(false);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setIsIdle(true), timeoutMs);
    };
    reset();
    window.addEventListener('mousemove', reset);
    window.addEventListener('touchstart', reset);
    window.addEventListener('keydown', reset);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('mousemove', reset);
      window.removeEventListener('touchstart', reset);
      window.removeEventListener('keydown', reset);
    };
  }, [timeoutMs]);

  return isIdle;
}
