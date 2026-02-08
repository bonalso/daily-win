'use client';

import { useEffect, useState } from 'react';

export default function Template({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 10);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={[
        'transition-all duration-300 ease-out',
        ready ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
      ].join(' ')}
    >
      {children}
    </div>
  );
}
