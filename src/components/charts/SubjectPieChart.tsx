import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { formatDurationShort } from '../../utils/time';

const COLORS = [
  '#4F8CFF', // Primary Blue
  '#7C83FD', // Violet
  '#5FD9A4', // Success Green
  '#38BDF8', // Sky Blue
  '#A78BFA', // Lavender
  '#22C55E', // Emerald
  '#60A5FA', // Light Blue
  '#93C5FD', // Soft Blue
];
interface SubjectPieChartProps {
  data: { subject: string; seconds: number }[];
}

export function SubjectPieChart({ data }: SubjectPieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          dataKey="seconds"
          nameKey="subject"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          strokeWidth={0}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: '#151522', border: '1px solid #26263a', borderRadius: 12, fontSize: 12 }}
          formatter={(value, name) => [formatDurationShort(Number(value)), String(name)]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export { COLORS as SUBJECT_COLORS };
