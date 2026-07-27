import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { formatDurationShort } from '../../utils/time';

interface StudyBarChartProps {
  data: { label: string; seconds: number }[];
  color?: string;
}

export function StudyBarChart({
  data,
  color = 'var(--color-amber)',
}: StudyBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={170}>
      <BarChart
        data={data}
        margin={{
          top: 10,
          right: 8,
          left: 8,
          bottom: 4,
        }}
      >
        <XAxis
          dataKey="label"
          axisLine={false}
          tickLine={false}
          minTickGap={20}
          tick={{
            fill: 'var(--color-text-muted)',
            fontSize: 11,
          }}
        />

        {/* Hidden for Daily View */}
        <YAxis hide />

        <Tooltip
          cursor={false}
          contentStyle={{
            background: '#151522',
            border: '1px solid #26263a',
            borderRadius: 12,
            fontSize: 12,
          }}
          labelStyle={{
            color: 'var(--color-text-secondary)',
          }}
          formatter={(value) => [
            formatDurationShort(Number(value)),
            'Studied',
          ]}
        />

        <Bar
          dataKey="seconds"
          fill={color}
          radius={[6, 6, 0, 0]}
          maxBarSize={19}
          isAnimationActive={false}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}