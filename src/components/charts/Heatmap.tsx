import { useMemo, useState } from 'react';
import { formatDurationShort } from '../../utils/time';

interface HeatmapProps {
  grid: { date: string; seconds: number }[][];
}

function intensityColor(seconds: number, max: number): string {
  if (seconds === 0) return 'rgba(255,255,255,0.045)';

  const ratio = Math.min(1, seconds / Math.max(max, 1));
  const alpha = 0.2 + ratio * 0.8;

  return `color-mix(in srgb, var(--color-amber) ${alpha * 100}%, transparent)`;
}

export function Heatmap({ grid }: HeatmapProps) {
  const [hovered, setHovered] = useState<{ date: string; seconds: number } | null>(null);
  const max = useMemo(() => Math.max(1, ...grid.flat().map((c) => c.seconds)), [grid]);

  return (
    <div className="relative">
      <div className="flex gap-[3px] overflow-x-auto pb-2">
        {grid.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((cell) => (
              <div
                key={cell.date}
                onMouseEnter={() => setHovered(cell)}
                onMouseLeave={() => setHovered(null)}
                className="h-[11px] w-[11px] shrink-0 rounded-[3px] transition-transform hover:scale-125"
                style={{ backgroundColor: intensityColor(cell.seconds, max) }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-2 flex h-4 items-center text-xs text-[color:var(--color-text-muted)]">
        {hovered
          ? `${hovered.date} · ${hovered.seconds > 0 ? formatDurationShort(hovered.seconds) : 'No study time'}`
          : 'Hover a cell to see study time'}
      </div>
    </div>
  );
}
