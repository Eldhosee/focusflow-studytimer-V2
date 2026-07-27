import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatDurationShort } from '../../utils/time';

interface StudyBarChartProps {
  data: { label: string; seconds: number }[];
  color?: string;
}

export function StudyBarChart({ data, color = 'var(--color-amber)' }: StudyBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
        <XAxis
          dataKey="label"
          tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => (v > 0 ? `${Math.round(v / 60)}m` : '0')}
          width={36}
        />
        <Tooltip
          cursor={{ fill: 'rgba(255,255,255,0.04)' }}
          contentStyle={{
            background: '#151522',
            border: '1px solid #26263a',
            borderRadius: 12,
            fontSize: 12,
          }}
          labelStyle={{ color: 'var(--color-text-secondary)' }}
          formatter={(value) => [formatDurationShort(Number(value)), 'Studied']}
        />
        <Bar dataKey="seconds" radius={[6, 6, 6, 6]} fill={color} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}
