import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Piece {
  id: number;
  x: number;
  rotate: number;
  color: string;
  delay: number;
  drift: number;
}

const COLORS = ['#f2a94e', '#f6c07d', '#7c83fd', '#5fd9a4', '#e9707a'];

export function ConfettiBurst({ trigger }: { trigger: number }) {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    if (trigger === 0) return;
    const next = Array.from({ length: 40 }, (_, i) => ({
      id: trigger * 100 + i,
      x: Math.random() * 100,
      rotate: Math.random() * 360,
      color: COLORS[i % COLORS.length],
      delay: Math.random() * 0.3,
      drift: (Math.random() - 0.5) * 120,
    }));
    setPieces(next);
    const t = window.setTimeout(() => setPieces([]), 2200);
    return () => window.clearTimeout(t);
  }, [trigger]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[300] overflow-hidden">
      <AnimatePresence>
        {pieces.map((p) => (
          <motion.span
            key={p.id}
            initial={{ opacity: 1, y: -20, x: `${p.x}vw`, rotate: 0 }}
            animate={{ opacity: 0, y: '100vh', x: `calc(${p.x}vw + ${p.drift}px)`, rotate: p.rotate }}
            transition={{ duration: 1.8, delay: p.delay, ease: 'easeIn' }}
            className="absolute h-2.5 w-1.5 rounded-sm"
            style={{ backgroundColor: p.color, top: 0 }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
